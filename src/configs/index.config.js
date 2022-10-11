import { schema } from "../../config/EventFacet.js";
import {
  EVENT_TICKETING_SYSTEM_CONTRACT_ADDRESS,
  NET_RPC_URL,
} from "../../config/constants.cjs";
const ABI = schema.abi;
const IPFS_GATEWAY_PROVIDER_URL = "https://nftstorage.link/ipfs/";
const ETS_SERVER_URL = "http://127.0.0.1:1337";
export {
  NET_RPC_URL,
  EVENT_TICKETING_SYSTEM_CONTRACT_ADDRESS,
  ABI,
  IPFS_GATEWAY_PROVIDER_URL,
  ETS_SERVER_URL,
};
