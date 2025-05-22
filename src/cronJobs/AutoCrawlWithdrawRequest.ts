import { Job } from "../job/types";
import { cronTime } from "./CronTime";
import { CrawlWithdrawRequest } from "../job/CrawlWithdrawRequest";
import getLogger from "../utils/LoggerUtils";

const logger = getLogger("CronJob");
export const autoCrawlWithdrawRequest: Job = {
    name: "autoCrawlWithdrawRequest",
    schedule: cronTime.perMinute,
    task: async () => {
        logger.info("Started crawling withdraw requests");
        const crawlWithdrawRequest = new CrawlWithdrawRequest();
        
        try {
            await crawlWithdrawRequest.run();
        } catch (error) {
            logger.error("Error crawling withdraw requests", error);
        }

        logger.info("Finished crawling withdraw requests");
    }
}