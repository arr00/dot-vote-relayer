import schedule from "node-schedule";
import { ToadScheduler, SimpleIntervalJob, AsyncTask } from "toad-scheduler";
import { getWeb3 } from "./web3Manager";
import { Proposal } from "./types";
import { relay } from "./relayer";
import { probeAndSchedule } from "./main";
import dotenv from "dotenv";
dotenv.config();

const toadScheduler = new ToadScheduler();

/**
 * Automatically probe and schedule txs every 4 hours via `probeAndSchedule`
 */
function startProbingTxs() {
    const task = new AsyncTask("probe transactions", probeAndSchedule);
    const job = new SimpleIntervalJob({ hours: 4, runImmediately: true }, task);

    toadScheduler.addSimpleIntervalJob(job);
}

/**
 * Schedule the relay execution for a proposal
 * @param proposal Proposal to schedule relay for. Relay time based on `endBlock`.
 */
async function scheduleRelayForProposal(proposal: Proposal) {
    await executeAtBlock(proposal.endBlock - 2000, relay);
}

/**
 * Ensure that there is a scheduled relay. If not schedule in a day.
 */
async function scheduleRelayForDelegate() {
    if (schedule.scheduledJobs.length > 0) return;

    // No relays scheduled, schedule for relay
    const executeAt = Date.now() + 60 * 60 * 24 * 1000; // Add one day
    console.log("Scheduling relay for epoch: " + executeAt);
    schedule.scheduleJob(new Date(executeAt), relay);
}

/**
 * Schedule the execution of an arbitrary function call at a block. Utilizies scheduling from `node-schedule`
 * @param atBlock Target block to execut func at
 * @param func Function to execute at block. Should be async function
 */
async function executeAtBlock(atBlock: number, func: () => Promise<void>) {
    console.log("Scheduling relay for block#: " + atBlock);
    const [web3] = await getWeb3();
    const currentBlock = await web3.eth.getBlockNumber();

    // Execute if block reached
    if (atBlock <= currentBlock) {
        await func();
        return;
    }

    // Reschedule O.W.
    const executeIn = (atBlock - currentBlock) * 12; // Conservative estimate of 12s per block
    const executeAt = new Date(Date.now() + executeIn * 1000);

    schedule.scheduleJob(executeAt, async function () {
        await executeAtBlock(atBlock, func);
    });
}

/**
 * Terminate schedulers gracefully
 */
async function scheduleTerminate() {
    toadScheduler.stop();
    await schedule.gracefulShutdown();
}

export {
    scheduleRelayForProposal,
    scheduleRelayForDelegate,
    startProbingTxs,
    executeAtBlock,
    scheduleTerminate
};
