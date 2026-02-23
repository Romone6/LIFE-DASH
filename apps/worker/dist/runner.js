export const runCommandSequence = async (commands, runner) => {
    for (const command of commands) {
        await runner(command.cmd, command.args);
    }
};
