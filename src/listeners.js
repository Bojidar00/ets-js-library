import axios from "axios";
import { eventsContract, ticketControllerContract, ticketsContract } from "#contract";
import { fetchSingleEventMetadata, makeGatewayUrl } from "#ipfs.utils";

export function listenForNewEvent(callback, contract = eventsContract) {
  contract.on("EventCreated", async (eventId, metadataUri) => {
    const url = makeGatewayUrl(metadataUri);
    const eventMetadata = await axios.get(url);

    const membersData = await contract.getEventMembers(eventId);

    const data = {
      eventId,
      metadataUri,
      eventMetadata: eventMetadata.data,
    };

    await callback(data, membersData);
  });
}

export function listenForEventUpdate(callback, contract = eventsContract) {
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

export function listenForRoleGrant(callback, contract = eventsContract) {
  listenForRole("RoleGranted", contract, callback);
}

export function listenForRoleRevoke(callback, contract = eventsContract) {
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

export function listenForBoughtTicket(callback, contract = ticketControllerContract) {
  contract.on("TicketBought", async (ticketId, account) => {
    const data = {
      ticketId,
      account,
    };

    await callback(data);
  });
}

export function listenForRefundedTicket(callback, contract = ticketControllerContract) {
  contract.on("TicketRefunded", async (eventId, categoryId, ticketId, account) => {
    const data = {
      eventId,
      categoryId,
      ticketId,
      account,
    };

    await callback(data);
  });
}

export function listenForLockedTicked(callback, contract = ticketsContract) {
  contract.on("Locked", async (tokenId) => {
    const data = {
      tokenId,
    };

    await callback(data);
  });
}

export function listenForUnlockedTicket(callback, contract = ticketsContract) {
  contract.on("Unlocked", async (tokenId) => {
    const data = {
      tokenId,
    };

    await callback(data);
  });
}

export function listenForTicketTransfer(callback, contract = ticketsContract) {
  contract.on("Transfer", async (from, to, tokenId) => {
    const data = {
      from,
      to,
      tokenId,
    };

    await callback(data);
  });
}
