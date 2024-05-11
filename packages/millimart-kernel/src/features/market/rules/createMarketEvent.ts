import { createCloudEventFactory } from "../../../utils";
import { MarketEvent, MarketEventTypePrefix } from "../MarketEventSchema";

export const createMarketEvent = createCloudEventFactory<
  MarketEvent,
  typeof MarketEventTypePrefix
>(MarketEventTypePrefix);
