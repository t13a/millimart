import express, { Router } from "express";
import { SubscriptionManager } from "millimart-kernel";
import { z } from "zod";
import { processRequest } from "zod-express-middleware";

export type HttpSubscriptionRouterProps<E> = {
  headersCallback?: (event: E) => Record<string, string>;
  manager: SubscriptionManager<E>;
};

const QuerySchema = z.object({
  subscriptionId: z.string().min(1),
});

export const HttpSubscriptionRouter = <E>({
  headersCallback: headers,
  manager,
}: HttpSubscriptionRouterProps<E>): Router => {
  const router = express.Router();

  router.use(express.json());

  router.post(
    "/",
    processRequest({
      query: QuerySchema,
    }),
    async (req, res) => {
      const subscription = manager.get(req.query.subscriptionId);
      if (!subscription) {
        res.status(404).send();
        return;
      }
      let event: E | undefined;
      await subscription.receive((e) => (event = e));
      if (!event) {
        res.status(204).send();
        return;
      }
      res
        .status(200)
        .set(headers ? headers(event) : {})
        .send(event);
    },
  );

  return router;
};
