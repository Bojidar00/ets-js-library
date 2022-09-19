import {uploadDataToIpfs , fetchEventsMetadata , deleteDataFromService} from "./src/utils/ipfs.utils.js"
import { eventTicketingSystemContract, checkRemoveTransaction} from './src/configs/contract.config.js';

export async function createEvent(apiKey, metadata, image, maxTicketPerClient) {
    try {
      const url = await uploadDataToIpfs(
       apiKey,
       metadata,
       image
      );
      let tx = await eventTicketingSystemContract.populateTransaction.createEvent(maxTicketPerClient,url);
      return tx;
    } catch (error) {
      console.error(`Error: ${error}`);
    }


   
  }

export async function fetchEvents(eventIds) {

  try {
    const metadata = await fetchEventsMetadata(eventIds);

   return  metadata;
  } catch (error) {
    console.error(`Error: ${error}`);
  }
}

export async function removeEvent(nftStorageApiKey, eventId, address){

  try {
    await checkRemoveTransaction(address, eventId);
    await deleteDataFromService(nftStorageApiKey, eventId);
  let tx = await eventTicketingSystemContract.populateTransaction.removeEvent(eventId);
return tx;
  }
 catch (error) {
  console.error(`Error: ${error}`);
}

}