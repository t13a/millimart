import { SubscriptionIdFactory } from "./types";

export const SequentialSubscriptionIdFactory: SubscriptionIdFactory = () => {
  let sequence = 1;
  return (): string => (sequence++).toString();
};
