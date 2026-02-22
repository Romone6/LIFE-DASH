import { buildServer } from "./server";
import { env } from "./config";
import { startGovernorScheduler } from "./governor/scheduler";

const server = buildServer();
startGovernorScheduler();

server.listen({ port: env.PORT, host: "0.0.0.0" }).catch((err) => {
  server.log.error(err);
  process.exit(1);
});
