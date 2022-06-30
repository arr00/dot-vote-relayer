import { getPendingTxs } from "./database/awaitingTxs";
import { getWeb3 } from "./web3Manager";
import { Proposal } from "./types";

let seenProposals: Set<number> = new Set();

/**
 * Probes database for new proposals and retrieves end block of new proposals
 * @returns Array of unseen proposal and if there is a pending delegation tx
 */
async function probeTransactions(): Promise<[Proposal[], boolean]> {
    const [web3, governor] = await getWeb3();

    let newProposals: Proposal[] = [];
    const pendingTxs = await getPendingTxs();
    let pendingDelegations = false;
    await Promise.all(
        pendingTxs.map(async (tx) => {
            if (tx.type == "vote" && !seenProposals.has(tx.proposalId)) {
                // New Proposal
                const endBlock = Number(
                    (
                        await governor.methods
                            .getProposalById(tx.proposalId)
                            .call()
                    ).endBlock
                );
                const proposal: Proposal = {
                    proposalId: tx.proposalId,
                    endBlock,
                };
                seenProposals.add(proposal.proposalId);
                newProposals.push(proposal);
            } else if (tx.type == "delegate") {
                pendingDelegations = true;
            }
        })
    );
    return [newProposals, pendingDelegations];
}

export { probeTransactions };
