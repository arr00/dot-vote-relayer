import { probeTransactions } from "./prober";
import {
    scheduleRelayForProposal,
    scheduleRelayForDelegate,
    startProbingTxs,
    scheduleTerminate,
} from "./scheduler";

async function main() {
    process.on("SIGINT", terminate);
    startProbingTxs();
}

async function probeAndSchedule() {
    const [newProposals, pendingDelegations] = await probeTransactions();
    newProposals.map(async (proposal) => {
        await scheduleRelayForProposal(proposal);
    });
    if (pendingDelegations) await scheduleRelayForDelegate(); // Only call after scheduling proposal relays
}

async function terminate() {
    await scheduleTerminate();
    console.log("Dot-Vote-Relayer terminated");
    process.exit(0);
}

export { probeAndSchedule, main };
