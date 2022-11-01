import { deployEventDiamond } from "../tasks/deployEventDiamond.js";
import eventSchema from "../config/EventFacet.json" assert { type: "json" };

import {
  createEvent,
  fetchEvent,
  setEventCashier,
  createTicketCategory,
  fetchCategoriesByEventId,
  updateCategory,
  removeCategory,
  addCategoryTicketsCount,
  removeCategoryTicketsCount,
  manageCategorySelling,
  manageAllCategorySelling,
  listenForNewEvent,
  listenForEventUpdate,
  listenForRoleGrant,
  listenForRoleRevoke,
  updateEvent,
  removeTeamMember,
  addTeamMember,
  removeEvent,
} from "../src/index.js";
import fetch from "@web-std/fetch";
import {
  NFT_STORAGE_API_KEY,
  mockedMetadata,
  mockedCategoryMetadata,
  mockedContractData,
  EXAMPLE_ADDRESS,
} from "./config.js";
import { expect } from "chai";
import { utils } from "ethers";
import { spy } from "sinon";

describe("Moderator tests", function () {
  let diamondAddress;
  let eventFacet;
  let tokenId;
  let imageBlob;
  let wallet;
  let moderatorWallet;
  let signers;
  const addressLength = 64;
  const spyFunc = spy();

  function checkFunctionInvocation() {
    if (spyFunc.callCount === 0) {
      setTimeout(checkFunctionInvocation, 100); // buddy ignore:line
    } else {
      expect(spyFunc.callCount).to.equal(1);
    }
  }

  before(async function () {
    diamondAddress = await deployEventDiamond();
    eventFacet = await ethers.getContractAt(eventSchema.abi, diamondAddress);
    const image = await fetch("https://www.blackseachain.com/assets/img/hero-section/hero-image-compressed.png");
    imageBlob = await image.blob();
    signers = await ethers.getSigners();
    wallet = signers[0];
    moderatorWallet = signers[1];

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

    // Grant moderator role
    const moderatorRole = utils.keccak256(utils.toUtf8Bytes("MODERATOR_ROLE"));
    const moderatorAddress = await moderatorWallet.getAddress();
    const addTeamMemberTx = await addTeamMember(tokenId, moderatorRole, moderatorAddress, eventFacet);
    const tx = await wallet.sendTransaction(addTeamMemberTx);
    await tx.wait();
  });

  it("Should revert set event cashier when moderator calls it", async () => {
    const address = "0xB7a94AfbF92B4D2D522EaA8f7c0e07Ab6A61186E";
    const populatedTx = await setEventCashier(tokenId, address, eventFacet);
    populatedTx.from = moderatorWallet.address;

    await expect(moderatorWallet.sendTransaction(populatedTx)).to.be.revertedWith("Event: Caller is not an admin");
  });

  it("Should create ticket category", async () => {
    const populatedTx = await createTicketCategory(
      NFT_STORAGE_API_KEY,
      tokenId,
      mockedCategoryMetadata,
      mockedContractData,
      eventFacet,
    );
    populatedTx.from = moderatorWallet.address;
    const tx = await moderatorWallet.sendTransaction(populatedTx);
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
    populatedTx.from = moderatorWallet.address;

    await expect(moderatorWallet.sendTransaction(populatedTx)).to.be.revertedWith(
      "Event: Category start date is incorrect",
    );
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
    populatedTx.from = moderatorWallet.address;

    await expect(moderatorWallet.sendTransaction(populatedTx)).to.be.revertedWith(
      "Event: Category end date is incorrect",
    );
  });

  it("Should revert create ticket category when there is not an event", async () => {
    const populatedTx = await createTicketCategory(
      NFT_STORAGE_API_KEY,
      tokenId + 1,
      mockedCategoryMetadata,
      mockedContractData,
      eventFacet,
    );
    populatedTx.from = moderatorWallet.address;

    await expect(moderatorWallet.sendTransaction(populatedTx)).to.be.revertedWith("Event: Event does not exist!");
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

    populatedTx.from = moderatorWallet.address;
    const tx = await moderatorWallet.sendTransaction(populatedTx);
    await tx.wait();

    const categoriesAfterUpdate = await fetchCategoriesByEventId(tokenId, eventFacet);

    expect(categoriesAfterUpdate[0].cid).to.not.equal(categories[0].cid);
  });

  it("Should add more tickets to category", async () => {
    const categoriesBefore = await fetchCategoriesByEventId(tokenId, eventFacet);
    const moreTickets = 20;
    const categoryId = categoriesBefore[0].id;
    const populatedTx = await addCategoryTicketsCount(tokenId, categoryId, moreTickets, eventFacet);
    populatedTx.from = moderatorWallet.address;
    const tx = await moderatorWallet.sendTransaction(populatedTx);
    await tx.wait();
    const categoriesAfter = await fetchCategoriesByEventId(tokenId, eventFacet);

    expect(Number(categoriesBefore[0].ticketsCount) + moreTickets).to.equal(categoriesAfter[0].ticketsCount);
  });

  it("Should revert add more tickets to category when there is not category", async () => {
    const moreTickets = 20;
    const categoriesBefore = await fetchCategoriesByEventId(tokenId, eventFacet);
    const categoryId = categoriesBefore[0].id;
    const populatedTx = await addCategoryTicketsCount(tokenId, categoryId + 1, moreTickets, eventFacet);
    populatedTx.from = moderatorWallet.address;

    expect(moderatorWallet.sendTransaction(populatedTx)).to.be.revertedWith("Event: Category does not exist!");
  });

  it("Should revert add more tickets to category when there is not event", async () => {
    const moreTickets = 20;
    const categoriesBefore = await fetchCategoriesByEventId(tokenId, eventFacet);
    const categoryId = categoriesBefore[0].id;
    const populatedTx = await addCategoryTicketsCount(tokenId + 1, categoryId, moreTickets, eventFacet);
    populatedTx.from = moderatorWallet.address;

    expect(moderatorWallet.sendTransaction(populatedTx)).to.be.revertedWith("Event: Event does not exist!");
  });

  it("Should remove tickets from category", async () => {
    const categoriesBefore = await fetchCategoriesByEventId(tokenId, eventFacet);
    const lessTickets = 20;
    const categoryId = categoriesBefore[0].id;
    const populatedTx = await removeCategoryTicketsCount(tokenId, categoryId, lessTickets, eventFacet);
    populatedTx.from = moderatorWallet.address;
    const tx = await moderatorWallet.sendTransaction(populatedTx);
    await tx.wait();
    const categoriesAfter = await fetchCategoriesByEventId(tokenId, eventFacet);

    expect(Number(categoriesBefore[0].ticketsCount) - lessTickets).to.equal(categoriesAfter[0].ticketsCount);
  });

  it("Should revert remove tickets from category when there is not category", async () => {
    const lessTickets = 20;
    const categoriesBefore = await fetchCategoriesByEventId(tokenId, eventFacet);
    const categoryId = categoriesBefore[0].id;
    const populatedTx = await removeCategoryTicketsCount(tokenId, categoryId + 1, lessTickets, eventFacet);
    populatedTx.from = moderatorWallet.address;

    expect(moderatorWallet.sendTransaction(populatedTx)).to.be.revertedWith("Event: Category does not exist!");
  });

  it("Should revert remove tickets from category when there is not event", async () => {
    const lessTickets = 20;
    const categoriesBefore = await fetchCategoriesByEventId(tokenId, eventFacet);
    const categoryId = categoriesBefore[0].id;
    const populatedTx = await removeCategoryTicketsCount(tokenId + 1, categoryId, lessTickets, eventFacet);
    populatedTx.from = moderatorWallet.address;

    expect(moderatorWallet.sendTransaction(populatedTx)).to.be.revertedWith("Event: Event does not exist!");
  });

  it("Should stop the sale of tickets for category", async () => {
    const categoriesBefore = await fetchCategoriesByEventId(tokenId, eventFacet);
    const value = false;
    const categoryId = categoriesBefore[0].id;
    const populatedTx = await manageCategorySelling(tokenId, categoryId, value, eventFacet);
    populatedTx.from = moderatorWallet.address;
    const tx = await moderatorWallet.sendTransaction(populatedTx);
    await tx.wait();
    const categoriesAfter = await fetchCategoriesByEventId(tokenId, eventFacet);

    expect(categoriesBefore[0].areTicketsBuyable).to.not.equal(categoriesAfter[0].areTicketsBuyable);
    expect(categoriesAfter[0].areTicketsBuyable).to.equal(false);
  });

  it("Should revert stop the sale of tickets for category when there is not category", async () => {
    const value = false;
    const categoriesBefore = await fetchCategoriesByEventId(tokenId, eventFacet);
    const categoryId = categoriesBefore[0].id;
    const populatedTx = await manageCategorySelling(tokenId, categoryId + 1, value, eventFacet);
    populatedTx.from = moderatorWallet.address;

    expect(moderatorWallet.sendTransaction(populatedTx)).to.be.revertedWith("Event: Category does not exist!");
  });

  it("Should revert stop the sale of tickets for category when there is not event", async () => {
    const value = false;
    const categoriesBefore = await fetchCategoriesByEventId(tokenId, eventFacet);
    const categoryId = categoriesBefore[0].id;
    const populatedTx = await manageCategorySelling(tokenId + 1, categoryId, value, eventFacet);
    populatedTx.from = moderatorWallet.address;

    expect(moderatorWallet.sendTransaction(populatedTx)).to.be.revertedWith("Event: Event does not exist!");
  });

  it("Should start the sale of tickets for category", async () => {
    const categoriesBefore = await fetchCategoriesByEventId(tokenId, eventFacet);
    const value = true;
    const categoryId = categoriesBefore[0].id;
    const populatedTx = await manageCategorySelling(tokenId, categoryId, value, eventFacet);
    populatedTx.from = moderatorWallet.address;
    const tx = await moderatorWallet.sendTransaction(populatedTx);
    await tx.wait();
    const categoriesAfter = await fetchCategoriesByEventId(tokenId, eventFacet);

    expect(categoriesBefore[0].areTicketsBuyable).to.not.equal(categoriesAfter[0].areTicketsBuyable);
    expect(categoriesAfter[0].areTicketsBuyable).to.equal(true);
  });

  it("Should revert start the sale of tickets for category when there is not category", async () => {
    const value = true;
    const categoriesBefore = await fetchCategoriesByEventId(tokenId, eventFacet);
    const categoryId = categoriesBefore[0].id;
    const populatedTx = await manageCategorySelling(tokenId, categoryId + 1, value, eventFacet);
    populatedTx.from = moderatorWallet.address;

    expect(moderatorWallet.sendTransaction(populatedTx)).to.be.revertedWith("Event: Category does not exist!");
  });

  it("Should revert start the sale of tickets for category when there is not event", async () => {
    const value = true;
    const categoriesBefore = await fetchCategoriesByEventId(tokenId, eventFacet);
    const categoryId = categoriesBefore[0].id;
    const populatedTx = await manageCategorySelling(tokenId + 1, categoryId, value, eventFacet);
    populatedTx.from = moderatorWallet.address;

    expect(moderatorWallet.sendTransaction(populatedTx)).to.be.revertedWith("Event: Event does not exist!");
  });

  it("Should stop the sale of tickets for all categories", async () => {
    const value = false;
    const populatedTx = await manageAllCategorySelling(tokenId, value, eventFacet);
    populatedTx.from = moderatorWallet.address;
    const tx = await moderatorWallet.sendTransaction(populatedTx);
    await tx.wait();

    const event = await fetchEvent(tokenId, eventFacet);

    expect(event.areAllCategoryTicketsBuyable).to.equal(false);
  });

  it("Should revert stop the sale of tickets for all categories when there is not event", async () => {
    const value = false;
    const populatedTx = await manageAllCategorySelling(tokenId + 1, value, eventFacet);
    populatedTx.from = moderatorWallet.address;

    expect(moderatorWallet.sendTransaction(populatedTx)).to.be.revertedWith("Event: Event does not exist!");
  });

  it("Should start the sale of tickets for all categories", async () => {
    const value = true;
    const populatedTx = await manageAllCategorySelling(tokenId, value, eventFacet);
    populatedTx.from = moderatorWallet.address;
    const tx = await moderatorWallet.sendTransaction(populatedTx);
    await tx.wait();

    const event = await fetchEvent(tokenId, eventFacet);

    expect(event.areAllCategoryTicketsBuyable).to.equal(true);
  });

  it("Should revert start the sale of tickets for all categories when there is not event", async () => {
    const value = true;
    const populatedTx = await manageAllCategorySelling(tokenId + 1, value, eventFacet);
    populatedTx.from = moderatorWallet.address;

    expect(moderatorWallet.sendTransaction(populatedTx)).to.be.revertedWith("Event: Event does not exist!");
  });

  it("Should fetch categories of event", async () => {
    const categories = await fetchCategoriesByEventId(tokenId, eventFacet);

    expect(categories.length).to.equal(1);
  });

  it("Should revert fetch categories of event when there is not event", async () => {
    expect(fetchCategoriesByEventId(tokenId + 1, eventFacet)).to.be.revertedWith("Event: Event does not exist!");
  });

  it("Should remove category", async () => {
    const categories = await fetchCategoriesByEventId(tokenId, eventFacet);
    const categoryId = categories[0].id;
    const populatedTx = await removeCategory(tokenId, categoryId, eventFacet);
    populatedTx.from = moderatorWallet.address;
    const tx = await moderatorWallet.sendTransaction(populatedTx);
    await tx.wait();

    const categoriesAfterRemove = await fetchCategoriesByEventId(tokenId, eventFacet);
    expect(categoriesAfterRemove.length).to.equal(0);
  });

  it("Should revert remove category when there is not category", async () => {
    const populatedTx = await removeCategory(tokenId, 1, eventFacet);
    populatedTx.from = moderatorWallet.address;

    await expect(moderatorWallet.sendTransaction(populatedTx)).to.be.revertedWith("Event: Category does not exist!");
  });

  it("Should revert remove category when there is not an event", async () => {
    const populatedTx = await removeCategory(tokenId + 1, 1, eventFacet);
    populatedTx.from = moderatorWallet.address;

    await expect(moderatorWallet.sendTransaction(populatedTx)).to.be.revertedWith("Event: Event does not exist!");
  });

  it("Should listen for new Events", async () => {
    listenForNewEvent(eventFacet, spyFunc);
    const maxTicketPerClient = 10;
    const startDate = 1666601372;
    const endDate = 1666601572;
    const populatedTx = await createEvent(
      NFT_STORAGE_API_KEY,
      mockedMetadata,
      { maxTicketPerClient, startDate, endDate },
      eventFacet,
    );
    populatedTx.from = moderatorWallet.address;

    const eventTx = await moderatorWallet.sendTransaction(populatedTx);
    await eventTx.wait();

    checkFunctionInvocation();
    spyFunc.resetHistory();
  });

  it("Should listen for event update", async () => {
    listenForEventUpdate(eventFacet, spyFunc);
    const currMockedMetadata = JSON.parse(JSON.stringify(mockedMetadata));
    currMockedMetadata.name = "Updated Name";
    currMockedMetadata.description = "Updated description";
    currMockedMetadata.image = imageBlob;

    const populatedTx = await updateEvent(NFT_STORAGE_API_KEY, tokenId, currMockedMetadata, eventFacet);
    populatedTx.from = moderatorWallet.address;
    const tx = await moderatorWallet.sendTransaction(populatedTx);
    await tx.wait();

    checkFunctionInvocation();
    spyFunc.resetHistory();
  });

  it("Should listen for role granted", async () => {
    listenForRoleGrant(eventFacet, spyFunc);
    const address = "0xB7a94AfbF92B4D2D522EaA8f7c0e07Ab6A61186E";
    const populatedTx = await setEventCashier(tokenId, address, eventFacet);
    const tx = await wallet.sendTransaction(populatedTx);
    await tx.wait();

    checkFunctionInvocation();
    spyFunc.resetHistory();
  });

  it("Should listen for role revoked", async () => {
    listenForRoleRevoke(eventFacet, spyFunc);

    const populatedTx = await removeTeamMember(tokenId, `0x${"0".repeat(addressLength)}`, EXAMPLE_ADDRESS, eventFacet);
    const tx = await wallet.sendTransaction(populatedTx);
    await tx.wait();

    checkFunctionInvocation();
    spyFunc.resetHistory();
  });

  it("Should revert add team member when it is not the owner", async () => {
    const populatedTx = await addTeamMember(tokenId, `0x${"0".repeat(addressLength)}`, EXAMPLE_ADDRESS, eventFacet);
    populatedTx.from = moderatorWallet.address;

    await expect(moderatorWallet.sendTransaction(populatedTx)).to.be.revertedWith("Event: Caller is not an admin");
  });

  it("Should revert remove team member when it is not the owner", async () => {
    const populatedTx = await removeTeamMember(tokenId, `0x${"0".repeat(addressLength)}`, EXAMPLE_ADDRESS, eventFacet);
    populatedTx.from = moderatorWallet.address;

    await expect(moderatorWallet.sendTransaction(populatedTx)).to.be.revertedWith("Event: Caller is not an admin");
  });

  it("Should revert remove event when it is not the owner", async () => {
    const populatedTx = await removeEvent(tokenId, eventFacet);
    populatedTx.from = moderatorWallet.address;

    await expect(moderatorWallet.sendTransaction(populatedTx)).to.be.revertedWith("Event: Caller is not an admin");
  });
});
