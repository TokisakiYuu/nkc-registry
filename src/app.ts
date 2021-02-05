import "./config/runtime";
import "./config/log4js";
import * as runtime from "./config/runtime";
import { MicroServiceRegistry } from "./lib/MicroServiceRegistry";

const port = runtime.get("server port");

export function startup(): void {
  const server = new MicroServiceRegistry();
  server.listen(parseInt(port));
}
