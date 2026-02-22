import { buildServer } from "./server";
import { env } from "./config";
import { startGovernorScheduler } from "./governor/scheduler";
import { startExperimentScheduler } from "./experiments/scheduler";

const server = buildServer();
startGovernorScheduler();
startExperimentScheduler();

server.listen({ port: env.PORT, host: "0.0.0.0" }).catch((err) => {
  server.log.error(err);
  process.exit(1);
});
