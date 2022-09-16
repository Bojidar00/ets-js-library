import { NFTStorage } from 'nft.storage';
import axios from 'axios';

import { eventTicketingSystemContract} from '../configs/contract.config.js';


const IPFS_GATEWAY_PROVIDER_URL = "https://nftstorage.link/ipfs/";

function makeGatewayUrl(ipfsURI) {
  return ipfsURI.replace(/^ipfs:\/\//, IPFS_GATEWAY_PROVIDER_URL);
}

async function uploadDataToIpfs(nftStorageApiKey, metadata, image) {
  const client = new NFTStorage({ token: nftStorageApiKey });
  metadata.image = image;

  const cid = await client.store(metadata);

  return cid.url;
}

async function deleteDataFromService(nftStorageApiKey, cid) {
  const client = new NFTStorage({ token: nftStorageApiKey });

  await client.delete(cid);
}

async function fetchEventsMetadata(eventIds) {
  const eventsMetadata = [];

  for (const eventId of eventIds) {
    try {
      const eventUri =
        await  eventTicketingSystemContract.eventTicketingSystemContract.tokenURI(eventId);

      const url = makeGatewayUrl(eventUri);

      const eventMetadata = await axios.get(url);

      eventsMetadata.push(eventMetadata.data);
    } catch (error) {
      return { error: error.reason };
    }
  }

  return eventsMetadata;
}

async function uploadImg(nftStorageApiKey ,img){
  const client = new NFTStorage({ token: nftStorageApiKey });
  const cid = await client.store(img);
  return cid.url;
} 

export {
  uploadDataToIpfs,
  deleteDataFromService,
  fetchEventsMetadata,
};

