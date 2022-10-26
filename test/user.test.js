import { fetchAllEventsFromServer } from "../src/index.js";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { mockedEventParams } from "./config.js";
import { StatusCodes } from "http-status-codes";
import { expect } from "chai";

describe("User tests", () => {
  let mock;

  before(async () => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  it("Gets all events from server", async () => {
    mock.onPost().reply(StatusCodes.OK, ["ipfs://metadataOfEvent1", "ipfs://metadataOfEvent2"]);

    const response = await fetchAllEventsFromServer(mockedEventParams);
    expect(response.data.toString()).to.equal("ipfs://metadataOfEvent1,ipfs://metadataOfEvent2");
  });
});
