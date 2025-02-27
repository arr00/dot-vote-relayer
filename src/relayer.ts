import { getPendingTxs, transactionsExecuted } from "./database/awaitingTxs";
import { getWeb3 } from "./web3Manager";
import fs from "fs";
import path from "path";
import { sendMessage } from "./messager";
import { globalConfig } from "./index";
import { Relayer } from "defender-relay-client";

const multicallAbi = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../abis/multicall.abi"), "utf8")
);

/**
 * Relay pending transactions to the blockchain
 */
async function relay() {
    const [web3, governor, token] = await getWeb3();
    const multicallAddress = "0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441";
    const multicall = new web3.eth.Contract(multicallAbi, multicallAddress);

    const pendingTxs = await getPendingTxs();

    let calls: { target: string; callData: string }[] = [];
    for (let i = pendingTxs.length - 1; i >= 0; i--) {
        const pendingTx = pendingTxs[i];

        if (pendingTx.type == "vote") {
            // Ensure valid call
            const [receipt, state] = await Promise.all([
                governor.methods[globalConfig.governorGetReceiptFunction](
                    pendingTx.proposalId,
                    pendingTx.from
                ).call(),
                governor.methods[globalConfig.governorGetProposalState](
                    pendingTx.proposalId
                ).call(),
            ]);
            const noVote = !receipt; // Receipt is `hasVoted` for OZ governance
            if (!noVote) continue;
            if (state == (globalConfig.canceledProposalState ?? 2)) continue; // Mark votes on canceled proposals as executed
            if (state != (globalConfig.activeProposalState ?? 1)) {
                // Should only be pending proposal and will relay at a later point
                pendingTxs.splice(i, 1);
                continue;
            }

            calls.push({
                target: governor._address,
                callData: governor.methods[globalConfig.governorVoteFunction](
                    pendingTx.proposalId,
                    pendingTx.support,
                    pendingTx.from,
                    `${pendingTx.r}${pendingTx.s.substring(
                        2
                    )}${pendingTx.v.substring(2)}`
                ).encodeABI(),
            });
        } else if (pendingTx.type == "delegate") {
            // Ensure valid call
            const currentNonce: number = await token.methods
                .nonces(pendingTx.from)
                .call();
            if (currentNonce != Number(pendingTx.nonce)) continue;

            calls.push({
                target: token._address,
                callData: token.methods
                    .delegateBySig(
                        pendingTx.delegatee,
                        pendingTx.nonce,
                        pendingTx.expiry,
                        pendingTx.v,
                        pendingTx.r,
                        pendingTx.s
                    )
                    .encodeABI(),
            });
        }
    }

    if (calls !== undefined && calls.length > 0 && !calls.includes(null)) {
        try {
            // Ensure won't revert
            await multicall.methods
                .aggregate(calls)
                .call({ from: "0x2B384212EDc04Ae8bB41738D05BA20E33277bf33" });
            const gasLimit = await multicall.methods
                .aggregate(calls)
                .estimateGas({
                    from: "0x2B384212EDc04Ae8bB41738D05BA20E33277bf33",
                });

            const callData = await multicall.methods
                .aggregate(calls)
                .encodeABI();

            const tx = {
                to: multicall.options.address,
                value: 0,
                data: callData,
                maxFeePerGas: "100000000000",
                maxPriorityFeePerGas: "1000000000",
                gasLimit: Math.round(gasLimit * 1.2),
            };

            if (globalConfig.relayerPk) {
                await web3.eth
                    .sendTransaction(
                        Object.assign(tx, {
                            from: web3.eth.accounts.wallet[0].address,
                        })
                    )
                    .on("transactionHash", async function (hash) {
                        await sendMessage(
                            "Relay tx: https://etherscan.io/tx/" + hash
                        );
                    });
            } else {
                const credentials = {
                    apiKey: globalConfig.ozApiKey!,
                    apiSecret: globalConfig.ozApiSecret!,
                };

                const relayer = new Relayer(credentials);

                await relayer.sendTransaction(tx);
            }

            await sendMessage("Relay Confirmed");
            await transactionsExecuted(pendingTxs.map((tx) => tx._id));
        } catch (e) {
            await sendMessage("Relaying failed with error: " + e.message);
        }
    }

    // All txs are invalid, mark as relayed
    else if (calls.length == 0) {
        await transactionsExecuted(pendingTxs.map((tx) => tx._id));
    }
}

export { relay };
