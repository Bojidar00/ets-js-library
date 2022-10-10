import schema from "ets-contracts/artifacts/contracts/EventTicketingSystem.sol/EventTicketingSystem.json";
import {
  EVENT_TICKETING_SYSTEM_CONTRACT_ADDRESS,
  AVALANCHE_TESTNET_API,
} from "ets-contracts/config/index.config";
const ABI = schema.abi;
const IPFS_GATEWAY_PROVIDER_URL = "https://nftstorage.link/ipfs/";
const ETS_SERVER_URL = "http://127.0.0.1:1337";
export {
  AVALANCHE_TESTNET_API,
  EVENT_TICKETING_SYSTEM_CONTRACT_ADDRESS,
  ABI,
  IPFS_GATEWAY_PROVIDER_URL,
  ETS_SERVER_URL,
};
