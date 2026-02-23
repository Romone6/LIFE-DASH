export type WorkerCommand = {
  cmd: string;
  args: string[];
};

export type CommandRunner = (cmd: string, args: string[]) => Promise<void>;

export const runCommandSequence = async (
  commands: WorkerCommand[],
  runner: CommandRunner
): Promise<void> => {
  for (const command of commands) {
    await runner(command.cmd, command.args);
  }
};
