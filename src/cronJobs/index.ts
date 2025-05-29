import { startJob } from "../job/jobManager";
import { autoCrawlWithdrawRequest } from "./AutoCrawlWithdrawRequest";
import getLogger from "../utils/LoggerUtils";

const logger = getLogger("CronJobs");

export namespace CronJobs{
    export async function start(){
        try{
            startJob(autoCrawlWithdrawRequest);
        }
        catch (error) {
            logger.error(`Cron jobs error: ${error}`);
            console.log(error);
        }
    }
}