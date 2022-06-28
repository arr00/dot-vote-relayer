import { getWeb3 } from "./web3Manager";
import { getPendingTxs } from "./database/awaitingTxs";
import { probeTransactions } from "./prober";
import {
    scheduleRelayForProposal,
    scheduleRelayForDelegate,
    startProbingTxs,
    executeAtBlock,
} from "./scheduler";

process.on("SIGINT", terminate);

async function main() {
    startProbingTxs();
}

async function probeAndSchedule() {
    console.log("Probing");
    const [newProposals, pendingDelegations] = await probeTransactions();
    newProposals.map(async (proposal) => {
        await scheduleRelayForProposal(proposal);
    });
    if (pendingDelegations) await scheduleRelayForDelegate(); // Only call after scheduling proposal relays
}

function terminate() {
    console.log("Got your termination request, see yah!");
    process.exit(0);
}

main();

export { probeAndSchedule };
