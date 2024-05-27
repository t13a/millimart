import cors from "cors";
import express from "express";
import "express-async-errors";
import {
  InMemoryEventStore,
  InMemorySubscriptionManager,
  mkt,
} from "millimart-kernel";
import {
  CloudEventDebugRouter,
  HttpSubscriptionRouter,
  SubscriptionManagerRouter,
} from "./routers";
import { errorHandler } from "./utils/errorHandler";

const app = express();
const port = 3000;

app.use(cors());

const marketEventStore = new InMemoryEventStore<mkt.MarketEvent>(
  (event) => event.id,
);
const source = "/market";
app.use(
  "/market/events",
  CloudEventDebugRouter<mkt.MarketEvent>({
    store: marketEventStore,
    schema: mkt.MarketEventSchema,
    source,
  }),
);

const marketSubscriptionManager =
  new InMemorySubscriptionManager<mkt.MarketEvent>({
    store: marketEventStore,
  });
app.use(
  "/events",
  HttpSubscriptionRouter<mkt.MarketEvent>({
    headersCallback: () => {
      return { "Content-Type": "application/cloudevents+json" };
    },
    manager: marketSubscriptionManager,
  }),
);
app.use(
  "/subscriptions",
  SubscriptionManagerRouter<mkt.MarketEvent>({
    manager: marketSubscriptionManager,
  }),
);

// Append random user every 5 seconds (for testing).
setInterval(() => {
  const user = mkt.generateRandomUser();
  const event = mkt.createMarketEvent("UserEntered", {
    source,
    data: { user },
  });
  marketEventStore.append(event);
}, 5000);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`MilliMart server listening on port ${port}`);
});
