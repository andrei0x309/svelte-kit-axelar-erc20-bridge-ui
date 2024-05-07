import { EVMChainIds } from "$lib/utils/chains";
import BaseIcon from "./BaseIcon.svelte";
import EthereumIcon from "./EthereumIcon.svelte";
import FantomIcon from "./FantomIcon.svelte";
import PolygonIcon from "./PolygonIcon.svelte";
import BinanceIcon from "./BinanceIcon.svelte";

export const ChainIcons = {
    [EVMChainIds.ETHEREUM_MAINNET]: EthereumIcon,
    [EVMChainIds.POLYGON_MAINNET]: PolygonIcon,
    [EVMChainIds.FANTOM_TESTNET]: FantomIcon,
    [EVMChainIds.BSC_TESTNET]: BinanceIcon,
    [EVMChainIds.BASE_TESTNET]: BaseIcon,
    [EVMChainIds.BASE_MAINNET]: BaseIcon,
}
