import { deployEventDiamond } from "../tasks/deployEventDiamond.js";
import eventSchema from "../config/EventFacet.json" assert { type: "json" };

import {
  createEvent,
  createTicketCategory,
  fetchCategoriesByEventId,
  updateCategory,
  removeCategory,
} from "../src/index.js";
import fetch from "@web-std/fetch";
import { NFT_STORAGE_API_KEY, mockedMetadata, mockedCategoryMetadata, mockedContractData } from "./config.js";
import { expect } from "chai";

describe("Moderator tests", function () {
  let diamondAddress;
  let eventFacet;
  let tokenId;
  let imageBlob;
  let wallet;
  let signers;

  before(async function () {
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
    mockedCategoryMetadata.image = imageBlob;

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

  // set cashier to be tested

  it("Should create ticket category", async () => {
    const populatedTx = await createTicketCategory(
      NFT_STORAGE_API_KEY,
      tokenId,
      mockedCategoryMetadata,
      mockedContractData,
      eventFacet,
    );
    const tx = await wallet.sendTransaction(populatedTx);
    await tx.wait();

    const categories = await fetchCategoriesByEventId(tokenId, eventFacet);
    expect(categories.length).to.equal(1);
  });

  it("Should revert create ticket category when the start sale date is not appropriate", async () => {
    mockedContractData.saleStartDate = 1666601370;
    mockedContractData.saleEndDate = 1666666666;
    const populatedTx = await createTicketCategory(
      NFT_STORAGE_API_KEY,
      tokenId,
      mockedCategoryMetadata,
      mockedContractData,
      eventFacet,
    );

    await expect(wallet.sendTransaction(populatedTx)).to.be.revertedWith("Event: Category start date is incorrect");
  });

  it("Should revert create ticket category when the end sale date is not appropriate", async () => {
    mockedContractData.saleStartDate = 1666666666;
    mockedContractData.saleEndDate = 1666666666;
    const populatedTx = await createTicketCategory(
      NFT_STORAGE_API_KEY,
      tokenId,
      mockedCategoryMetadata,
      mockedContractData,
      eventFacet,
    );

    await expect(wallet.sendTransaction(populatedTx)).to.be.revertedWith("Event: Category end date is incorrect");
  });

  it("Should revert create ticket category when there is not an event", async () => {
    const populatedTx = await createTicketCategory(
      NFT_STORAGE_API_KEY,
      tokenId + 1,
      mockedCategoryMetadata,
      mockedContractData,
      eventFacet,
    );

    await expect(wallet.sendTransaction(populatedTx)).to.be.revertedWith("Event: Event does not exist!");
  });

  it("Should update ticket category", async () => {
    const categories = await fetchCategoriesByEventId(tokenId, eventFacet);
    const categoryId = categories[0].id;
    mockedCategoryMetadata.name = "Updated category name";
    const populatedTx = await updateCategory(
      NFT_STORAGE_API_KEY,
      tokenId,
      categoryId,
      mockedCategoryMetadata,
      mockedContractData,
      eventFacet,
    );
    const tx = await wallet.sendTransaction(populatedTx);
    await tx.wait();

    const categoriesAfterUpdate = await fetchCategoriesByEventId(tokenId, eventFacet);

    expect(categoriesAfterUpdate[0].cid).to.not.equal(categories[0].cid);
  });

  it("Should remove category", async () => {
    const categories = await fetchCategoriesByEventId(tokenId, eventFacet);
    const categoryId = categories[0].id;
    const populatedTx = await removeCategory(tokenId, categoryId, eventFacet);
    const tx = await wallet.sendTransaction(populatedTx);
    await tx.wait();

    const categoriesAfterRemove = await fetchCategoriesByEventId(tokenId, eventFacet);
    expect(categoriesAfterRemove.length).to.equal(0);
  });

  it("Should revert remove category when there is not category", async () => {
    const populatedTx = await removeCategory(tokenId, 1, eventFacet);

    await expect(wallet.sendTransaction(populatedTx)).to.be.revertedWith("Event: Category does not exist!");
  });

  it("Should revert remove category when there is not an event", async () => {
    const populatedTx = await removeCategory(tokenId + 1, 1, eventFacet);

    await expect(wallet.sendTransaction(populatedTx)).to.be.revertedWith("Event: Event does not exist!");
  });
});
