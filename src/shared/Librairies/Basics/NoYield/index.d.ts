declare function NoYield<T extends Callback>(Callback: T, ...Args: Parameters<T>): ReturnType<(typeof coroutine)["resume"]>;

export = NoYield;
