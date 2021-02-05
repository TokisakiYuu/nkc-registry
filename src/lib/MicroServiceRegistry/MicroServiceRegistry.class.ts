import SocketIO from "socket.io";
import { getLogger } from "log4js";
import colors from "colors";
import onShutdown from "../../util/shutdown";
import onConnection from "./connection";


const log = getLogger("MSRegistry");

export default class MicroServiceRegistry extends SocketIO.Server {

  private port: number;

  constructor() {
    super();
    this.initEvents();
  }

  initEvents(): void {
    this.on("error", (err) => {
      log.error(`${colors.bgGreen(` ${colors.black("error")} `)} event triggered\n`, err);
    });
    this.on("connection", onConnection(this));
  }

  listen(port: number): this {
    this.port = port;
    super.listen(port);
    log.info(colors.bold(`${colors.green("Start")} listening ${port}`));
    onShutdown((done) => {
      this.close(() => {
        done(0);
      });
    });
    return this;
  }

  close(fn?: (err?: Error) => void): void {
    super.close(fn);
    log.info(colors.bold(`${colors.blue("Stop")} listening ${this.port}`));
  }
}
