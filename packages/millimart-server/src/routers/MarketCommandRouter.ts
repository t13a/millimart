import express, { Router } from "express";
import { EventStore, EventStoreError, mkt } from "millimart-kernel";
import { processRequest } from "zod-express-middleware";
import { MarketCommandError } from "../../../millimart-kernel/src/features/market";

export type MarketCommandRouterProps = {
  source: string;
  store: EventStore<mkt.MarketEvent>;
};

export const MarketCommandRouter = ({
  source,
  store,
}: MarketCommandRouterProps): Router => {
  const router = express.Router();

  router.use(express.json());

  router.post(
    "/",
    processRequest({
      body: mkt.MarketCommandSchema,
    }),
    async (req, res) => {
      const service = new mkt.MarketCommandService({ source, store });
      try {
        await service.execute(req.body);
      } catch (error) {
        if (
          error instanceof MarketCommandError ||
          error instanceof EventStoreError
        ) {
          res.status(400).send(error);
          return;
        }
        throw error;
      }
      res.status(202).send();
    },
  );

  return router;
};
