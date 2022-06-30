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

    const calls = pendingTxs.map(function (pendingTx) {
        if (pendingTx.type == "vote") {
            return {
                target: governor._address,
                calldata: governor.methods
                    .submitVoteBySignature(
                        pendingTx.proposalId,
                        pendingTx.support,
                        pendingTx.v,
                        pendingTx.r,
                        pendingTx.s
                    )
                    .encodeABI(),
            };
        } else if (pendingTx.type == "delegate") {
            return {
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
            };
        }
        // Return null if invalid type
        return null;
    });

    let relayTx = { transactionHash: "" };
    if (calls !== undefined && calls.length > 0 && !calls.includes(null)) {
        try {
            relayTx = await multicall.methods.aggregate(calls).send({
                from: web3.eth.accounts.wallet[0].address,
                gas: calls.length * 100000,
                maxFeePerGas: "100000000000",
                maxPriorityFeePerGas: "2000000000",
            });
            await transactionsExecuted(pendingTxs.map((tx) => tx._id));
        } catch (e) {
            await sendMessage("Relaying failed with error: " + e.message);
        }
    }

    await sendMessage(
        "Relaying tx: https://etherscan.io/tx/" + relayTx.transactionHash
    );
}

export { relay };
