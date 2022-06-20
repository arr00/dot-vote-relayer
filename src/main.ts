import { getWeb3 } from "./web3Manager";
import { getPendingTxs } from "./database/awaitingTxs";
import { probeProposal } from "./prober";
import {
    scheduleRelayForProposal,
    scheduleRelayForDelegate,
    startProbingTxs
} from "./scheduler";

process.on("SIGINT", terminate);

async function main() {
    startProbingTxs();
}

async function probeAndSchedule() {
    console.log("Probing");
    const [newProposals, pendingDelegations] = await probeProposal();
    console.log({newProposals});
    newProposals.map(async (proposal) => {
        await scheduleRelayForProposal(proposal);
    });
    if (pendingDelegations) await scheduleRelayForDelegate(); // Only call after scheduling proposal relays
}

function terminate() {
    console.log("Got your termination request, see yah!");
    process.exit(1);
}

main();

// async function hi() {
//     console.log("WE ARE EXECUTING!");
//     const web3 = await getWeb3();
//     console.log(await web3.eth.getBlockNumber());
//     console.log(await getPendingTxs());
// }

// executeAtBlock(Number(process.argv[2]), hi);

export { probeAndSchedule };
