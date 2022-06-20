import { getPendingTxs } from "./database/awaitingTxs";
import { LocalStorage } from "node-localstorage";
import { getWeb3 } from "./web3Manager";
import { Proposal } from "./types";
import path from "path";
import fs from "fs";

const governorAbi = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../abis/governor.abi"), "utf8")
);
const localStorage = new LocalStorage("./local-storage");

/// Get seen proposals dictionary from local storage
function getSeenProposals(): { number: Proposal } {
    return JSON.parse(localStorage.getItem("seen-proposals")) ?? {};
}

/// Add a seen proposal to local storage
function addSeenProposal(proposal: Proposal) {
    let seenProposals = getSeenProposals();
    seenProposals[proposal.proposalId] = proposal;
    localStorage.setItem("seen-proposals", JSON.stringify(seenProposals));
}

/**
 * Probes database for new proposals and retrieves end block of new proposals
 * @returns Array of unseen proposal
 */
async function probeProposal(): Promise<[Proposal[], boolean]> {
    const web3 = await getWeb3();
    const governor = new web3.eth.Contract(
        governorAbi,
        process.env.GOVERNOR_ADDRESS
    );

    const seenProposals = getSeenProposals();
    let newProposals: Proposal[] = [];
    const pendingTxs = await getPendingTxs();
    let pendingDelegations = false;
    await Promise.all(
        pendingTxs.map(async (tx) => {
            if (!(tx.proposalId in seenProposals) && tx.type == "vote") {
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
                    endBlock: endBlock,
                };
                addSeenProposal(proposal);
                newProposals.push(proposal);
            } else if (tx.type == "delegate") {
                pendingDelegations = true;
            }
        })
    );
    return [newProposals, pendingDelegations];
}

export { probeProposal };
