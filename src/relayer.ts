import { getPendingTxs, transactionsExecuted } from "./database/awaitingTxs";
import { getWeb3 } from "./web3Manager";
import fs from "fs";
import path from "path";
import { sendMessage } from "./messager";

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
    for (const pendingTx of pendingTxs) {
        if (pendingTx.type == "vote") {
            // Ensure valid call
            const receipt = await governor.methods[
                process.env.GOVERNOR_GET_RECEIPT_FUNCTION
            ](pendingTx.proposalId, pendingTx.from).call();
            const noVote = !receipt[0] && receipt[1] == 0;
            if (!noVote) continue;

            calls.push({
                target: governor._address,
                callData: governor.methods[process.env.GOVERNOR_VOTE_FUNCTION](
                    pendingTx.proposalId,
                    pendingTx.support,
                    pendingTx.v,
                    pendingTx.r,
                    pendingTx.s
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
            await multicall.methods.aggregate(calls).call();

            await multicall.methods.aggregate(calls).send({
                from: web3.eth.accounts.wallet[0].address,
                gas: calls.length * 100000,
                maxFeePerGas: "100000000000",
                maxPriorityFeePerGas: "2000000000",
            }).on('transactionHash', async function (hash) {
                await sendMessage(
                    "Relay tx: https://etherscan.io/tx/" + hash
                );
            });

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
