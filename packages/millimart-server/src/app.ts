import cors from "cors";
import express from "express";
import "express-async-errors";
import { InMemoryEventStore, mkt } from "millimart-kernel";
import {
  MarketEvent,
  createMarketEvent,
  generateRandomUser,
} from "../../millimart-kernel/src/features/market";
import { CloudEventRouter } from "./routes/CloudEventRouter";
import { errorHandler } from "./utils/errorHandler";

const app = express();
const port = 3000;

app.use(cors());

const marketEventStore = new InMemoryEventStore<MarketEvent>(
  (event) => event.id,
);
const source = "/market";
app.use(
  source,
  CloudEventRouter<MarketEvent>({
    store: marketEventStore,
    schema: mkt.MarketEventSchema,
    source,
  }),
);

// Append random user every 5 seconds (for testing).
setInterval(() => {
  const user = generateRandomUser();
  const event = createMarketEvent("UserEntered", { source, data: { user } });
  marketEventStore.append(event);
}, 5000);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`MilliMart server listening on port ${port}`);
});
