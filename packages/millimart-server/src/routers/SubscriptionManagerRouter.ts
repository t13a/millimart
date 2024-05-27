import express, { Router } from "express";
import { Subscription, SubscriptionManager } from "millimart-kernel";
import { z } from "zod";
import { processRequest } from "zod-express-middleware";

export type SubscriptionManagerRouterProps<E> = {
  manager: SubscriptionManager<E>;
};

const SubscriptionIdSchema = z.string().min(1);
const SubscriptionPositionSchema = z.union([
  z.object({ from: z.literal("Start") }),
  z.object({ from: z.literal("Next"), lastEventId: z.string().min(1) }),
  z.object({ from: z.literal("End") }),
]);
const SubscriptionRequestSchema = z.object({
  position: SubscriptionPositionSchema.optional(),
});
const SubscriptionParamsSchema = z.object({
  subscriptionId: SubscriptionIdSchema,
});

const serializeSubscription = <E>(subscription: Subscription<E>) => {
  return {
    id: subscription.id,
    position: subscription.position,
  };
};

export const SubscriptionManagerRouter = <E>({
  manager,
}: SubscriptionManagerRouterProps<E>): Router => {
  const router = express.Router();

  router.use(express.json());

  router.post(
    "/",
    processRequest({
      body: SubscriptionRequestSchema,
    }),
    async (req, res) => {
      const subscription = manager.create(req.body);
      res.status(200).send(serializeSubscription(subscription));
    },
  );

  router.get("/", async (_req, res) => {
    const subscriptions = Array.from(manager, (s) => s.id);
    res.status(200).send(subscriptions);
  });

  router.get(
    "/:subscriptionId",
    processRequest({
      params: SubscriptionParamsSchema,
    }),
    async (req, res) => {
      const subscription = manager.get(req.params.subscriptionId);
      if (!subscription) {
        res.status(404).send();
        return;
      }
      res.status(200).send({
        id: subscription.id,
        position: subscription.position,
      });
    },
  );

  router.put(
    "/:subscriptionId",
    processRequest({
      params: SubscriptionParamsSchema,
      body: SubscriptionRequestSchema,
    }),
    async (req, res) => {
      const subscription = manager.get(req.params.subscriptionId);
      if (!subscription) {
        res.status(404).send();
        return;
      }
      subscription.update(req.body);
      res.status(200).send(serializeSubscription(subscription));
    },
  );

  router.delete(
    "/:subscriptionId",
    processRequest({
      params: SubscriptionParamsSchema,
    }),
    async (req, res) => {
      const deleted = manager.delete(req.params.subscriptionId);
      if (!deleted) {
        res.status(404).send();
        return;
      }
      res.status(200).send();
    },
  );

  return router;
};
