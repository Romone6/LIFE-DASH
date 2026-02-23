export type WorkerCommand = {
    cmd: string;
    args: string[];
};
export type CommandRunner = (cmd: string, args: string[]) => Promise<void>;
export declare const runCommandSequence: (commands: WorkerCommand[], runner: CommandRunner) => Promise<void>;
