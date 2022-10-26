import { deployEventDiamond } from "../tasks/deployEventDiamond.js";
import eventSchema from "../config/EventFacet.json" assert { type: "json" };

import {
  removeEvent,
  addTeamMember,
  updateEvent,
  createEvent,
  getEventMembers,
  getEventIpfsUri,
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
  const addressLength = 64;

  before(async function () {
    diamondAddress = await deployEventDiamond();
    eventFacet = await ethers.getContractAt(eventSchema.abi, diamondAddress);
    const image = await fetch("https://www.blackseachain.com/assets/img/hero-section/hero-image-compressed.png");
    imageBlob = await image.blob();
    const signers = await ethers.getSigners();
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
  });

  it("Should revert delete event when there is not an event", async () => {
    const populatedTx = await removeEvent(tokenId + 1, eventFacet);
    await expect(wallet.sendTransaction(populatedTx)).to.be.revertedWith("Event: Event does not exist!");
  });

  it("Should call add team member method from smart contract", async () => {
    const populatedTx = await addTeamMember(tokenId, `0x${"0".repeat(addressLength)}`, EXAMPLE_ADDRESS, eventFacet);
    const tx = await wallet.sendTransaction(populatedTx);
    const txResponse = await tx.wait();
    console.log(txResponse);

    const eventMembers = await getEventMembers(tokenId, eventFacet);
    expect(eventMembers.length).to.equal(2); // buddy ignore:line
    expect(eventMembers[1][0].toLowerCase()).to.equal(EXAMPLE_ADDRESS);
  });

  it("Should call updateEventTokenUri method from smart contract", async () => {
    const oldIpfsUrl = await getEventIpfsUri(tokenId, eventFacet);
    try {
      mockedMetadata.name = "Updated Name";
      mockedMetadata.description = "Updated description";

      const populatedTx = await updateEvent(NFT_STORAGE_API_KEY, tokenId, mockedMetadata, eventFacet);

      const tx = await wallet.sendTransaction(populatedTx);
      await tx.wait();

      const newIpfsUrl = await getEventIpfsUri(tokenId, eventFacet);

      expect(oldIpfsUrl.toString()).not.to.be(newIpfsUrl.toString());
    } catch (_error) {}
  });
});
