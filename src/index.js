/* eslint-disable no-useless-catch */

import { ethers } from "ethers";
import axios from "axios";
import {
  uploadDataToIpfs,
  fetchEventsMetadata,
  fetchSingleEventMetadata,
  deleteDataFromService,
  getIpfsUrl,
  makeGatewayUrl,
} from "#ipfs.utils";
import { ETS_SERVER_URL, NET_RPC_URL, NET_RPC_URL_ID, TOKEN_NAME, NET_LABEL } from "#config";
import { provider, eventsContract } from "#contract";

export async function createEvent(nftStorageApiKey, metadata, contractData, contract = eventsContract) {
  try {
    const url = await uploadDataToIpfs(nftStorageApiKey, metadata);

    const tx = await contract.populateTransaction.createEvent(
      contractData.maxTicketPerClient,
      contractData.startDate,
      contractData.endDate,
      url,
    );

    return tx;
  } catch (error) {
    throw error;
  }
}

export async function fetchEvents(eventIds, contract = eventsContract) {
  try {
    const metadata = await fetchEventsMetadata(eventIds, contract);

    return metadata;
  } catch (error) {
    throw error;
  }
}

export async function fetchContractEvents(contract = eventsContract) {
  const events = await contract.fetchAllEvents();

  return events;
}

