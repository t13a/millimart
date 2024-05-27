import cors from "cors";
import express from "express";
import "express-async-errors";
import { InMemoryEventStore, mkt } from "millimart-kernel";
import { CloudEventDebugRouter } from "./routers";
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
