# event-ticketing-system-library
This is a java script library for interacting with event-ticketing system.

## How to use

Install:

```bash
npm install event-ticketing-system-js-library
````

Create event:

```js
import {createEvent} from 'event-ticketing-system-js-library';


 const metadata = {
    name: "Event1",
    eventId,
    websiteUrl: "https://event1.com",
    posterImageUrl: imageCidGatewayUrl,
    date: {
      start: Math.floor(Date.now() / 1000),
      end: Math.floor(Date.now() / 1000) + 60 * 60,
    },
    location: {
      country: "Bulgaria",
      city: "Varna",
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
  };
  let key ="API key for NFT.storage";
  let transaction =await lib.createEvent(key,metadata, image,maxTicketsPerClient);
````