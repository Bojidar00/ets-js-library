import {
  uploadDataToIpfs,
  fetchEventsMetadata,
  deleteDataFromService,
  getIpfsUrl,
} from "./utils/ipfs.utils.js";
import {
  AVALANCHE_TESTNET_API,
  EVENT_TICKETING_SYSTEM_CONTRACT_ADDRESS,
  ABI,
} from "./configs/contract.config.js";
import { ethers } from "ethers";
import axios from "axios";

const provider = ethers.getDefaultProvider(AVALANCHE_TESTNET_API);
const eventTicketingSystemContract = new ethers.Contract(
  EVENT_TICKETING_SYSTEM_CONTRACT_ADDRESS,
  ABI,
  provider
);

async function checkRemoveTransaction(address, eventId) {
  const signer = new ethers.VoidSigner(address, provider);
  const contract = new ethers.Contract(
    EVENT_TICKETING_SYSTEM_CONTRACT_ADDRESS,
    ABI,
    signer
  );
  const result = await contract.callStatic.removeEvent(eventId);
  return result;
}

async function checkUpdateTransaction(address, eventId) {
  const signer = new ethers.VoidSigner(address, provider);
  const contract = new ethers.Contract(
    EVENT_TICKETING_SYSTEM_CONTRACT_ADDRESS,
    ABI,
    signer
  );
  const result = await contract.callStatic.updateEventTokenUri(eventId, "");
  return result;
}

export async function createEvent(
  nftStorageApiKey,
  metadata,
  image,
  maxTicketPerClient
) {
  try {
    const url = await uploadDataToIpfs(nftStorageApiKey, metadata, image);
    const tx =
      await eventTicketingSystemContract.populateTransaction.createEvent(
        maxTicketPerClient,
        url
      );
    return tx;
  } catch (error) {
    throw error;
  }
}

export async function fetchEvents(eventIds) {
  try {
    const metadata = await fetchEventsMetadata(eventIds);

    return metadata;
  } catch (error) {
    throw error;
  }
}

export async function fetchOwnedEvents(address) {
  const signer = new ethers.VoidSigner(address, provider);
  const contract = new ethers.Contract(
    EVENT_TICKETING_SYSTEM_CONTRACT_ADDRESS,
    ABI,
    signer
  );
  const eventIds = await contract.fetchOwnedEvents();
  const events = await fetchEvents(eventIds);
  return events;
}

export async function removeEvent(eventId) {
  try {
    const tx =
      await eventTicketingSystemContract.populateTransaction.removeEvent(
        eventId
      );
    return tx;
  } catch (error) {
    throw error;
  }
}

export async function updateEvent(nftStorageApiKey, eventId, metadata, image) {
  try {
    const url = await uploadDataToIpfs(nftStorageApiKey, metadata, image);
    const tx =
      await eventTicketingSystemContract.populateTransaction.updateEventTokenUri(
        eventId,
        url
      );
    return tx;
  } catch (error) {
    throw error;
  }
}

export async function getEventIpfsUri(eventId) {
  const uri = await getIpfsUrl(eventId);
  return uri;
}

export async function deleteFromIpfs(nftStorageApiKey, ipfsUri) {
  try {
    await deleteDataFromService(nftStorageApiKey, ipfsUri);
  } catch (error) {
    throw error;
  }
}

export async function addTeamMember(eventId, role, address) {
  try {
    const tx =
      await eventTicketingSystemContract.populateTransaction.addTeamMember(
        eventId,
        role,
        address
      );
    return tx;
  } catch (error) {
    throw error;
  }
}

export async function removeTeamMember(eventId, role, address) {
  try {
    const tx =
      await eventTicketingSystemContract.populateTransaction.removeTeamMember(
        eventId,
        role,
        address
      );
    return tx;
  } catch (error) {
    throw error;
  }
}

export async function fetchCountriesFromServer(serverUrl, jwtSecret) {
  try {
    const response = await axios.get(`${serverUrl}/api/v1/countries`, {
      headers: { Authorization: `Bearer ${jwtSecret}` },
    });
    return response;
  } catch (error) {
    throw error;
  }
}

export async function fetchPlacesFromServer(serverUrl, jwtSecret, params) {
  try {
    const response = await axios.post(`${serverUrl}/api/v1/places`, params, {
      headers: { Authorization: `Bearer ${jwtSecret}` },
    });
    return response;
  } catch (error) {
    throw error;
  }
}

export async function fetchAllEventsFromServer(serverUrl, jwtSecret, params) {
  try {
    const response = await axios.post(`${serverUrl}/api/v1/events`, params, {
      headers: { Authorization: `Bearer ${jwtSecret}` },
    });
    return response;
  } catch (error) {
    throw error;
  }
}
