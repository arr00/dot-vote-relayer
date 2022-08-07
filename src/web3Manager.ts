import Web3 from "web3";
import fs from "fs";
import { globalConfig } from "./index";

const governorAbi = JSON.parse(fs.readFileSync("./governor.abi", "utf8"));
const tokenAbi = JSON.parse(fs.readFileSync("./token.abi", "utf8"));

let web3Instance;
let governor;
let token;

/**
 * Returns an active web3 connection to the caller.
 * @returns web3 instance for web3 usage throughout the application
 */
async function getWeb3(): Promise<[Web3, any, any]> {
    if (web3Instance === undefined) {
        setWeb3();
    }
    try {
        const networkId = await web3Instance.eth.net.getId();
        return [web3Instance, governor, token];
    } catch {
        console.log("Failed");
        setWeb3();
        return getWeb3();
    }
}

function setWeb3() {
    web3Instance = new Web3(globalConfig.ethRpcUrl);
    governor = new web3Instance.eth.Contract(
        governorAbi,
        globalConfig.governorAddress
    );
    token = new web3Instance.eth.Contract(tokenAbi, globalConfig.tokenAddress);

    web3Instance.eth.accounts.wallet.add(globalConfig.relayerPk);
    console.log("Account is " + web3Instance.eth.accounts.wallet[0].address);
}

export { getWeb3 };
