import cron, { ScheduledTask } from "node-cron";
import { Job } from "./types";

const jobMap = new Map<string, ScheduledTask>();

export const startJob = (job: Job) => {
    if (!jobMap.has(job.name)) {
        const task = cron.schedule(job.schedule, job.task);
        jobMap.set(job.name, task);
        console.log(`✅ Started job "${job.name}"`);
    } else {
        console.log(`⚠️ Job "${job.name}" is already running`);
    }
};

export const stopJob = (job: Job) => {
    const task = jobMap.get(job.name);
    if (task) {
        task.stop();
        jobMap.delete(job.name);
        console.log(`🛑 Stopped job "${job.name}"`);
    } else {
        console.log(`⚠️ Job "${job.name}" is not running`);
    }
};

export const getRunningJobs = (): string[] => {
    return Array.from(jobMap.keys());
};
