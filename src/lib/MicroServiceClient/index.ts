import MicroServiceClientClass from "./MicroServiceClient.class";

export * from "./MicroServiceClient.class";
export const CommunicationClient = MicroServiceClientClass;
export function registerMicroService(name: string, id: string): MicroServiceClientClass {
  return new MicroServiceClientClass({name, id});
}
