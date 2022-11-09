import { ethers } from "ethers";
import { NET_RPC_URL, EVENTS_CONTRACT_ADDRESS, TICKETS_CONTRACT_ADDRESS, ABI, TICKET_FACET_ABI } from "#config";

const provider = ethers.getDefaultProvider(NET_RPC_URL);
// TODO: Create new object with eventTicketControllerFacet's ABI
const eventsContract = new ethers.Contract(EVENTS_CONTRACT_ADDRESS, ABI, provider);
const ticketsContract = new ethers.Contract(TICKETS_CONTRACT_ADDRESS, TICKET_FACET_ABI, provider);

export { provider, eventsContract, ticketsContract };
