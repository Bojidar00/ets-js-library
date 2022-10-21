import { fetchAllEventsFromServer } from "../src/index";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { mockedEventParams } from "./config";
import { StatusCodes } from "http-status-codes";

describe("user", () => {
  let mock;

  beforeAll(async () => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  test("Gets all events from server", async () => {
    mock.onPost().reply(StatusCodes.OK, ["ipfs://metadataOfEvent1", "ipfs://metadataOfEvent2"]);

    const response = await fetchAllEventsFromServer(mockedEventParams);
    expect(response.data.toString()).toBe("ipfs://metadataOfEvent1,ipfs://metadataOfEvent2");
  });
});
