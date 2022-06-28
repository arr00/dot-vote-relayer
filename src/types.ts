/**
 * Proposal Type which holds a `proposalId` and `endBlock`. Voting ends at `endBlock`
 */
type Proposal = {
    proposalId: number;
    endBlock: number;
};

export { Proposal };
