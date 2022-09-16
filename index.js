import {uploadDataToIpfs} from "./src/utils/ipfs.utils.js"
import { eventTicketingSystemContract} from './src/configs/contract.config.js';

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