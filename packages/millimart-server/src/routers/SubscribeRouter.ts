import express, { Router } from "express";
import { CloudEvent, SubscriptionManager } from "millimart-kernel";
import { z } from "zod";
import { processRequest } from "zod-express-middleware";
import { responseCloudEvent } from "../utils";

export type SubscribeRouterProps<CE extends CloudEvent> = {
  manager: SubscriptionManager<CE>;
};

const QuerySchema = z.object({
  id: z.string().min(1),
});

export const SubscribeRouter = <CE extends CloudEvent>({
  manager,
}: SubscribeRouterProps<CE>): Router => {
  const router = express.Router();

  router.use(express.json());

  router.post(
    "/",
    processRequest({
      query: QuerySchema,
    }),
    async (req, res) => {
      const subscription = manager.get(req.query.id);
      if (!subscription) {
        res.status(404).send();
        return;
      }
      if (subscription.position.from === "Next") {
        res.setHeader("x-last-event-id", subscription.position.lastEventId);
      }
      let event: CE | undefined;
      await subscription.receive((e) => (event = e));
      if (!event) {
        res.status(204).send();
        return;
      }
      return responseCloudEvent(event, req, res);
    },
  );

  return router;
};
