# ets-js-library

## About

This is a JavaScript library for interacting with event ticketing system. It creates unsigned transactions and fetches data from smart contracts and ipfs.

## How to use

Install:

Add this to package.json:

```bash
"ets-js-library": "github:Applied-Blockchain-Lab/ets-js-library"
```

```bash
npm install
```

Create event:

```js
import { createEvent } from "ets-js-library";

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
let key = "API key for NFT.storage";
let transaction = await createEvent(key, metadata, image, maxTicketsPerClient);
//You need to sign and send the transaction after this.
```

Update event:

```js
import { updateEvent, getEventIpfsUri } from "ets-js-library";
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
let key = "API key for NFT.storage";
let eventId = "Id of event in smart contract";

let metadataUri = await getEventIpfsUri(eventId);

try {
  let transaction = await updateEvent(key, eventId, metadata, image);
  //You need to sign and send the transaction here.
  deleteFromIpfs(localStorage.apiToken, metadataUri);
} catch (error) {
  console.log(error);
}
```

Remove event

```js
import { removeEvent } from "ets-js-library";

let key = "API key for NFT.storage";
let eventId = "Id of event in smart contract";

let metadataUri = await getEventIpfsUri(eventId);

try {
  let transaction = await removeEvent(eventId);
  //You need to sign and send the transaction here.
  deleteFromIpfs(key, metadataUri);
} catch (error) {
  console.log(error);
}
```

Fetch events by Ids

```js
import { fetchEvents } from "ets-js-library";

//Ids of events in smart contract.
let eventIds = [1, 2, 3];

let events = fetchEvents(eventIds);
```

Fetch owned events

```js
import { fetchOwnedEvents } from "ets-js-library";

let address = "Address of events owner.";

let events = fetchOwnedEvents(address);
```

Fetch cached events from server

```js
import {fetchAllEventsFromServer} from 'ets-js-library';

let params = {
  title: "",
  description: "",
  eventStartDateStartingInterval: "",
  eventStartDateEndingInterval: "",
  eventEndDateStartingInterval: "",
  eventEndDateEndingInterval: "",
  country: "",
  place: "",
  tags: "",
  sort: "",
  pagination: "",
  organizer: "";
};

let events = fetchAllEventsFromServer(serverUrl, JWT_SECRET, params);
```

Add team member to event

```js
import { addTeamMember } from "ets-js-library";
import { utils } from "ethers";

let eventId = "Id of event in smart contract";
let address = "Address of new member.";
let role = utils.keccak256(utils.toUtf8Bytes("MODERATOR_ROLE"));
let transaction = await addTeamMember(eventId, role, address);
//You need to sign and send the transaction after this.
```

Remove team member from event

```js
import { removeTeamMember } from "ets-js-library";
import { utils } from "ethers";

let eventId = "Id of event in smart contract";
let address = "Address of team member.";
let role = utils.keccak256(utils.toUtf8Bytes("MODERATOR_ROLE"));
let transaction = await removeTeamMember(eventId, role, address);
//You need to sign and send the transaction after this.
```

## Conventions and standards

Commit message format

```bash
feat: Add beta sequence
^--^ ^---------------^
| |
| +-> Summary in present tense.
|
+-------> Type: chore, docs, feat, fix, refactor, style, or test.
```
