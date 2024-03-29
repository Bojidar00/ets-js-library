import {
  removeEvent,
  addTeamMember,
  removeTeamMember,
  updateEvent,
  getEventMembers,
  getEventIpfsUri,
  fetchOwnedEvents,
  fetchEvents,
  setEventCashier,
} from "../src/index.js";
import {
  NFT_STORAGE_API_KEY,
  EXAMPLE_ADDRESS,
  mockedMetadata,
  errorMessages,
  DATES,
  SECOND_EXAMPLE_ADDRESS,
} from "./config.js";
import { expect } from "chai";
import { utils } from "ethers";
import { mockedCreateEvent, testSetUp } from "./utils.js";

describe("Organizer tests", function () {
  let diamondAddress;
  let eventFacet;
  let tokenId;
  let imageBlob;
  let wallet;
  let signers;
  const addressLength = 64;

  before(async function () {
    ({ diamondAddress, eventFacet, imageBlob, signers, wallet } = await testSetUp(
      diamondAddress,
      eventFacet,
      imageBlob,
      signers,
      wallet,
    ));

    const maxTicketPerClient = 10;
    const startDate = DATES.EVENT_START_DATE;
    const endDate = DATES.EVENT_END_DATE;
    mockedMetadata.image = imageBlob;

    tokenId = await mockedCreateEvent(maxTicketPerClient, startDate, endDate, eventFacet, wallet, tokenId);
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

  it("Should call fetch events by id method from smart contract", async () => {
    const eventIds = [tokenId];
    const events = await fetchEvents(eventIds, eventFacet);
    expect(events.length).to.equal(1);
  });

  it("Should call fetch owned events method from smart contract", async () => {
    const events = await fetchOwnedEvents(wallet.address, eventFacet);
    expect(events.length).to.equal(1);
  });

  it("Should revert delete event when there is not an event", async () => {
    const populatedTx = await removeEvent(tokenId + 1, eventFacet);
    await expect(wallet.sendTransaction(populatedTx)).to.be.revertedWith(errorMessages.eventDoesNotExist);
  });

  it("Should call add team member method from smart contract", async () => {
    const populatedTx = await addTeamMember(tokenId, `0x${"0".repeat(addressLength)}`, EXAMPLE_ADDRESS, eventFacet);
    const tx = await wallet.sendTransaction(populatedTx);
    await tx.wait();

    const eventMembers = await getEventMembers(tokenId, eventFacet);
    expect(eventMembers.length).to.equal(6); // buddy ignore:line
    expect(eventMembers[5][0].toLowerCase()).to.equal(EXAMPLE_ADDRESS); // buddy ignore:line
  });

  it("Should call remove team member method from smart contract", async () => {
    const populatedTx = await removeTeamMember(tokenId, `0x${"0".repeat(addressLength)}`, EXAMPLE_ADDRESS, eventFacet);
    const tx = await wallet.sendTransaction(populatedTx);
    await tx.wait();

    const eventMembers = await getEventMembers(tokenId, eventFacet);
    const expectedMembersLength = 5;
    expect(eventMembers.length).to.equal(expectedMembersLength);
    expect(eventMembers[0][0].toLowerCase()).to.equal(wallet.address.toLowerCase());
  });

  it("Should revert remove team member when there is not an event", async () => {
    const populatedTx = await removeTeamMember(
      tokenId + 1,
      `0x${"0".repeat(addressLength)}`,
      EXAMPLE_ADDRESS,
      eventFacet,
    );
    await expect(wallet.sendTransaction(populatedTx)).to.be.revertedWith(errorMessages.eventDoesNotExist);
  });

  // fails
  it.skip("Should revert remove team member when there is not member with given address", async () => {
    const populatedTx = await removeTeamMember(tokenId, `0x${"0".repeat(addressLength)}`, EXAMPLE_ADDRESS, eventFacet);
    await expect(wallet.sendTransaction(populatedTx)).to.be.revertedWith(errorMessages.eventDoesNotExist);
  });

  it("Should call get event members method from smart contract", async () => {
    const eventMembers = await getEventMembers(tokenId, eventFacet);
    const expectedMembersLength = 5;
    expect(eventMembers.length).to.equal(expectedMembersLength);
    expect(eventMembers[0][0].toLowerCase()).to.equal(wallet.address.toLowerCase());
  });

  it("Should call fetchOwnedEvents from smart contract", async () => {
    const events = await fetchOwnedEvents(wallet.address, eventFacet);
    expect(events.length).to.equal(tokenId);
  });

  it("Should set event cashier", async () => {
    const CASHIER_ROLE = utils.keccak256(utils.toUtf8Bytes("CASHIER_ROLE"));
    const address = SECOND_EXAMPLE_ADDRESS;
    const populatedTx = await setEventCashier(tokenId, address, eventFacet);
    const tx = await wallet.sendTransaction(populatedTx);
    await tx.wait();

    const members = await getEventMembers(tokenId, eventFacet);
    const expectedMemberIndex = 5;

    expect(members[expectedMemberIndex].account).to.equal(address);
    expect(members[expectedMemberIndex].role).to.equal(CASHIER_ROLE);
  });

  it("Should call remove event method from smart contract", async () => {
    const populatedTx = await removeEvent(tokenId, eventFacet);
    const tx = await wallet.sendTransaction(populatedTx);
    await tx.wait();
    const events = await fetchOwnedEvents(wallet.address, eventFacet);
    expect(events.length).to.equal(0);
  });
});
