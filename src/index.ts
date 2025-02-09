import { main } from "./main";
import { RelayerConfiguration } from "./types";

let globalConfig: RelayerConfiguration;
export class Relayer {
    constructor(config: RelayerConfiguration) {
        if (
            config.ethRpcUrl &&
            config.governorAddress &&
            config.governorGetProposalEndBlock &&
            config.governorGetReceiptFunction &&
            config.governorVoteFunction &&
            config.governorGetProposalState &&
            config.mongoDbUrl &&
            config.tokenAddress
        ) {
            globalConfig = config;
        } else {
            throw "Invalid config";
        }

        if (!(config.ozApiKey && config.ozApiKey) && !config.relayerPk) {
            throw "No Auth provided";
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
