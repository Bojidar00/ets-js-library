import { NFTStorage } from "nft.storage";
import axios from "axios";
import { ethers } from "ethers";
import { NET_RPC_URL, EVENTS_CONTRACT_ADDRESS, ABI, IPFS_GATEWAY_PROVIDER_URL } from "#config";

const provider = ethers.getDefaultProvider(NET_RPC_URL);
const eventsContract = new ethers.Contract(EVENTS_CONTRACT_ADDRESS, ABI, provider);

function makeGatewayUrl(ipfsURI) {
  return ipfsURI.replace(/^ipfs:\/\//, IPFS_GATEWAY_PROVIDER_URL);
}

async function uploadDataToIpfs(nftStorageApiKey, metadata, image) {
  const client = new NFTStorage({ token: nftStorageApiKey });
  metadata.image = image;

  const cid = await client.store(metadata);

  return cid.url;
}

async function deleteDataFromService(nftStorageApiKey, eventUri) {
  const cid = eventUri.split("/")[2];

  const client = new NFTStorage({ token: nftStorageApiKey });

  await client.delete(cid);
}

async function getIpfsUrl(eventId, contract = eventsContract) {
  const eventUri = await contract.tokenURI(eventId);
  return eventUri;
}

async function fetchEventsMetadata(eventIds, contract = eventsContract) {
  const eventsMetadata = [];

  for (const eventId of eventIds) {
    try {
      const eventUri = await contract.tokenURI(eventId);
      const url = makeGatewayUrl(eventUri);
      const eventMetadata = await axios.get(url);

      eventMetadata.data.eventId = eventId;
      eventMetadata.data.cid = eventUri;
      eventsMetadata.push(eventMetadata.data);
    } catch (error) {
      return { error };
    }
  }

  return eventsMetadata;
}

export { uploadDataToIpfs, deleteDataFromService, fetchEventsMetadata, getIpfsUrl, makeGatewayUrl };
