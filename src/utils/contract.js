import { ethers } from "ethers";
import { NET_RPC_URL, EVENTS_CONTRACT_ADDRESS, ABI } from "#config";

const provider = ethers.getDefaultProvider(NET_RPC_URL);
const eventsContract = new ethers.Contract(EVENTS_CONTRACT_ADDRESS, ABI, provider);

export { provider, eventsContract };
