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
  contract = eventsContract,
) {
  try {
    const url = await uploadDataToIpfs(nftStorageApiKey, metadata, image);
    const tx = await contract.populateTransaction.createEvent(
      maxTicketPerClient,
      url,
    );
    return tx;
  } catch (error) {
    throw error;
  }
}

export async function fetchEvents(eventIds, contract) {
  try {
    const metadata = await fetchEventsMetadata(eventIds, contract);

    return metadata;
  } catch (error) {
    throw error;
  }
}

export async function fetchOwnedEvents(address, contract = eventsContract) {
  const signer = new ethers.VoidSigner(address, provider);
  const eventIds = await contract.connect(signer).fetchOwnedEvents();
  const events = await fetchEvents(eventIds, contract);
  return events;
}

export async function removeEvent(eventId, contract = eventsContract) {
  try {
    const tx = await contract.populateTransaction.removeEvent(eventId);

    return tx;
  } catch (error) {
    throw error;
  }
}

export async function updateEvent(
  nftStorageApiKey,
  eventId,
  metadata,
  image,
  contract = eventsContract,
) {
  try {
    const url = await uploadDataToIpfs(nftStorageApiKey, metadata, image);

    const tx = await contract.populateTransaction.updateEventTokenUri(
      eventId,
      url,
    );

    return tx;
  } catch (error) {
    throw error;
  }
}

export async function getEventIpfsUri(eventId, contract) {
  const uri = await getIpfsUrl(eventId, contract);

  return uri;
}

export async function deleteFromIpfs(nftStorageApiKey, ipfsUri) {
  try {
    await deleteDataFromService(nftStorageApiKey, ipfsUri);
  } catch (error) {
    throw error;
  }
}

export async function addTeamMember(
  eventId,
  role,
  address,
  contract = eventsContract,
) {
  try {
    const tx = await contract.populateTransaction.addTeamMember(
      eventId,
      role,
      address,
    );

    return tx;
  } catch (error) {
    throw error;
  }
}

export async function removeTeamMember(
  eventId,
  role,
  address,
  contract = eventsContract,
) {
  try {
    const tx = await contract.populateTransaction.removeTeamMember(
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
    const response = await axios.get(
      `${serverUrl}/api/v1/places?country=${country}`,
    );

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

export async function getEventMembers(eventId, contract = eventsContract) {
  try {
    const members = await contract.getEventMembers(eventId);

    return members;
  } catch (error) {
    throw error;
  }
}

export async function fetchAllEventIds(contract = eventsContract) {
  const allEventIdsBN = await contract.fetchAllEventIds();

  const allEventIds = allEventIdsBN.map((eventId) => eventId.toNumber());

  return allEventIds;
}

export function listenForNewEvent(callback) {
  eventsContract.on("EventCreated", async (eventId, metadataUri) => {
    const url = createGatewayUrl(metadataUri);
    const eventMetadata = await axios.get(url);

    const membersData = await getEventMembers(eventId);

    const data = {
      eventId,
      metadataUri,
      eventMetadata: eventMetadata.data,
    };

    await callback(data, membersData);
  });
}

export function listenForEventUpdate(callback) {
  eventsContract.on("MetadataUpdate", async (contractNftEventId) => {
    // Fetch Event NFT metadata
    const eventsMetadata = await fetchEvents([contractNftEventId]);

    const data = {
      eventId: ethers.BigNumber.from(contractNftEventId).toNumber(),
      eventMetadata: eventsMetadata[0],
    };

    await callback(data);
  });
}

export function listenForRoleGrant(callback) {
  eventsContract.on(
    "RoleGranted",
    async (contractNftEventId, role, account, sender) => {
      const data = {
        eventId: contractNftEventId,
        role,
        account,
        sender,
      };

      await callback(data);
    },
  );
}

export function listenForRoleRevoke(callback) {
  eventsContract.on(
    "RoleRevoked",
    async (contractNftEventId, role, account, sender) => {
      const data = {
        eventId: contractNftEventId,
        role,
        account,
        sender,
      };

      await callback(data);
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
