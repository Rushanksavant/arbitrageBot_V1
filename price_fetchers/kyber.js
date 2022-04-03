import ethers from "ethers";

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

// Storing all ABIs:
const ABIs = {
    kyberFactory_ABI: [
        'function getPoolAtIndex(address token0, address token1, uint256 index) view returns (address pool)',
        'function getPools(address token0, address token1) view returns (address[] _tokenPools)',
        'function getUnamplifiedPool(address, address) view returns (address)'
    ],
    kyberRouter_ABI: [
        'function getAmountsIn(uint256 amountOut, address[] poolsPath, address[] path) view returns (uint256[] amounts)',
        'function getAmountsOut(uint256 amountIn, address[] poolsPath, address[] path) view returns (uint256[] amounts)'
    ]
}

// Storing all addresses:
const ADDs = {
    kyberFactory_add: "0x833e4083B7ae46CeA85695c4f7ed25CDAd8886dE",
    kyberRouter_add: "0x1c87257f5e8609940bc751a07bb085bb7f8cdbe6"
}

// Pointers to Factory and Router Contracts
const kyberFactory = new ethers.Contract(ADDs.kyberFactory_add, ABIs.kyberFactory_ABI, provider);
const kyberRouter = new ethers.Contract(ADDs.kyberRouter_add, ABIs.kyberRouter_ABI, provider);

// ------------------------------------------ ETH - DAI ------------------------------------------ // 
const ETH_price_in_DAI = async () => {
    const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

    const pool0 = await kyberFactory.getPools(WETH, DAI);
    console.log("Kyber ETH-DAI pool -> ", pool0);

    const amount = await kyberRouter.getAmountsIn(1, pool0, [DAI, WETH])
    console.log(`1 WETH on kyber -> ${parseInt(amount[0]._hex)}  DAI`) // cost of 1 ETH is "amount" DAI
}
ETH_price_in_DAI()