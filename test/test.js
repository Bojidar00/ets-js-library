import { deployEventDiamond } from "../tasks/deployEventDiamond.js";
import eventSchema from "../config/EventFacet.json" assert { type: "json" };
import { expect } from "chai";

describe("Testing event deployment", function () {
  let diamondAddress;
  let eventFacet;

  before(async function () {
    diamondAddress = await deployEventDiamond();
    eventFacet = await ethers.getContractAt(eventSchema.abi, diamondAddress);
  });

  describe("Event contract deployment", function () {
    it("Should set the right name and symbol", async function () {
      expect(await eventFacet.name()).to.equal("Events");
      expect(await eventFacet.symbol()).to.equal("ET");
    });
  });
});
