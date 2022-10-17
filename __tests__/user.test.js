import { fetchAllEventsFromServer } from "../src/index";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

describe("user", () => {
  let mock;

  beforeAll(async () => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  test("Gets all events from server", async () => {
    const params = {
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

    mock
      .onPost()
      .reply(200, ["ipfs://metadataOfEvent1", "ipfs://metadataOfEvent2"]);

    const response = await fetchAllEventsFromServer(params);
    expect(response.data.toString()).toBe(
      "ipfs://metadataOfEvent1,ipfs://metadataOfEvent2",
    );
  });
});
