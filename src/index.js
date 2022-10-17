/* eslint-disable no-useless-catch */

import { ethers } from "ethers";
import axios from "axios";
import {
  uploadDataToIpfs,
  fetchEventsMetadata,
  deleteDataFromService,
  getIpfsUrl,
  makeGatewayUrl,
} from "#ipfs.utils";
import {
  ABI,
  ETS_SERVER_URL,
  EVENTS_CONTRACT_ADDRESS,
  NET_RPC_URL,
  NET_RPC_URL_ID,
  TOKEN_NAME,
  NET_LABEL,
} from "#config";

const provider = ethers.getDefaultProvider(NET_RPC_URL);
const eventsContract = new ethers.Contract(
  EVENTS_CONTRACT_ADDRESS,
  ABI,
  provider,
);

export async function createEvent(
  nftStorageApiKey,
  metadata,
  image,
  maxTicketPerClient,
) {
  try {
    const url = await uploadDataToIpfs(nftStorageApiKey, metadata, image);
    const tx = await eventsContract.populateTransaction.createEvent(
      maxTicketPerClient,
      url,
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
  const contract = new ethers.Contract(EVENTS_CONTRACT_ADDRESS, ABI, signer);
  const eventIds = await contract.fetchOwnedEvents();
  const events = await fetchEvents(eventIds);
  return events;
}

export async function removeEvent(eventId) {
  try {
    const tx = await eventsContract.populateTransaction.removeEvent(eventId);

    return tx;
  } catch (error) {
    throw error;
  }
}

export async function updateEvent(nftStorageApiKey, eventId, metadata, image) {
  try {
    const url = await uploadDataToIpfs(nftStorageApiKey, metadata, image);

    const tx = await eventsContract.populateTransaction.updateEventTokenUri(
      eventId,
      url,
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
    const tx = await eventsContract.populateTransaction.addTeamMember(
      eventId,
      role,
      address,
    );

    return tx;
  } catch (error) {
    throw error;
  }
}

export async function removeTeamMember(eventId, role, address) {
  try {
    const tx = await eventsContract.populateTransaction.removeTeamMember(
      eventId,
      role,
      address,
    );

    return tx;
  } catch (error) {
    throw error;
  }
}

export async function fetchCountriesFromServer(serverUrl = ETS_SERVER_URL) {
  try {
    const response = await axios.get(`${serverUrl}/api/v1/countries`);

    return response;
  } catch (error) {
    throw error;
  }
}

export async function fetchPlacesFromServer(
  country,
  serverUrl = ETS_SERVER_URL,
) {
  try {
    const response = await axios.post(`${serverUrl}/api/v1/places?country=${country}`);

    return response;
  } catch (error) {
    throw error;
  }
}

export async function fetchAllEventsFromServer(
  params,
  serverUrl = ETS_SERVER_URL,
) {
  try {
    const response = await axios.post(`${serverUrl}/api/v1/events`, params);

    return response;
  } catch (error) {
    throw error;
  }
}

export async function getEventMembers(eventId) {
  try {
    const members = await eventsContract.getEventMembers(eventId);

    return members;
  } catch (error) {
    throw error;
  }
}

export async function fetchAllEventIds() {
  const allEventIdsBN = await eventsContract.fetchAllEventIds();

  const allEventIds = allEventIdsBN.map((eventId) => eventId.toNumber());

  return allEventIds;
}

export function listenForNewEvent(models, insertData) {
  eventsContract.on("EventCreated", async (eventId, metadataUri) => {
    // Insert event to db
    const url = createGatewayUrl(metadataUri);
    const eventMetadata = await axios.get(url);

    const membersData = await getEventMembers(eventId);

    const data = {
      eventId,
      metadataUri,
      eventMetadata: eventMetadata.data,
    };

    await insertData(models, data, membersData);
  });
}

export function listenForEventUpdate(models, updateData) {
  eventsContract.on("MetadataUpdate", async (contractNftEventId) => {
    // Fetch Event NFT metadata
    const eventsMetadata = await fetchEvents([contractNftEventId]);

    const data = {
      eventId: ethers.BigNumber.from(contractNftEventId).toNumber(),
      eventMetadata: eventsMetadata[0],
    };

    // Update entry in db
    await updateData(models, data);
  });
}

export function listenForRoleGrant(models, addOrganizer) {
  eventsContract.on(
    "RoleGranted",
    async (contractNftEventId, role, account, sender) => {
      const data = {
        eventId: contractNftEventId,
        role,
        account,
        sender,
      };

      await addOrganizer(models, data);
    },
  );
}

export function listenForRoleRevoke(models, deleteOrganizer) {
  eventsContract.on(
    "RoleRevoked",
    async (contractNftEventId, role, account, sender) => {
      const data = {
        eventId: contractNftEventId,
        role,
        account,
        sender,
      };

      await deleteOrganizer(models, data);
    },
  );
}

export function createGatewayUrl(url) {
  try {
    const gatewayUrl = makeGatewayUrl(url);

    return gatewayUrl;
  } catch (error) {
    throw error;
  }
}

export { NET_RPC_URL, NET_RPC_URL_ID, TOKEN_NAME, NET_LABEL };
