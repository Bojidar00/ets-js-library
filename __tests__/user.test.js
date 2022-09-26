import { createEvent } from "../src/index";
import fetch from "@web-std/fetch";
import { ethers } from "ethers";

const NFT_STORAGE_API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDY4OEYyYjcxMzhlNWUxQjJBOWQyQzc2OWREMTNBMUQwRTYyMjI5NjMiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2Mjk3MzI5NzMwOSwibmFtZSI6IkV2ZW50LVRpY2tldGluZy1TeXN0ZW0ifQ.x0aXjwdGsIcxibl7eIjxhdF8vnGHB2BB-2gkScySU20";

describe("user", () => {
  test("Creates event", async () => {
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

    let image = await fetch(
      "https://www.blackseachain.com/assets/img/hero-section/hero-image-compressed.png"
    );
    let imageBlob = await image.blob();

    const tx = await createEvent(NFT_STORAGE_API_KEY, metadata, imageBlob, 10);
    const functionSig = ethers.utils
      .keccak256(ethers.utils.toUtf8Bytes("createEvent(uint256,string)"))
      .slice(0, 10);

    // Calls the right function from smart contract
    expect(functionSig).toBe(tx.data.slice(0, 10));
  });
});
