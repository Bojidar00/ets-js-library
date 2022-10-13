import schema from "#contract.config/EventFacet.json" assert { type: "json" };
import {
  EVENTS_CONTRACT_ADDRESS,
  NET_RPC_URL,
  NET_RPC_URL_ID,
  TOKEN_NAME,
  NET_LABEL,
} from "#contract.config/constants.cjs";

const ABI = schema.abi;
const IPFS_GATEWAY_PROVIDER_URL = "https://nftstorage.link/ipfs/";
const ETS_SERVER_URL = "http://127.0.0.1:1337";

export {
  ABI,
  IPFS_GATEWAY_PROVIDER_URL,
  ETS_SERVER_URL,
  EVENTS_CONTRACT_ADDRESS,
  NET_RPC_URL,
  NET_RPC_URL_ID,
  TOKEN_NAME,
  NET_LABEL,
};
