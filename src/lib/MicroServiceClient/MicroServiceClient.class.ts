import { io as SocketIO, Socket } from "socket.io-client";
import socketIoOptions from "../../config/socketIo";
import * as runtime from "../../config/runtime";
import { getLogger } from "log4js";
import colors from "colors";
import ClientError from "./ClientError";
import EventEmitter from "events";

const log = getLogger("socket.io");
const messageEventName = runtime.get("message event sign");

export default class CommunicationClient extends EventEmitter {
  name: string;
  id: string;
  tag: string;
  socket: Socket;
  connected: boolean;

  constructor(props: ClientProps) {
    super();
    this.name = props.name;
    this.id = props.id;
    this.tag = `${this.name} ${this.id}`;
    const serverHost = runtime.get("server host");
    const serverPort = runtime.get("server port");
    this.socket = this.createSocket(`http://${serverHost}:${serverPort}`);
    this.initEvents();
  }

  createSocket(this: CommunicationClient, wsUrl: string): Socket {
    return SocketIO(wsUrl, {
      ...socketIoOptions,
      auth: {
        serviceName: this.name,
        serviceId: this.id
      }
    });
  }

  async connect(this: CommunicationClient): Promise<void> {
    const { socket } = this;
    return new Promise((resolve, reject) => {
      if(socket.connected) return resolve();
      setTimeout(() => {
        socket.off("connect", connectedHandler);
        reject(new ClientError(500, `${this.tag} connect timeout`));
      }, 1000);
      const connectedHandler = () => {
        socket.off("connect", connectedHandler);
        resolve();
      };
      socket.on("connect", connectedHandler);
      socket.connect();
    });
  }

  initEvents(this: CommunicationClient): void {
    const printEvent = (eventName: string) => log.debug(`${colors.bold(this.tag)} ${colors.bgGreen(` ${colors.black(eventName)} `)} event triggered`);
    const { socket } = this;
    socket.on("connect", () => {
      printEvent("connect");
      this.connected = true;
      this.emit("connect");
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on("disconnect", (err: any) => {
      printEvent("disconnect");
      this.connected = false;
      this.emit("disconnect", err);
    });
    socket.on("reconnect", () => {
      printEvent("reconnect");
      this.connected = true;
      this.emit("reconnect");
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on("error", (err: any) => {
      printEvent("error");
      if(err) log.error(err);
      this.emit("error", err);
    });
    socket.on(messageEventName, (data: ClientOnMessageData) => this.emit("message", data));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async postMessage(this: CommunicationClient, targetServiceName: string, content: Record<string, unknown>): Promise<any> {
    const { socket } = this;
    if(!this.connected) {
      await this.connect();
    }
    return new Promise((resolve, reject) => {
      socket.emit(messageEventName, {
        to: targetServiceName,
        content
      }, (res: ClientOnMessageData) => {
        const { status, content = {} } = res;
        if(status === 200) {
          resolve(content);
        } else {
          reject(new ClientError(status, content.message));
        }
      });
    })
    .catch((error: ClientError) => log.error(error));
  }
}

interface ClientProps {
  name: string;
  id: string;
}

export interface ClientOnMessageData {
  status: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
}
