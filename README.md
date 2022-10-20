# ets-js-library

## About

This is a JavaScript library for interacting with event ticketing system. It creates unsigned transactions and fetches data from smart contracts and ipfs.

### Users of the system

- Visitor:
  Can search for events and buy tickets.
- Organizers of event:
  - Admin:
    Can control everything on his events.
  - Moderator:
    Can do everything except managing roles and deleting the event.
  - Cashier:
    Can operate with the funds collected from the event.
  - Validator:
    Can mark a ticket as "used".

## How to use

Install:

```bash
npm i ets-js-library
```

### Create event

1. Create an api token from [nft.storage](https://nft.storage/)
2. Import createEvent function from the library.
3. Create metadata for the new event.
4. Execute creteEvent function. This will return an unsigned transaction.
5. Sign and send the transaction anyway you like.

```js
import { createEvent } from "ets-js-library";

const metadata = {
  name: "Event1",
  description: "Event1 Description",
  image: "Blob or File Object",
  properties: {
    websiteUrl: "https://event1.com",
    date: {
      start: "2022-10-01",
      end: "2022-10-03",
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
    tags: ["#programming", "#blockchain"],
  },
};

const key = "API key for NFT.storage";

const transaction = await createEvent(key, metadata, maxTicketsPerClient);
//You need to sign and send the transaction after this.
```

### Update event

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
  description: "Event1 Description",
  image: "Blob or File Object",
  properties: {
    websiteUrl: "https://event1.com",
    date: {
      start: "2022-10-01",
      end: "2022-10-03",
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
    tags: ["#programming", "#blockchain"],
  },
};

const key = "API key for NFT.storage";
const eventId = "Id of event in smart contract";

const metadataUri = await getEventIpfsUri(eventId);

try {
  const transaction = await updateEvent(key, eventId, metadata);

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

const key = "API key for NFT.storage";
const eventId = "Id of event in smart contract";

const metadataUri = await getEventIpfsUri(eventId);

try {
  const transaction = await removeEvent(eventId);

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
const eventIds = [1, 2, 3];

const events = fetchEvents(eventIds);
```

### Fetch owned events

1. Import fetchOwnedEvents function from the library.
2. Execute fetchOwnedEvents by supplying an address.

```js
import { fetchOwnedEvents } from "ets-js-library";

const address = "Address of events owner.";

const events = fetchOwnedEvents(address);
```

### Fetch cached events from server

1. Import fetchAllEventsFromServer function from the library.
2. Create params.
3. Execute fetchAllEventsFromServer.

```js
import { fetchAllEventsFromServer } from "ets-js-library";

const params = {
  keywords: {
    title: "",
    titleDesc: "",
    preference: "",
  },
  minStartDate: "",
  maxStartDate: "",
  eventEndDateStartingInterval: "",
  eventEndDateEndingInterval: "",
  country: "",
  place: "",
  tags: {
    tags: [],
    preference: "",
  },
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
  organizer: "",
};

//This parameter is optional
const serverUrl = "http://localhost:1337";

const events = fetchAllEventsFromServer(params, serverUrl);
```

### Fetch Countries from server

1. Import fetchCountriesFromServer function from the library.
2. Execute fetchCountriesFromServer.

```js
import { fetchCountriesFromServer } from "ets-js-library";

//This parameter is optional
const serverUrl = "http://localhost:1337";

const countries = fetchCountriesFromServer(serverUrl);
```

### Fetch Places from server

1. Import fetchPlacesFromServer function from the library.
2. Execute fetchPlacesFromServer.

```js
import { fetchPlacesFromServer } from "ets-js-library";

//This parameter is optional
const serverUrl = "http://localhost:1337";
const country = "Bulgaria";

const places = fetchPlacesFromServer(country, serverUrl);
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

const eventId = "Id of event in smart contract";
const address = "Address of new member.";
const role = utils.keccak256(utils.toUtf8Bytes("MODERATOR_ROLE"));

const transaction = await addTeamMember(eventId, role, address);
//You need to sign and send the transaction after this.
```

### Remove team member from event

1. Import removeTeamMember function from the library.
2. Import utils function from ethers.
3. Generate the hash of the role.
4. Execute removeTeamMember function. This will return an unsigned transaction.
5. Sign and send the transaction anyway you like.

```js
import { removeTeamMember } from "ets-js-library";
import { utils } from "ethers";

const eventId = "Id of event in smart contract";
const address = "Address of team member.";
const role = utils.keccak256(utils.toUtf8Bytes("MODERATOR_ROLE"));

const transaction = await removeTeamMember(eventId, role, address);
//You need to sign and send the transaction after this.
```

### Fetch all team members of event

1. Import getEventMembers function from the library.
2. Execute getEventMembers function.

```js
import { getEventMembers } from "ets-js-library";

const eventId = "Id of event in smart contract";

const members = await getEventMembers(eventId);
```

### Fetch all event ids

1. Import getEventMembers function from the library.
2. Execute getEventMembers function.

```js
import { fetchAllEventIds } from "ets-js-library";

const eventIds = await fetchAllEventIds();
```

### Listen for new events

1. Import listenForNewEvent function from the library.
2. Create a callback function.
3. Supply callback function to listenForNewEvent as parameter.

```js
import { listenForNewEvent } from "ets-js-library";

function callback(data, membersData) {
  //This function will be called when the event is emitted.
}

listenForNewEvent(callback);
```

### Listen for event update

1. Import listenForEventUpdate function from the library.
2. Create a callback function.
3. Supply callback function to listenForEventUpdate as parameter.

```js
import { listenForEventUpdate } from "ets-js-library";

function callback(data) {
  //This function will be called when the event is emitted.
}

listenForEventUpdate(callback);
```

### Listen for Role Granted

1. Import listenForRoleGrant function from the library.
2. Create a callback function.
3. Supply callback function to listenForRoleGrant as parameter.

```js
import { listenForRoleGrant } from "ets-js-library";

function callback(data) {
  //This function will be called when the event is emitted.
}

listenForRoleGrant(callback);
```

### Listen for Role Revoked

1. Import listenForRoleRevoke function from the library.
2. Create a callback function.
3. Supply callback function to listenForRoleRevoke as parameter.

```js
import { listenForRoleRevoke } from "ets-js-library";

function callback(data) {
  //This function will be called when the event is emitted.
}

listenForRoleRevoke(callback);
```

## Tests

Run tests:

```sh
npm run test
```

See test coverage:

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

**IMPORTANT**: Prepare husky after you clone the repo.

```sh
npm run prepare
```

Please refer to each project's style and contribution guidelines for submitting patches and additions. In general, we follow the "fork-and-pull" Git workflow.

1. **Fork** the repo on GitHub
2. **Clone** the project to your own machine
3. **Commit** changes to your own branch
4. **Push** your work back up to your fork
5. Submit a **Pull request** so that we can review your changes

NOTE: Be sure to merge the latest from "upstream" before making a pull request!
