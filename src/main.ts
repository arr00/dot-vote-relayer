import { probeTransactions } from "./prober";
import {
    scheduleRelayForProposal,
    scheduleRelayForDelegate,
    startProbingTxs,
    scheduleTerminate,
} from "./scheduler";
import { sendMessage } from "./messager";

async function main() {
    process.on("SIGINT", terminate);
    startProbingTxs();
}

/**
 * Probe for new proposals and schedule relay for new proposals and delegations
 */
async function probeAndSchedule() {
    const [newProposals, pendingDelegations] = await probeTransactions();
    for(const newProposal of newProposals) {
        await scheduleRelayForProposal(newProposal);
    }
    if (pendingDelegations) await scheduleRelayForDelegate(); // Only call after scheduling proposal relays
}

/**
 * Wind down process and terminate
 */
async function terminate() {
    await Promise.all([
        scheduleTerminate,
        sendMessage("Dot-Vote-Relayer terminating"),
    ]);
    console.log("Dot-Vote-Relayer terminated");
    process.exit(0);
}

export { probeAndSchedule, main };
