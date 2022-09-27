import schema from "../../node_modules/event-ticketing-system/artifacts/contracts/EventTicketingSystem.sol/EventTicketingSystem.json";
const EVENT_TICKETING_SYSTEM_CONTRACT_ADDRESS =
  "0x8Dd331A2F97d0623229017cefbE210C14AB8eaf8";
const AVALANCHE_TESTNET_API = "https://api.avax-test.network/ext/bc/C/rpc";
const IPFS_GATEWAY_PROVIDER_URL = "https://nftstorage.link/ipfs/";
const ABI = schema.abi;
export {
  IPFS_GATEWAY_PROVIDER_URL,
  AVALANCHE_TESTNET_API,
  EVENT_TICKETING_SYSTEM_CONTRACT_ADDRESS,
  ABI,
};
