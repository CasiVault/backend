import { provider_strk } from "../contracts";
import {num, hash} from "starknet";
import { L2_address } from "../common/config";

export class CheckSuccessfulTransactions{

    private async getLastSuccessfulBlock(){

    }

    public async run(){
        const lastBlock = await provider_strk.getBlock("latest");   
        const keyFilter = [[num.toHex(hash.starknetKeccak("DepositHandled"))]];

        const eventsList = await provider_strk.getEvents({
            address: L2_address,
            from_block: { block_number: 788437 + 1 },
            to_block: { block_number: lastBlock.block_number },
            keys: keyFilter,
            chunk_size: 10,
        });

        console.log(eventsList);
    
    }
}