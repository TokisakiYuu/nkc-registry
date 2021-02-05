import EventEmitter from "events";
import exit from "exit";
import onExit from "signal-exit";

const emitter = new EventEmitter();

process.on("message", (msg) => {
  if (msg !== "shutdown") return;
  emitter.emit("shutdown");
});

onExit(() => {
  emitter.emit("shutdown");
});

function exitProcess(code?: number): void {
  exit(code || 0);
}

export default function(callback: ShutDownHandler): void {
  emitter.once("shutdown", () => callback(exitProcess));
}

type ShutDownHandler = (done: doneFn) => void;
type doneFn = (code?: number) => void;
