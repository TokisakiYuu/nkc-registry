import { MicroServiceRegistry } from ".";
import { Socket } from "socket.io";
import { getSocketIdBalanced } from "./serviceIndex";

export default class MicroServiceStore {

  private server: MicroServiceRegistry;
  private messageEventName = "message";

  constructor(server: MicroServiceRegistry) {
    this.server = server;
  }

  setMessageEventName(name: string): void {
    this.messageEventName = name;
  }

  save(socket: Socket): void {
    const { serviceName } = socket.handshake.auth;
    socket.join(`MS-${serviceName}`);
  }

  existService(serviceName: string): boolean {
    const socketIds = this.server.sockets.adapter.rooms.get(`MS-${serviceName}`);
    return socketIds && socketIds.size > 0;
  }

  sendToServiceBalanced(serviceName: string, message: TargetMessage): Record<string, unknown> {
    const sockets = this.server.sockets.sockets;
    const socketId = getSocketIdBalanced(serviceName, () => Array.from(this.server.sockets.adapter.rooms.get(`MS-${serviceName}`)));
    if(!socketId) return null;
    const targetSocket = sockets.get(socketId);
    if(!targetSocket) return null;
    targetSocket.emit(this.messageEventName, message);
    return targetSocket.handshake.auth;
  }
}

type TransportContent = Record<string, unknown>;
type TargetMessage = {
  from: string;
  content: TransportContent
};
