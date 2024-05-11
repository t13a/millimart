import express from "express";
import { InMemoryEventStore, mkt } from "millimart-kernel";
import { MarketEvent } from "../../millimart-kernel/src/features/market";
import { CloudEventRouter } from "./routes/CloudEventRouter";

const app = express();
const port = 3000;

app.use(
  "/market/events",
  CloudEventRouter<MarketEvent>({
    store: new InMemoryEventStore((event) => event.id),
    schema: mkt.MarketEventSchema,
    source: "/market",
  }),
);

app.listen(port, () => {
  console.log(`MilliMart server listening on port ${port}`);
});
