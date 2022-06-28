import Web3 from "web3";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
dotenv.config();

const governorAbi = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../abis/governor.abi"), "utf8")
);
const tokenAbi = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../abis/token.abi"), "utf8")
);

let web3Insance;
let governor;
let token;

/**
 * Returns an active web3 connection to the caller.
 * @returns web3 instance for web3 usage throughout the application
 */
async function getWeb3(): Promise<[Web3, any, any]> {
    if (web3Insance === undefined) {
        setWeb3();
    }
    try {
        const networkId = await web3Insance.eth.net.getId();
        return [web3Insance, governor, token];
    } catch {
        console.log("Failed");
        setWeb3();
        return getWeb3();
    }
}

function setWeb3() {
    web3Insance = new Web3(process.env.ETH_RPC);
    governor = new web3Insance.eth.Contract(
        governorAbi,
        process.env.GOVERNOR_ADDRESS
    );
    token = new web3Insance.eth.Contract(tokenAbi, process.env.TOKEN_ADDRESS);
    if (process.env.RELAYER_PK != null) {
        web3Insance.eth.accounts.wallet.add(process.env.RELAYER_PK);
        console.log("Account is " + web3Insance.eth.accounts.wallet[0].address);
    }
}

export { getWeb3 };
