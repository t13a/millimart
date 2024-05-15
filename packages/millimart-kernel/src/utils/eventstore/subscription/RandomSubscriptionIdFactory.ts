import { randomUUID } from "crypto";
import { SubscriptionIdFactory } from "./types";

export const RandomSubscriptionIdFactory: SubscriptionIdFactory = (
  subscriptions,
) => {
  const generate = (): string => {
    const id = randomUUID().toString();
    return subscriptions.hasById(id) ? generate() : id;
  };
  return generate;
};
