import Web3 from "web3";
import fs from "fs";

const governorAbi = JSON.parse(
    fs.readFileSync(process.env.GOVERNOR_ABI_PATH, "utf8")
);
const tokenAbi = JSON.parse(
    fs.readFileSync(process.env.TOKEN_ABI_PATH, "utf8")
);

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
    web3Instance = new Web3(process.env.ETH_RPC);
    governor = new web3Instance.eth.Contract(
        governorAbi,
        process.env.GOVERNOR_ADDRESS
    );
    token = new web3Instance.eth.Contract(tokenAbi, process.env.TOKEN_ADDRESS);
    if (process.env.RELAYER_PK != null) {
        web3Instance.eth.accounts.wallet.add(process.env.RELAYER_PK);
        console.log("Account is " + web3Instance.eth.accounts.wallet[0].address);
    }
}

export { getWeb3 };
