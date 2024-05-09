import { createCloudEventFactory } from "../../cloudevents";
import { MarketEvent, MarketEventTypePrefix } from "../MarketEventSchema";

export const createMarketEvent = createCloudEventFactory<
  MarketEvent,
  typeof MarketEventTypePrefix
>(MarketEventTypePrefix);
