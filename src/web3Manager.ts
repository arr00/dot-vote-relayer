import Web3 from "web3";
import dotenv from "dotenv";
dotenv.config();

let web3Insance;

/**
 * Returns an active web3 connection to the caller.
 * @returns web3 instance for web3 usage throughout the application
 */
async function getWeb3(): Promise<Web3> {
    if (web3Insance === undefined) {
        web3Insance = new Web3(process.env.ETH_RPC);
    }
    try {
        const networkId = await web3Insance.eth.net.getId();
        return web3Insance;
    } catch {
        console.log("Failed");
        web3Insance = new Web3(process.env.ETH_RPC);
        return getWeb3();
    }
}

export { getWeb3 };
