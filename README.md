# ets-js-library

## About

This is a JavaScript library for interacting with event ticketing system. It creates unsigned transactions and fetches data from smart contracts and ipfs.

## How to use

Install:

```bash
npm i ets-js-library@npm:event-ticketing-system-js-library
```

### Create event:

1. Create an api token from [nft.storage](https://nft.storage/)
2. Import createEvent function from the library.
3. Create metadata for the new event.
4. Execute creteEvent function. This will return an unsigned transaction.
5. Sign and send the transaction anyway you like.

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

### Update event:

1. Create an api token from [nft.storage](https://nft.storage/)
2. Import updateEvent, getEventIpfsUri and deleteFromIpfs from the library.
3. Create new metadata for the event.
4. Execute getEventIpfsUri function. This will return the Uri of the current metadata.
5. Execute updateEvent function. This will return an unsigned transaction.
6. Sign and send the transaction anyway you like.
7. If the transaction succeeds, you can safely delete the old metadata with deleteFromIpfs.

```js
import { updateEvent, getEventIpfsUri, deleteFromIpfs } from "ets-js-library";

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
  deleteFromIpfs(key, metadataUri);
} catch (error) {
  console.log(error);
}
```

### Remove event

1. Create an api token from [nft.storage](https://nft.storage/)
2. Import removeEvent and deleteFromIpfs from the library.
3. Execute removeEvent function. This will return an unsigned transaction.
4. Sign and send the transaction anyway you like.
5. If the transaction succeeds, you can safely delete the old metadata with deleteFromIpfs.

```js
import { removeEvent, deleteFromIpfs } from "ets-js-library";

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

### Fetch events by Ids

1. Import fetchEvents from the library.
2. Execute fetchEvents.

```js
import { fetchEvents } from "ets-js-library";

//Ids of events in smart contract.
let eventIds = [1, 2, 3];

let events = fetchEvents(eventIds);
```

### Fetch owned events

1. Import fetchOwnedEvents function from the library.
2. Execute fetchOwnedEvents by supplying an address.

```js
import { fetchOwnedEvents } from "ets-js-library";

let address = "Address of events owner.";

let events = fetchOwnedEvents(address);
```

### Fetch cached events from server

1. You need to have JWT_SECRET first.
2. Import fetchAllEventsFromServer function from the library.
3. Create params.
4. Execute fetchAllEventsFromServer.

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

### Add team member to event

1. Import addTeamMember function from the library.
2. Import utils function from ethers.
3. Generate the hash of the role.
4. Execute addTeamMember function. This will return an unsigned transaction.
5. Sign and send the transaction anyway you like.

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

1. Import removeTeamMember function from the library.
2. Import utils function from ethers.
3. Generate the hash of the role.
4. Execute removeTeamMember function. This will return an unsigned transaction.
5. Sign and send the transaction anyway you like.

```js
import { removeTeamMember } from "ets-js-library";
import { utils } from "ethers";

let eventId = "Id of event in smart contract";
let address = "Address of team member.";
let role = utils.keccak256(utils.toUtf8Bytes("MODERATOR_ROLE"));

let transaction = await removeTeamMember(eventId, role, address);
//You need to sign and send the transaction after this.
```

## Tests

Run tests:

```sh
npm run test
```

View coverage:

```sh
npm run coverage
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

## Contributing

Please refer to each project's style and contribution guidelines for submitting patches and additions. In general, we follow the "fork-and-pull" Git workflow.

1.  **Fork** the repo on GitHub
2.  **Clone** the project to your own machine
3.  **Commit** changes to your own branch
4.  **Push** your work back up to your fork
5.  Submit a **Pull request** so that we can review your changes

NOTE: Be sure to merge the latest from "upstream" before making a pull request!
