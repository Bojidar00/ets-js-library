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
  provider
);

export async function createEvent(
  nftStorageApiKey,
  metadata,
  image,
  maxTicketPerClient
) {
  try {
    const url = await uploadDataToIpfs(nftStorageApiKey, metadata, image);
    const tx = await eventsContract.populateTransaction.createEvent(
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
    const tx = await eventsContract.populateTransaction.addTeamMember(
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
    const tx = await eventsContract.populateTransaction.removeTeamMember(
      eventId,
      role,
      address
    );
    return tx;
  } catch (error) {
    throw error;
  }
}

export async function fetchJwtFromServer(params, serverUrl = ETS_SERVER_URL) {
  try {
    const response = await axios.post(`${serverUrl}/api/token`, params);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function fetchCountriesFromServer(
  jwtSecret,
  serverUrl = ETS_SERVER_URL
) {
  try {
    const response = await axios.get(`${serverUrl}/api/v1/countries`, {
      headers: { Authorization: `Bearer ${jwtSecret}` },
    });
    return response;
  } catch (error) {
    throw error;
  }
}

export async function fetchPlacesFromServer(
  jwtSecret,
  params,
  serverUrl = ETS_SERVER_URL
) {
  try {
    const response = await axios.post(`${serverUrl}/api/v1/places`, params, {
      headers: { Authorization: `Bearer ${jwtSecret}` },
    });
    return response;
  } catch (error) {
    throw error;
  }
}

export async function fetchAllEventsFromServer(
  jwtSecret,
  params,
  serverUrl = ETS_SERVER_URL
) {
  try {
    const response = await axios.post(`${serverUrl}/api/v1/events`, params, {
      headers: { Authorization: `Bearer ${jwtSecret}` },
    });
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

export function listenForNewEvent(
  eventModel,
  countryModel,
  tagModel,
  placeModel,
  eventTagModel,
  organizerModel,
  eventOrganizerModel,
  logger,
  insertData
) {
  logger.info("Listening for new events...");
  eventsContract.on("EventCreated", async (eventId, metadataUri) => {
    logger.info(`New event with ${eventId} is created`);

    // Insert event to db
    const url = createGatewayUrl(metadataUri);
    const eventMetadata = await axios.get(url);

    const membersData = await getEventMembers(eventId);

    await insertData(
      eventModel,
      countryModel,
      tagModel,
      placeModel,
      eventTagModel,
      organizerModel,
      eventOrganizerModel,
      eventMetadata.data,
      eventId,
      metadataUri,
      membersData
    );
  });
}

export function listenForEventUpdate(
  eventModel,
  countryModel,
  tagModel,
  placeModel,
  eventTagModel,
  logger,
  updateData
) {
  logger.info("Listening for update events...");

  eventsContract.on("MetadataUpdate", async (contractNftEventId) => {
    logger.info(`Event with contract id ${contractNftEventId} is updated`);

    // Fetch Event NFT metadata
    const eventsMetadata = await fetchEvents([contractNftEventId]);

    // Update entry in db
    await updateData(
      eventModel,
      countryModel,
      tagModel,
      placeModel,
      eventTagModel,
      ethers.BigNumber.from(contractNftEventId).toNumber(),
      eventsMetadata[0],
      eventsMetadata[0].cid
    );
  });
}

export function listenForRoleGrant(
  eventModel,
  organizerModel,
  eventOrganizerModel,
  logger,
  addOrganizer
) {
  logger.info("Listening for role grant events...");

  eventsContract.on(
    "RoleGranted",
    async (contractNftEventId, role, account, sender) => {
      logger.info(
        `${account} is granted with ${role} for event with id ${contractNftEventId} from ${sender}`
      );

      await addOrganizer(eventModel, organizerModel, eventOrganizerModel, {
        contractNftEventId,
        role,
        account,
      });
    }
  );
}

export function listenForRoleRevoke(
  eventModel,
  organizerModel,
  eventOrganizerModel,
  logger,
  deleteOrganizer
) {
  logger.info("Listening for role revoke events...");

  eventsContract.on(
    "RoleRevoked",
    async (contractNftEventId, role, account, sender) => {
      logger.info(
        `${account}'s role ${role} is revoked for event with id ${contractNftEventId} from ${sender}`
      );

      await deleteOrganizer(eventModel, organizerModel, eventOrganizerModel, {
        contractNftEventId,
        role,
        account,
      });
    }
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
