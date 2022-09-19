import { ethers } from "ethers";
import {schema} from '../schema/EventTicketingSystem.js';

const AVALANCHE_TESTNET_API = "https://api.avax-test.network/ext/bc/C/rpc";
const EVENT_TICKETING_SYSTEM_CONTRACT_ADDRESS = "0x8Dd331A2F97d0623229017cefbE210C14AB8eaf8";
const provider = ethers.getDefaultProvider(AVALANCHE_TESTNET_API);
const ABI = schema.abi;
const eventTicketingSystemContract = new ethers.Contract(
  EVENT_TICKETING_SYSTEM_CONTRACT_ADDRESS,
  ABI,
  provider
);


export {
  eventTicketingSystemContract,
  provider,
  EVENT_TICKETING_SYSTEM_CONTRACT_ADDRESS,
  ABI
};
