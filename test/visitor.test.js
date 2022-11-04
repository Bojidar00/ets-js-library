import { fetchAllEventsFromServer, fetchCountriesFromServer, fetchPlacesFromServer } from "../src/index.js";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { mockedEventParams } from "./config.js";
import { StatusCodes } from "http-status-codes";
import { expect } from "chai";

describe("Visitor tests", () => {
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

  it("Gets all countries from server", async () => {
    mock.onGet().reply(StatusCodes.OK, ["country1", "country2"]);

    const response = await fetchCountriesFromServer();
    expect(response.data.toString()).to.equal("country1,country2");
  });

  it("Gets all places from server", async () => {
    const country = "Bulgaria";
    mock.onGet().reply(StatusCodes.OK, ["place1", "place2"]);

    const response = await fetchPlacesFromServer(country);
    expect(response.data.toString()).to.equal("place1,place2");
  });
});
