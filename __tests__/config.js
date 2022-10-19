import { ABI, NET_RPC_URL } from "#config";
import { ethers } from "ethers";
import fs from "fs";

const NFT_STORAGE_API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDY4OEYyYjcxMzhlN" +
  "WUxQjJBOWQyQzc2OWREMTNBMUQwRTYyMjI5NjMiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2Mjk" +
  "3MzI5NzMwOSwibmFtZSI6IkV2ZW50LVRpY2tldGluZy1TeXN0ZW0ifQ.x0aXjwdGsIcxibl7eIjxhdF8vnGHB2BB-2gkScySU20";

const EVENTS_TEST_CONTRACT_ADDRESS = "0xB73F457c374C7A53a80475460A11051065cBb361";
const EXAMPLE_ADDRESS = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

const PRIVATE_KEY = fs.readFileSync(".secret").toString().trim();
const provider = ethers.getDefaultProvider(NET_RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const eventsTestContract = new ethers.Contract(EVENTS_TEST_CONTRACT_ADDRESS, ABI, provider);

const mockedMetadata = {
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

const mockedEventParams = {
  title: "",
  description: "",
  eventStartDateStartingInterval: "",
  eventStartDateEndingInterval: "",
  eventEndDateStartingInterval: "",
  eventEndDateEndingInterval: "",
  country: "",
  place: "",
  tags: [],
  sort: {
    startDate: "",
    eventName: "",
    country: "",
    place: "",
  },
  pagination: {
    offset: "",
    limit: "",
  },
};

export {
  NFT_STORAGE_API_KEY,
  EVENTS_TEST_CONTRACT_ADDRESS,
  PRIVATE_KEY,
  provider,
  wallet,
  eventsTestContract,
  EXAMPLE_ADDRESS,
  mockedMetadata,
  mockedEventParams,
};
