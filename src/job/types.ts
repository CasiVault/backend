export interface Job {
    name: string;
    schedule: string; // cron schedule expression (e.g. '* * * * *')
    task: () => Promise<void> | void;
}
