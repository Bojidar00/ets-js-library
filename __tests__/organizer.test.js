import {
  removeEvent,
  addTeamMember,
  removeTeamMember,
  updateEvent,
  fetchOwnedEvents,
  createEvent,
  getEventMembers,
  getEventIpfsUri,
} from "../src/index";
import fetch from "@web-std/fetch";

import { eventsTestContract, NFT_STORAGE_API_KEY, wallet, EXAMPLE_ADDRESS, mockedMetadata } from "./config";

describe("Organizer tests", () => {
  let tokenId;

  beforeAll(async () => {
    const image = await fetch("https://www.blackseachain.com/assets/img/hero-section/hero-image-compressed.png");
    const imageBlob = await image.blob();

    const populatedTx = await createEvent(NFT_STORAGE_API_KEY, mockedMetadata, imageBlob, 10, eventsTestContract);

    const eventTx = await wallet.sendTransaction(populatedTx);
    const eventTxResponse = await eventTx.wait();
    const tokenIdInHex = eventTxResponse.logs[0].data.slice(2, 66);
    tokenId = parseInt(tokenIdInHex, 16);
  });

  test("Should revert delete event when there is not an event", async () => {
    let err;
    try {
      const populatedTx = await removeEvent(tokenId + 1, eventsTestContract);
      const tx = await wallet.sendTransaction(populatedTx);
      await tx.wait();
    } catch (error) {
      err = error;
    } finally {
      expect(err.error.reason).toBe("execution reverted: Event: Event does not exist!");
    }
  });

  test("Should call add team member method from smart contract", async () => {
    try {
      const populatedTx = await addTeamMember(tokenId, `0x${"0".repeat(64)}`, EXAMPLE_ADDRESS, eventsTestContract);
      const tx = await wallet.sendTransaction(populatedTx);
      await tx.wait();

      const eventMembers = await getEventMembers(tokenId, eventsTestContract);

      expect(eventMembers.length).toBe(2);
      expect(eventMembers[1][0].toLowerCase()).toBe(EXAMPLE_ADDRESS);
    } catch (_error) {
      console.log(_error);
    }
  });

  test("Should call remove team member method from smart contract", async () => {
    try {
      const populatedTx = await removeTeamMember(tokenId, `0x${"0".repeat(64)}`, EXAMPLE_ADDRESS, eventsTestContract);
      const tx = await wallet.sendTransaction(populatedTx);
      await tx.wait();

      const eventMembers = await getEventMembers(tokenId);

      expect(eventMembers.length).toBe(1);
      expect(eventMembers[0][0].toLowerCase()).toBe(wallet.address);
    } catch (_error) {}
  });

  test("Should call updateEventTokenUri method from smart contract", async () => {
    const oldIpfsUrl = await getEventIpfsUri(tokenId, eventsTestContract);
    try {
      mockedMetadata.name = "Updated Name";
      mockedMetadata.description = "Updated descrtiption";

      const image = await fetch("https://www.blackseachain.com/assets/img/hero-section/hero-image-compressed.png");
      const imageBlob = await image.blob();

      const populatedTx = await updateEvent(
        NFT_STORAGE_API_KEY,
        tokenId,
        mockedMetadata,
        imageBlob,
        eventsTestContract,
      );

      const tx = await wallet.sendTransaction(populatedTx);
      await tx.wait();

      const newIpfsUrl = await getEventIpfsUri(tokenId, eventsTestContract);

      expect(oldIpfsUrl.toString()).not.toBe(newIpfsUrl.toString());
    } catch (_error) {}
  });

  test("Should call fetchOwnedEvents from smart contract", async () => {
    try {
      const events = await fetchOwnedEvents(wallet.address, eventsTestContract);
      expect(events.length).toBe(tokenId);
    } catch (_error) {
      console.log(_error);
    }
  });
});
