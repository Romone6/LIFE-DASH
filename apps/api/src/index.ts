import { buildServer } from "./server.js";
import { env } from "./config.js";
import { startGovernorScheduler } from "./governor/scheduler.js";
import { startExperimentScheduler } from "./experiments/scheduler.js";

const server = buildServer();
startGovernorScheduler();
startExperimentScheduler();

server.listen({ port: env.PORT, host: "0.0.0.0" }).catch((err: Error) => {
  server.log.error(err);
  process.exit(1);
});