export async function fetchOwnedEvents(address, contract = eventsContract) {
  let signer;
  if (contract.provider._network.chainId === 1337) {
    // buddy ignore:line
    signer = address;
  } else {
    signer = new ethers.VoidSigner(address, provider);
  }

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

export async function updateEvent(nftStorageApiKey, eventId, metadata, contract = eventsContract) {
  try {
    const url = await uploadDataToIpfs(nftStorageApiKey, metadata);

    const tx = await contract.populateTransaction.updateEventTokenUri(eventId, url);

    return tx;
  } catch (error) {
    throw error;
  }
}

export async function getEventIpfsUri(eventId, contract = eventsContract) {
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

export async function addTeamMember(eventId, role, address, contract = eventsContract) {
  try {
    const tx = await contract.populateTransaction.addTeamMember(eventId, role, address);

    return tx;
  } catch (error) {
    throw error;
  }
}

export async function removeTeamMember(eventId, role, address, contract = eventsContract) {
  try {
    const tx = await contract.populateTransaction.removeTeamMember(eventId, role, address);

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

export async function fetchPlacesFromServer(country, serverUrl = ETS_SERVER_URL) {
  try {
    const response = await axios.get(`${serverUrl}/api/v1/places?country=${country}`);

    return response;
  } catch (error) {
    throw error;
  }
}

export async function fetchAllEventsFromServer(params, serverUrl = ETS_SERVER_URL) {
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
    const eventsMetadata = await fetchSingleEventMetadata(contractNftEventId);

    const data = {
      eventId: ethers.BigNumber.from(contractNftEventId).toNumber(),
      eventMetadata: eventsMetadata[0],
    };

    await callback(data);
  });
}

export function listenForRoleGrant(callback) {
  listenForRole("RoleGranted", callback);
}

export function listenForRoleRevoke(callback) {
  listenForRole("RoleRevoked", callback);
}

function listenForRole(contractEventName, callback) {
  eventsContract.on(contractEventName, async (contractNftEventId, role, account, sender) => {
    const data = {
      eventId: contractNftEventId,
      role,
      account,
      sender,
    };

    await callback(data);
  });
}

export function createGatewayUrl(url) {
  try {
    const gatewayUrl = makeGatewayUrl(url);

    return gatewayUrl;
  } catch (error) {
    throw error;
  }
}

export async function setEventCashier(eventId, address, contract = eventsContract) {
  try {
    const tx = await contract.populateTransaction.setEventCashier(eventId, address);
    return tx;
  } catch (error) {
    throw error;
  }
}

export async function createTicketCategory(
  nftStorageApiKey,
  eventId,
  metadata,
  contractData,
  contract = eventsContract,
) {
  try {
    const uri = await uploadDataToIpfs(nftStorageApiKey, metadata);
    const tx = await contract.populateTransaction.createTicketCategory(
      eventId,
      uri,
      contractData.saleStartDate,
      contractData.saleEndDate,
      contractData.ticketsCount,
      contractData.ticketPrice,
      contractData.discountsTicketsCount,
      contractData.discountsPercentage,
      contractData.downPayment,
    );
    return tx;
  } catch (error) {
    throw error;
  }
}

export async function updateCategory(
  nftStorageApiKey,
  eventId,
  categoryId,
  metadata,
  contractData,
  contract = eventsContract,
) {
  try {
    const uri = await uploadDataToIpfs(nftStorageApiKey, metadata);
    const tx = await contract.populateTransaction.updateCategory(
      eventId,
      categoryId,
      uri,
      contractData.ticketPrice,
      contractData.discountsTicketsCount,
      contractData.discountsPercentage,
      contractData.downPayment,
    );
    return tx;
  } catch (error) {
    throw error;
  }
}

export async function removeCategory(eventId, categoryId, contract = eventsContract) {
  try {
    const tx = await contract.populateTransaction.removeCategory(eventId, categoryId);
    return tx;
  } catch (error) {
    throw error;
  }
}

export async function addCategoryTicketsCount(eventId, categoryId, ticketsCount, contract = eventsContract) {
  try {
    const tx = await contract.populateTransaction.addCategoryTicketsCount(eventId, categoryId, ticketsCount);
    return tx;
  } catch (error) {
    throw error;
  }
}

export async function removeCategoryTicketsCount(eventId, categoryId, ticketsCount, contract = eventsContract) {
  try {
    const tx = await contract.populateTransaction.removeCategoryTicketsCount(eventId, categoryId, ticketsCount);
    return tx;
  } catch (error) {
    throw error;
  }
}

export async function startCategorySelling(eventId, categoryId, contract = eventsContract) {
  try {
    const tx = await contract.populateTransaction.startCategorySelling(eventId, categoryId);
    return tx;
  } catch (error) {
    throw error;
  }
}

export async function stopCategorySelling(eventId, categoryId, contract = eventsContract) {
  try {
    const tx = await contract.populateTransaction.stopCategorySelling(eventId, categoryId);
    return tx;
  } catch (error) {
    throw error;
  }
}

export async function startAllCategorySelling(eventId, contract = eventsContract) {
  try {
    const tx = await contract.populateTransaction.startAllCategorySelling(eventId);
    return tx;
  } catch (error) {
    throw error;
  }
}

export async function stopAllCategorySelling(eventId, contract = eventsContract) {
  try {
    const tx = await contract.populateTransaction.stopAllCategorySelling(eventId);
    return tx;
  } catch (error) {
    throw error;
  }
}

export async function fetchCategoriesByEventId(eventId, contract = eventsContract) {
  try {
    const categories = await contract.fetchCategoriesByEventId(eventId);
    return categories;
  } catch (error) {
    throw error;
  }
}

export async function clipTicket(eventId, categoryId, ticketId, contract = eventsContract) {
  try {
    const tx = await contract.populateTransaction.clipTicket(eventId, categoryId, ticketId);
    return tx;
  } catch (error) {
    throw error;
  }
}

export async function bookTickets(eventId, categoryId, ticketsCount, addresses, contract = eventsContract) {
  try {
    const tx = await contract.populateTransaction.bookTickets(eventId, categoryId, ticketsCount, addresses);
    return tx;
  } catch (error) {
    throw error;
  }
}

export async function updateCategorySaleDates(
  eventId,
  categoryId,
  saleStartDate,
  saleEndDate,
  contract = eventsContract,
) {
  try {
    const tx = await contract.populateTransaction.updateCategorySaleDates(
      eventId,
      categoryId,
      saleStartDate,
      saleEndDate,
    );
    return tx;
  } catch (error) {
    throw error;
  }
}

export { NET_RPC_URL, NET_RPC_URL_ID, TOKEN_NAME, NET_LABEL };
