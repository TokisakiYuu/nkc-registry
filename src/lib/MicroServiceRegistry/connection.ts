import { Socket } from "socket.io";
import { MicroServiceRegistry } from ".";
import MicroServiceStore from "./MicroServiceStore.class";
import * as runtime from "../../config/runtime";
import { getLogger } from "log4js";
import colors from "colors";

const log = getLogger("MSRegistry");
const DTLog = getLogger("DT");
const messageEventName = runtime.get("message event sign");

export default function onConnection(server: MicroServiceRegistry): (socket: Socket) => void {

  const store = new MicroServiceStore(server);
  store.setMessageEventName(messageEventName);

  return (socket) => {
    const { serviceName, serviceId } = socket.handshake.auth;
    log.info(`${colors.green.bold("Micro Service Connected")} ${colors.bold(`${serviceName} ${serviceId}`)}`);
    store.save(socket);
    socket.on("error", (err: unknown) => log.error(err));
    socket.on("disconnect", () => log.warn(`${colors.yellow("Micro Service Disconnect")} ${serviceName} ${serviceId}`));
    socket.on(messageEventName, async (message: ClientMessage, sendCallback: (data: ResponseMessage) => void) => {
      const { to: targetServiceName, content } = message;
      if(!store.existService(targetServiceName)) {
        sendCallback({
          status: 500,
          content: {
            message: "Target service not found"
          }
        });
        log.info(`${colors.blue.bold("Data Transport")} ${colors.bold("Registry")} == ${colors.bgMagenta.white(` ${colors.bold(targetServiceName)} not found `)} ==> ${colors.bold(`${serviceName} ${serviceId}`)}`);
      } else {
        const targetAuth = store.sendToServiceBalanced(targetServiceName, {
          from: serviceName,
          content
        });
        DTLog.info(`${colors.blue.bold("Data Transport")} ${colors.bold(`${serviceName} ${serviceId}`)} ==(Data)==> ${colors.bold(`${targetAuth.serviceName} ${targetAuth.serviceId}`)}`);
      }
    });
  };
}

type TransportContent = Record<string, unknown>;
type ClientMessage = {
  to: string;
  content: TransportContent;
}
type ResponseMessage = {
  status: number;
  content: TransportContent;
}
