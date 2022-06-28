import { getPendingTxs } from "./database/awaitingTxs";
import { getWeb3 } from "./web3Manager";
import fs from "fs";
import axios from "axios";

const multicallAbi = JSON.parse(
    fs.readFileSync("../abis/multicall.abi", "utf8")
);

async function relay() {
    const [web3, governor, token] = await getWeb3();
    const multicall = new web3.eth.Contract(
        multicallAbi,
        "0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441"
    );

    const pendingTxs = await getPendingTxs();

    const calls = pendingTxs.map(function (pendingTx, index) {
        if (pendingTx.type == "Vote") {
            return {
                target: "0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441",
                calldata: governor.methods
                    .submitVoteBySignature(
                        pendingTx.proposalId,
                        pendingTx.support,
                        pendingTx.v,
                        pendingTx.r,
                        pendingTx.s
                    )
                    .endcodeABI(),
            };
        } else {
            // Delegate tx
            return {
                target: "0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441",
                calldata: token.methods
                    .delegateBySig(
                        pendingTx.delegatee,
                        pendingTx.nonce,
                        pendingTx.expiry,
                        pendingTx.v,
                        pendingTx.r,
                        pendingTx.s
                    )
                    .endcodeABI(),
            };
        }
    });

    const relayTx = await governor.methods
        .aggregate(calls)
        .send({ maxFeePerGas: 100000000000 });
    axios.get(
        process.env.NOTIFICATION_HOOK +
            "Relaying tx: https://etherscan.io/tx/" +
            relayTx.transactionHash
    );
}

export { relay };
