const NFT_STORAGE_API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDY4OEYyYjcxMzhlN" +
  "WUxQjJBOWQyQzc2OWREMTNBMUQwRTYyMjI5NjMiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2Mjk" +
  "3MzI5NzMwOSwibmFtZSI6IkV2ZW50LVRpY2tldGluZy1TeXN0ZW0ifQ.x0aXjwdGsIcxibl7eIjxhdF8vnGHB2BB-2gkScySU20";

const EXAMPLE_ADDRESS = "0x16514b719274484b06d56459f97139b333bd8130";

const mockedMetadata = {
  name: "Event5",
  description: "Event5 Description",
  image: "null",
  properties: {
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

const mockedCategoryMetadata = {
  name: "Category1",
  description: "Category1 Description",
  image: "null",
  properties: {
    ticketTypesCount: {
      type: "semi_fungible or non_fungible",
      places: 10,
    },
    design: {
      color: "color",
    },
  },
};

const mockedContractData = {
  saleStartDate: 1666601372, // unix timestamp
  saleEndDate: 1666601572, // unix timestamp
  ticketsCount: 50,
  ticketPrice: 10,
  discountsTicketsCount: [10, 5], // buddy ignore:line
  discountsPercentage: [20, 10], // buddy ignore:line
  downPayment: {
    price: 2,
    finalAmountDate: 1666666666, // unix timestamp
  },
};

export {
  NFT_STORAGE_API_KEY,
  EXAMPLE_ADDRESS,
  mockedMetadata,
  mockedEventParams,
  mockedCategoryMetadata,
  mockedContractData,
};
