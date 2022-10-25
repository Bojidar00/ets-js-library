const path = require("path");
const fs = require("fs");
const { NET_RPC_URL, NET_RPC_URL_ID, TOKEN_NAME, NET_LABEL } = require("../../config/index.config");

function configUpdateContractAddresses(TicketDiamondAddress, EventDiamondAddress) {
  const data = `const TICKETS_CONTRACT_ADDRESS = "${TicketDiamondAddress}";
const EVENTS_CONTRACT_ADDRESS = "${EventDiamondAddress}";
const NET_RPC_URL = "${NET_RPC_URL}";
const NET_RPC_URL_ID = "${NET_RPC_URL_ID}";
const TOKEN_NAME = "${TOKEN_NAME}";
const NET_LABEL = "${NET_LABEL}";
    
module.exports = {
  TICKETS_CONTRACT_ADDRESS,
  EVENTS_CONTRACT_ADDRESS,
  NET_RPC_URL,
  NET_RPC_URL_ID,
  TOKEN_NAME,
  NET_LABEL,
};`;

  fs.writeFileSync(path.join(__dirname, "..", "..", "config", "index.config.js"), data);
}

module.exports = {
  configUpdateContractAddresses,
};
