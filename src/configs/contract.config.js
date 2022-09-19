import { ethers } from "ethers";
import {schema} from '../schema/EventTicketingSystem.js';

const AVALANCHE_TESTNET_API = "https://api.avax-test.network/ext/bc/C/rpc";
const EVENT_TICKETING_SYSTEM_CONTRACT_ADDRESS = "0x687F6de4D6e398aCA20836469EfB1b7AC568b7B8";
const provider = ethers.getDefaultProvider(AVALANCHE_TESTNET_API);
const eventTicketingSystemContract = new ethers.Contract(
  EVENT_TICKETING_SYSTEM_CONTRACT_ADDRESS,
  schema.abi,
  provider
);

async function checkRemoveTransaction(address, eventId){
  let signer = new ethers.VoidSigner(address, provider);
  let contract = new ethers.Contract(  EVENT_TICKETING_SYSTEM_CONTRACT_ADDRESS, schema.abi, signer);
  let result = await contract.callStatic.removeEvent(eventId);
  return result;
}

export {
  eventTicketingSystemContract,
  checkRemoveTransaction,
};
