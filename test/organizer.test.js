import { deployEventDiamond } from "../tasks/deployEventDiamond.js";
import eventSchema from "../config/EventFacet.json" assert { type: "json" };

import {
  removeEvent,
  addTeamMember,
  removeTeamMember,
  updateEvent,
  createEvent,
  getEventMembers,
  getEventIpfsUri,
  fetchOwnedEvents,
  fetchEvents,
} from "../src/index.js";
import fetch from "@web-std/fetch";
import { NFT_STORAGE_API_KEY, EXAMPLE_ADDRESS, mockedMetadata } from "./config.js";
import { expect } from "chai";

describe("Organizer tests", function () {
  let diamondAddress;
  let eventFacet;
  let tokenId;
  let imageBlob;
  let wallet;
  let signers;
  const addressLength = 64;

  beforeEach(async function () {
    diamondAddress = await deployEventDiamond();
    eventFacet = await ethers.getContractAt(eventSchema.abi, diamondAddress);
    const image = await fetch("https://www.blackseachain.com/assets/img/hero-section/hero-image-compressed.png");
    imageBlob = await image.blob();
    signers = await ethers.getSigners();
    wallet = signers[0];

    const maxTicketPerClient = 10;
    const startDate = 1666601372;
    const endDate = 1666601572;

    mockedMetadata.image = imageBlob;

    const populatedTx = await createEvent(
      NFT_STORAGE_API_KEY,
      mockedMetadata,
      { maxTicketPerClient, startDate, endDate },
      eventFacet,
    );

    const eventTx = await wallet.sendTransaction(populatedTx);
    const eventTxResponse = await eventTx.wait();
    const tokenIdInHex = eventTxResponse.logs[0].data.slice(2, 66); // buddy ignore:line
    const radix = 16;
    tokenId = parseInt(tokenIdInHex, radix);
    console.log("New event: ", tokenId);
  });

  it("Should call create event method from smart contract", async () => {
    const eventIds = [1];
    const events = await fetchEvents(eventIds, eventFacet);
    expect(events.length).to.equal(1);
  });

  it("Should call updateEventTokenUri method from smart contract", async () => {
    const oldIpfsUrl = await getEventIpfsUri(tokenId, eventFacet);
    mockedMetadata.name = "Updated Name";
    mockedMetadata.description = "Updated description";

    const populatedTx = await updateEvent(NFT_STORAGE_API_KEY, tokenId, mockedMetadata, eventFacet);
    const tx = await wallet.sendTransaction(populatedTx);
    await tx.wait();

    const newIpfsUrl = await getEventIpfsUri(tokenId, eventFacet);
    expect(oldIpfsUrl.toString()).to.not.equal(newIpfsUrl.toString());
  });

  it("Should call remove event method from smart contract", async () => {
    const populatedTx = await removeEvent(tokenId, eventFacet);
    const tx = await wallet.sendTransaction(populatedTx);
    await tx.wait();
    const events = await fetchOwnedEvents(wallet.address, eventFacet);
    expect(events.length).to.equal(0);
  });

  it("Should revert delete event when there is not an event", async () => {
    const populatedTx = await removeEvent(tokenId + 1, eventFacet);
    await expect(wallet.sendTransaction(populatedTx)).to.be.revertedWith("Event: Event does not exist!");
  });

  it("Should call fetch events by id method from smart contract", async () => {
    const eventIds = [tokenId];
    const events = await fetchEvents(eventIds, eventFacet);
    expect(events.length).to.equal(1);
  });

  it("Should call fetch owned events method from smart contract", async () => {
    const events = await fetchOwnedEvents(wallet.address, eventFacet);
    expect(events.length).to.equal(1);
  });

  it("Should call add team member method from smart contract", async () => {
    const populatedTx = await addTeamMember(tokenId, `0x${"0".repeat(addressLength)}`, EXAMPLE_ADDRESS, eventFacet);
    const tx = await wallet.sendTransaction(populatedTx);
    await tx.wait();

    const eventMembers = await getEventMembers(tokenId, eventFacet);
    expect(eventMembers.length).to.equal(2); // buddy ignore:line
    expect(eventMembers[1][0].toLowerCase()).to.equal(EXAMPLE_ADDRESS);
  });

  it("Should call remove team member method from smart contract", async () => {
    const populatedTx = await removeTeamMember(tokenId, `0x${"0".repeat(addressLength)}`, EXAMPLE_ADDRESS, eventFacet);
    const tx = await wallet.sendTransaction(populatedTx);
    await tx.wait();

    const eventMembers = await getEventMembers(tokenId, eventFacet);
    expect(eventMembers.length).to.equal(1);
    expect(eventMembers[0][0].toLowerCase()).to.equal(wallet.address.toLowerCase());
  });

  it("Should revert remove team member when there is not an event", async () => {
    const populatedTx = await removeTeamMember(
      tokenId + 1,
      `0x${"0".repeat(addressLength)}`,
      EXAMPLE_ADDRESS,
      eventFacet,
    );
    await expect(wallet.sendTransaction(populatedTx)).to.be.revertedWith("Event: Event does not exist!");
  });

  // fails
  it("Should revert remove team member when there is not member with given address", async () => {
    const populatedTx = await removeTeamMember(tokenId, `0x${"0".repeat(addressLength)}`, EXAMPLE_ADDRESS, eventFacet);
    await expect(wallet.sendTransaction(populatedTx)).to.be.revertedWith("Event: Event does not exist!");
  });

  it("Should call get event members method from smart contract", async () => {
    const eventMembers = await getEventMembers(tokenId, eventFacet);
    expect(eventMembers.length).to.equal(1);
    expect(eventMembers[0][0].toLowerCase()).to.equal(wallet.address.toLowerCase());
  });

  it("Should call fetchOwnedEvents from smart contract", async () => {
    const events = await fetchOwnedEvents(wallet, eventFacet);
    expect(events.length).to.equal(tokenId);
  });
});
