export const BackoffStrategy = {
    linear: "linear",
    exponential: "exponential",
    fibonacci: "fibonacci",
    random: "random",
};

function getRetryDelay(strategy: string = BackoffStrategy.linear, retryCount: number = 1, startDelay: number = 0.1) {
    let delay;
    if (strategy === BackoffStrategy.exponential) {
        delay = startDelay;
        for (let i = 2; i <= retryCount; i++) {
            delay = delay * 2;
        }
    } else if (strategy === BackoffStrategy.linear) {
        delay = startDelay * retryCount;
    } else if (strategy === BackoffStrategy.fibonacci) {
        let preDelay = 1;
        delay = startDelay;
        for (let i = 2; i <= retryCount; i++) {
            delay = delay + preDelay;
            preDelay = delay - preDelay;
        }
    } else if (strategy === BackoffStrategy.fibonacci) {
        delay = Math.random() * startDelay + startDelay;
    }

    return delay ?? startDelay;
}

export async function retry<T extends (...arg0: any[]) => any>(
    fn: T,
    args: Parameters<T>,
    maxTry: number,
    startDelay: number = 0.1,
    strategy = BackoffStrategy.linear,
    retryCount: number = 1
): Promise<Awaited<ReturnType<T>>> {
    const fnName = fn.name;
    try {
        return await fn(...args);
    } catch (e) {
        if (retryCount > maxTry) {
            console.log(`All ${maxTry} retry attempts to execute ${fnName} exhausted`);
            throw e;
        }
        const delay = getRetryDelay(strategy, retryCount, startDelay);
        console.log(`Attempt ${retryCount}: Execute ${fnName} failed. Retrying in ${delay}s`);
        await new Promise((resolve) => setTimeout(resolve, delay * 1000));
        return retry(fn, args, maxTry, startDelay, strategy, retryCount + 1);
    }
}
