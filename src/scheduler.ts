import schedule from "node-schedule";
import { getWeb3 } from "./web3Manager";
import { Proposal } from "./types";
import { relay } from "./relayer";
import dotenv from "dotenv";
dotenv.config();

/**
 * Schedule the relay execution for a proposal
 * @param proposal Proposal to schedule relay for. Relay time based on `endBlock`.
 */
async function scheduleRelayForProposal(proposal: Proposal) {
    await executeAtBlock(proposal.endBlock - 2000, relay);
} 

/**
 * Schedule the execution of an arbitrary function call at a block. Utilizies scheduling from `node-schedule`
 * @param atBlock Target block to execut func at
 * @param func Function to execute at block. Should be async function
 */
async function executeAtBlock(atBlock: number, func: () => Promise<void>) {
    const web3 = await getWeb3();
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

export { scheduleRelayForProposal };
