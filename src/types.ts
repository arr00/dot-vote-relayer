/**
 * Proposal Type which holds a `proposalId` and `endBlock`. Voting ends at `endBlock`
 */
type Proposal = {
    proposalId: number;
    endBlock: number;
};

type RelayerConfiguration = {
    ethRpcUrl: string;
    mongoDbUrl: string;
    governorAddress: string;
    tokenAddress: string;
    notificationHook?: string;
    governorVoteFunction: string;
    governorGetProposalFunction: string;
    governorGetReceiptFunction: string;
    relayerPk: string;
    relayAtBlocks?: number[];
};

export { Proposal, RelayerConfiguration };
