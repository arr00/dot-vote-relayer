/**
 * Proposal Type which holds a `proposalId` and `endBlock`. Voting ends at `endBlock`
 */
type Proposal = {
    proposalId: number;
    endBlock: number;
};

type RelayerConfiguration = {
    activeProposalState?: number;
    ethRpcUrl: string;
    mongoDbUrl: string;
    governorAddress: string;
    tokenAddress: string;
    notificationHook?: string;
    governorVoteFunction: string;
    governorGetProposalFunction: string;
    governorGetProposalState: string;
    governorGetReceiptFunction: string;
    ozApiKey?: string;
    ozApiSecret?: string;
    relayAtBlocks?: number[];
    relayerPk?: string;
};

export { Proposal, RelayerConfiguration };
