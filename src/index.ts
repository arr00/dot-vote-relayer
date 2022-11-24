import { main } from "./main";
import { RelayerConfiguration } from "./types";

let globalConfig: RelayerConfiguration;
export class Relayer {
    constructor(config: RelayerConfiguration) {
        if (
            config.ethRpcUrl &&
            config.governorAddress &&
            config.governorGetProposalFunction &&
            config.governorGetReceiptFunction &&
            config.governorVoteFunction &&
            config.mongoDbUrl &&
            config.relayerPk &&
            config.tokenAddress
        ) {
            globalConfig = config;
        } else {
            throw "Invalid config";
        }
    }

    /**
     * Starts the relayer
     */
    start() {
        main();
    }
}

export { globalConfig };
