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
    // For Kyber //
    kyberFactory_ABI: [
        'function getPoolAtIndex(address token0, address token1, uint256 index) view returns (address pool)',
        'function getPools(address token0, address token1) view returns (address[] _tokenPools)',
        'function getUnamplifiedPool(address, address) view returns (address)'
    ],
    kyberRouter_ABI: [
        'function getAmountsIn(uint256 amountOut, address[] poolsPath, address[] path) view returns (uint256[] amounts)',
        'function getAmountsOut(uint256 amountIn, address[] poolsPath, address[] path) view returns (uint256[] amounts)'
    ],

    // For Uniswap //
    uniswapV2Factory_ABI: [
        'function getPair(address, address) view returns (address)'
    ],
    Dai_ETH_ABI: [ // Uniswap DAI-ETH pair abi (@ uniswapV2Factory.getPair(DAI, WETH))
        'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)'
    ],
    uniswapV2Router2_ABI: [
        'function getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut) pure returns (uint256 amountIn)',
        'function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) pure returns (uint256 amountOut)',
        'function getAmountsIn(uint256 amountOut, address[] path) view returns (uint256[] amounts)',
        'function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)'
    ]
}

// Storing all addresses:
const ADDs = {
    // For Kyber //
    kyberFactory_add: "0x833e4083B7ae46CeA85695c4f7ed25CDAd8886dE",
    kyberRouter_add: "0x1c87257f5e8609940bc751a07bb085bb7f8cdbe6",

    // For Uniswap //
    uniswapV2Factory_add: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    uniswapV2Router2_add: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
}

// Pointers to Factory and Router Contracts
const kyberFactory = new ethers.Contract(ADDs.kyberFactory_add, ABIs.kyberFactory_ABI, provider);
const kyberRouter = new ethers.Contract(ADDs.kyberRouter_add, ABIs.kyberRouter_ABI, provider);

const uniswapV2Factory = new ethers.Contract(ADDs.uniswapV2Factory_add, ABIs.uniswapV2Factory_ABI, provider);
const uniswapV2Router2 = new ethers.Contract(ADDs.uniswapV2Router2_add, ABIs.uniswapV2Router2_ABI, provider)

// Price tracker:
let tracker = {
    // For Kyber:
    "kyber_ETH_price_in_DAI": 0,

    // For Uniswap:
    "uni_ETH_price_in_DAI": 0
}

// ------------------------------------------ Kybber: ETH - DAI ------------------------------------------ // 
const kyber_ETH_price_in_DAI = async () => {
    const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

    const pool0 = await kyberFactory.getPools(WETH, DAI);
    // console.log("Kyber ETH-DAI pool -> ", pool0);

    const amount = await kyberRouter.getAmountsIn(1, pool0, [DAI, WETH])

    tracker["kyber_ETH_price_in_DAI"] = parseInt(amount[0]._hex);
    // console.log(`1 WETH on kyber -> ${parseInt(amount[0]._hex)}  DAI`) // cost of 1 ETH is "amount" DAI
}

// ------------------------------------------ Uniswap: ETH - DAI ------------------------------------------ // 
const uni_ETH_price_in_DAI = async () => {
    const Dai_ETH_add = await uniswapV2Factory.getPair(ADDs.DAI, ADDs.WETH);
    // console.log("UniswapV2 Pair(DAI - WETH) -> ", Dai_ETH_add); // we will need it's abi(at Dai_ETH pair address) to get Dai_ETH contract 

    const Dai_ETH_Pair = new ethers.Contract(Dai_ETH_add, ABIs.Dai_ETH_ABI, provider)
    const Reserves = await Dai_ETH_Pair.getReserves();
    // console.log(Reserves)

    const reserve0 = parseInt(Reserves[0]._hex);
    const reserve1 = parseInt(Reserves[1]._hex);
    // console.log("Reserve(0) DAI -> ", reserve0);
    // console.log("Reserve(1) ETH -> ", reserve1);

    // const uniswapV2Router2 = (uniswapV2Router2_add, uniswapV2Router2_ABI, signer)
    const maxAmount = await uniswapV2Router2.getAmountIn(1, Reserves[0], Reserves[1]); // amount of ETH for 1 DAI

    tracker["uni_ETH_price_in_DAI"] = parseInt(maxAmount);
    // console.log(`1 WETH on Uniswap ->  ${parseInt(maxAmount)} DAI`)
}

// comparison:
const comparison = async () => {
    await kyber_ETH_price_in_DAI()
    await uni_ETH_price_in_DAI()
    console.log(tracker)
}
comparison()