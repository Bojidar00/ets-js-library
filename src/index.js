/* eslint-disable no-useless-catch */

import { ethers } from "ethers";
import axios from "axios";
import {
  uploadDataToIpfs,
  uploadArrayToIpfs,
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

export async function fetchEvent(eventId, contract = eventsContract) {
  try {
    const data = await fetchSingleEventMetadata(eventId, contract);
    return data;
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

export function listenForNewEvent(contract = eventsContract, callback) {
  contract.on("EventCreated", async (eventId, metadataUri) => {
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

export function listenForEventUpdate(contract = eventsContract, callback) {
  contract.on("MetadataUpdate", async (contractNftEventId) => {
    // Fetch Event NFT metadata
    const eventsMetadata = await fetchSingleEventMetadata(contractNftEventId);

    const data = {
      eventId: ethers.BigNumber.from(contractNftEventId).toNumber(),
      eventMetadata: eventsMetadata[0],
    };

    await callback(data);
  });
}

export function listenForRoleGrant(contract = eventsContract, callback) {
  listenForRole("RoleGranted", contract, callback);
}

export function listenForRoleRevoke(contract = eventsContract, callback) {
  listenForRole("RoleRevoked", contract, callback);
}

function listenForRole(contractEventName, contract, callback) {
  contract.on(contractEventName, async (contractNftEventId, role, account, sender) => {
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

export async function manageCategorySelling(eventId, categoryId, value, contract = eventsContract) {
  try {
    const tx = await contract.populateTransaction.manageCategorySelling(eventId, categoryId, value);
    return tx;
  } catch (error) {
    throw error;
  }
}

export async function manageAllCategorySelling(eventId, value, contract = eventsContract) {
  try {
    const tx = await contract.populateTransaction.manageAllCategorySelling(eventId, value);
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

export async function buyTicketsFromMultipleEvents(
  nftStorageApiKey,
  eventCategoryData,
  priceData,
  place,
  ticketsMetadata,
  contract = eventsContract,
) {
  try {
    const value = calculateTotalValue(priceData);
    const ticketUris = await uploadArrayToIpfs(nftStorageApiKey, ticketsMetadata);
    const buyTicketsFuncSig = "buyTickets((uint256,uint256)[],(uint256,uint256)[],(uint256,uint256)[],string[])";

    const tx = await contract.populateTransaction[buyTicketsFuncSig](eventCategoryData, priceData, place, ticketUris, {
      value,
    });
    return tx;
  } catch (error) {
    throw error;
  }
}

export async function buyTicketsFromSingleEvent(
  nftStorageApiKey,
  eventId,
  categoryId,
  priceData,
  place,
  ticketsMetadata,
  contract = eventsContract,
) {
  try {
    const value = calculateTotalValue(priceData);
    const ticketUris = await uploadArrayToIpfs(nftStorageApiKey, ticketsMetadata);
    const buyTicketsFuncSig = "buyTickets(uint256,uint256,(uint256,uint256)[],(uint256,uint256)[],string[])";

    const tx = await contract.populateTransaction[buyTicketsFuncSig](
      eventId,
      categoryId,
      priceData,
      place,
      ticketUris,
      { value },
    );
    return tx;
  } catch (error) {
    throw error;
  }
}

function calculateTotalValue(priceData) {
  let value = 0;

  for (let i = 0; i < priceData.length; i++) {
    value += priceData[i].amount * priceData[i].price;
  }

  return value;
}

export async function addRefundDeadline(eventId, refundData, contract = eventsContract) {
  try {
    const tx = await contract.populateTransaction.addRefundDeadline(eventId, refundData);
    return tx;
  } catch (error) {
    throw error;
  }
}

export async function returnTicket(ticketParams, contract = eventsContract) {
  try {
    const tx = await contract.populateTransaction.returnTicket(ticketParams);
    return tx;
  } catch (error) {
    throw error;
  }
}

export async function withdrawRefund(eventId, ticketId, contract = eventsContract) {
  try {
    const tx = await contract.populateTransaction.withdrawRefund(eventId, ticketId);
    return tx;
  } catch (error) {
    throw error;
  }
}

export async function withdrawContractBalance(eventId, contract = eventsContract) {
  try {
    const tx = await contract.populateTransaction.withdrawContractBalance(eventId);
    return tx;
  } catch (error) {
    throw error;
  }
}

export async function clipTicket(eventId, ticketId, contract = eventsContract) {
  try {
    const tx = await contract.populateTransaction.clipTicket(eventId, ticketId);
    return tx;
  } catch (error) {
    throw error;
  }
}

export async function bookTickets(
  nftStorageApiKey,
  eventId,
  categoryData,
  place,
  ticketsMetadata,
  contract = eventsContract,
) {
  try {
    const ticketUris = await uploadArrayToIpfs(nftStorageApiKey, ticketsMetadata);
    const tx = await contract.populateTransaction.bookTickets(eventId, categoryData, place, ticketUris);
    return tx;
  } catch (error) {
    throw error;
  }
}

export async function sendInvitation(eventId, ticketIds, accounts, contract = eventsContract) {
  try {
    const tx = await contract.populateTransaction.sendInvitation(eventId, ticketIds, accounts);
    return tx;
  } catch (error) {
    throw error;
  }
}

export async function getAddressTicketIdsByEvent(eventId, address, contract = eventsContract) {
  let signer;
  if (contract.provider._network.chainId === 1337) {
    // buddy ignore:line
    signer = address;
  } else {
    signer = new ethers.VoidSigner(address, provider);
  }

  try {
    const tickets = await contract.connect(signer).getAddressTicketIdsByEvent(eventId);
    return tickets;
  } catch (error) {
    throw error;
  }
}

export { NET_RPC_URL, NET_RPC_URL_ID, TOKEN_NAME, NET_LABEL };
