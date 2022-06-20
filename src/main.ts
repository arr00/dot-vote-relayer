import { getWeb3 } from "./web3Manager";
import { getPendingTxs } from "./database/awaitingTxs";
import { probeProposal } from "./prober";
import { scheduleRelayForProposal } from "./scheduler";

async function main() {
    const newProposals = await probeProposal();
    newProposals.map((proposal) => {
        scheduleRelayForProposal(proposal);
    });
}

main();

// async function hi() {
//     console.log("WE ARE EXECUTING!");
//     const web3 = await getWeb3();
//     console.log(await web3.eth.getBlockNumber());
//     console.log(await getPendingTxs());
// }

// executeAtBlock(Number(process.argv[2]), hi);
