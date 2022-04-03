const ethers = require("ethers")

// Setting up provider and signer
let provider;
let signer;
const setup = () => {
    provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/b4e8a43f00d34e7590cef3b3eb8c5b82");
    signer = provider.getSigner();
}
setup(); // calling

// To convert normal(JSON) ABI to Human Readable format 
function getHumanReadable_ABI(normal_ABI) {
    const iface = new ethers.utils.Interface(normal_ABI);
    console.log(iface.format(ethers.utils.FormatTypes.full));
}

// getHumanReadable_ABI(JSON ABI from etherscan at 0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95)
const uniswapV1factory_ABI = [
    'function getExchange(address token) view returns (address out)'
]

const uniswapV1factory_add = "0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95"
const uniswapV1factory = new ethers.Contract(uniswapV1factory_add, uniswapV1factory_ABI, provider);

// getHumanReadable_ABI(JSON ABI from etherscan at 0x09cabec1ead1c0ba254b09efb3ee13841712be14)
const uniswapExchange_ABI = [
    'function getEthToTokenInputPrice(uint256 eth_sold) view returns (uint256 out)',
    'function getEthToTokenOutputPrice(uint256 tokens_bought) view returns (uint256 out)',
    'function getTokenToEthInputPrice(uint256 tokens_sold) view returns (uint256 out)',
    'function getTokenToEthOutputPrice(uint256 eth_bought) view returns (uint256 out)'
]

const fetch = async () => {
    const DAI_add = "0x6b175474e89094c44da98b954eedeac495271d0f";
    const exchange_add = await uniswapV1factory.getExchange(DAI_add);
    console.log("UniswapV1 DAI excahnge -> ", exchange_add); // 0x2a1530C4C41db0B0b2bB646CB5Eb1A67b7158667
    const exchange_Contract = new ethers.Contract(exchange_add, uniswapExchange_ABI, provider);

    const DAIamount_for_1Ether = await exchange_Contract.getEthToTokenInputPrice(1); // that's price of eth in DAI (can be taken as price of ETH in ERC20 Token)

    console.log("DAI price on UniswapV1 -> ", parseInt(DAIamount_for_1Ether, 16))
}

fetch(); // calling