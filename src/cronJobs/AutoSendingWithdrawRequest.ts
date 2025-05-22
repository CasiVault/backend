import { Job } from "../job/types";
import { cronTime } from "./CronTime";
import { HandlePendingWithdrawRequest } from "../job/HandlePendingWithdrawRequest";
import getLogger from "../utils/LoggerUtils";

const logger = getLogger("CronJob");

export const autoSendingWithdrawRequest: Job = {
    name: "autoSendingWithdrawRequest",
    schedule: cronTime.perMinute,
    task: async () => {
        logger.info("Started sending withdraw requests");
        const handlePendingWithdrawRequest = new HandlePendingWithdrawRequest();
        
        try {
            await handlePendingWithdrawRequest.run();
        } catch (error) {
            logger.error("Error sending withdraw requests", error);
        }

        logger.info("Finished sending withdraw requests");
    },
};
