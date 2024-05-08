import { createCloudEventFactory } from "../../cloudevents";
import { MarketEvent, MarketEventTypePrefix } from "../events";

export const createMarketEvent = createCloudEventFactory<
  MarketEvent,
  typeof MarketEventTypePrefix
>(MarketEventTypePrefix);
