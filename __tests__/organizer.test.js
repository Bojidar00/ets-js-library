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
import { ABI, NET_RPC_URL } from "#config";
import fetch from "@web-std/fetch";
import { ethers } from "ethers";
import fs from "fs";

const NFT_STORAGE_API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDY4OEYyYjcxMzhlNWUxQjJBOWQyQzc2OWREMTNBMUQwRTYyMjI5NjMiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2Mjk3MzI5NzMwOSwibmFtZSI6IkV2ZW50LVRpY2tldGluZy1TeXN0ZW0ifQ.x0aXjwdGsIcxibl7eIjxhdF8vnGHB2BB-2gkScySU20";

const PRIVATE_KEY = fs.readFileSync(".secret").toString().trim();
const provider = ethers.getDefaultProvider(NET_RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const EVENTS_TEST_CONTRACT_ADDRESS =
  "0xB73F457c374C7A53a80475460A11051065cBb361";

const eventsTestContract = new ethers.Contract(
  EVENTS_TEST_CONTRACT_ADDRESS,
  ABI,
  provider,
);

describe("Organizer tests", () => {
  const address = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
  let tokenId;

  beforeAll(async () => {
    // mock = new MockAdapter(axios);

    const metadata = {
      name: "Event5",
      description: "Event5 Description",
      image: "null",
      properties: {
        eventId: "base-58 random bytes",
        websiteUrl: "https://event1.com",
        date: {
          start: "2022-10-01 10:45:29.971113+03",
          end: "2022-10-03 10:45:29.971113+03",
        },
        location: {
          country: "Bulgaria",
          city: "Razgrad",
          address: "Front Beach Alley, 9007 Golden Sands",
          coordinates: {
            latitude: "43.28365485346511",
            longitude: "28.042738484752096",
          },
        },
        ticketTypes: ["super early birds", "early birds", "regular", "onsite"],
        maxTicketsPerAccount: 10,
        contacts: "Contacts string",
        status: "upcoming",
        tags: ["#programming", "#VitalikFanBoys"],
      },
    };

    const image = await fetch(
      "https://www.blackseachain.com/assets/img/hero-section/hero-image-compressed.png",
    );
    const imageBlob = await image.blob();

    const populatedTx = await createEvent(
      NFT_STORAGE_API_KEY,
      metadata,
      imageBlob,
      10,
      eventsTestContract,
    );

    const eventTx = await wallet.sendTransaction(populatedTx);
    const eventTxResponse = await eventTx.wait();
    const tokenIdInHex = eventTxResponse.logs[0].data.slice(2, 66);
    tokenId = parseInt(tokenIdInHex, 16);
  });

  afterEach(() => {
    // mock.reset();
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
      expect(err.error.reason).toBe(
        "execution reverted: Event: Event does not exist!",
      );
    }
  });

  test("Should call add team member method from smart contract", async () => {
    try {
      const populatedTx = await addTeamMember(
        tokenId,
        `0x${"0".repeat(64)}`,
        address,
        eventsTestContract,
      );
      const tx = await wallet.sendTransaction(populatedTx);
      await tx.wait();

      const eventMembers = await getEventMembers(tokenId, eventsTestContract);

      expect(eventMembers.length).toBe(2);
      expect(eventMembers[1][0].toLowerCase()).toBe(address);
    } catch (_error) {
      console.log(_error);
    }
  });

  test("Should call remove team member method from smart contract", async () => {
    try {
      const populatedTx = await removeTeamMember(
        tokenId,
        `0x${"0".repeat(64)}`,
        address,
        eventsTestContract,
      );
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
      const metadata = {
        name: "Updated Name",
        description: "Updated Description",
        image: "null",
        properties: {
          eventId: "base-58 random bytes",
          websiteUrl: "https://event1.com",
          date: {
            start: "2022-10-01 10:45:29.971113+03",
            end: "2022-10-03 10:45:29.971113+03",
          },
          location: {
            country: "Bulgaria",
            city: "Razgrad",
            address: "Front Beach Alley, 9007 Golden Sands",
            coordinates: {
              latitude: "43.28365485346511",
              longitude: "28.042738484752096",
            },
          },
          ticketTypes: [
            "super early birds",
            "early birds",
            "regular",
            "onsite",
          ],
          maxTicketsPerAccount: 10,
          contacts: "Contacts string",
          status: "upcoming",
          tags: ["#programming", "#VitalikFanBoys"],
        },
      };

      const image = await fetch(
        "https://www.blackseachain.com/assets/img/hero-section/hero-image-compressed.png",
      );
      const imageBlob = await image.blob();

      const populatedTx = await updateEvent(
        NFT_STORAGE_API_KEY,
        tokenId,
        metadata,
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
