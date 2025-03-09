export abstract class Log {
    private static subscribers: Set<Log.Subscriber> = new Set<Log.Subscriber>()

    public static log(log: Log.Line): void {
        this.subscribers.forEach(sub => sub(log))
    }

    public static subscribe(callback: Log.Subscriber): void {
        this.subscribers.add(callback);
    }

    public static unsubscribe(callback: Log.Subscriber): void {
        this.subscribers.delete(callback);
    }

}

export class Logger {
    public context: string;

    constructor(cxt: string) {
        this.context = cxt
    }

    private log(level: Log.Level, message: string): void {
        let context = this.context;
        let datetime = new Date();

        Log.log({
            level,
            context,
            message,
            datetime
        })
    }

    public debug = (message: string) => this.log(Log.Level.DEBUG, message)
    public info = (message: string) => this.log(Log.Level.INFO, message)
    public warn = (message: string) => this.log(Log.Level.WARN, message)
    public error = (message: string) => this.log(Log.Level.ERROR, message)
}

export namespace Log {
    export interface Interface {
        debug(message: string): void
        info(message: string): void
        warn(message: string): void
        error(message: string): void
    }

    export enum Level {
        INFO,
        DEBUG,
        WARN,
        ERROR
    }

    export type Line = {
        level:   Level
        context: string
        message: string
        datetime:    Date
    }

    export type Subscriber = (log: Log.Line) => void
}