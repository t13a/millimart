import express, { Router } from "express";
import {
  CloudEvent,
  CloudEventBatchEncoder,
  CloudEventDecoder,
  CloudEventEncoder,
  CloudEventSchema,
  EventStore,
  EventStoreHelper,
  EventStoreReadOptions,
  fromAsync,
} from "millimart-kernel";
import {
  tryCatchIntoResult,
  tryCatchIntoResultAsync,
} from "option-t/PlainResult";
import { z } from "zod";
import { processRequest, validateRequest } from "zod-express-middleware";

export type CloudEventRouterProps<CE extends CloudEvent> = {
  store: EventStore<CE>;
  schema: z.ZodType<CE>;
  source: string;
};
CloudEventSchema;

export const CloudEventRouter = <CE extends CloudEvent>({
  store,
  schema,
  source,
}: CloudEventRouterProps<CE>): Router => {
  const router = express.Router();

  const internalSchema = schema.and(
    z.object({ source: z.literal(source) }).passthrough(),
  );

  router.post("/events", express.text({ type: "*/*" }), async (req, res) => {
    const result = tryCatchIntoResult(() =>
      new CloudEventDecoder<CE>(internalSchema).fromMessage(req),
    );
    if (!result.ok) {
      return res.status(415).send(result.err);
    }
    await store.append(result.val);
    return res.status(202).send();
  });

  router.get(
    "/events",
    processRequest({
      query: z.object({
        direction: z
          .union([z.literal("backwards"), z.literal("forwards")])
          .optional(),
        from: z.string().min(1).optional(),
        to: z.string().min(1).optional(),
        skip: z.coerce.number().nonnegative().optional(),
        max: z.coerce.number().nonnegative().optional(),
      }),
    }),
    async (req, res) => {
      const options: EventStoreReadOptions = {
        direction: req.query.direction,
        fromEventId: req.query.from,
        toEventId: req.query.to,
        skipCount: req.query.skip,
        maxCount: req.query.max,
      };
      const result = await tryCatchIntoResultAsync(() =>
        fromAsync(store.read(options)),
      );
      if (!result.ok) {
        return res.status(400).send(result.err);
      }
      const message = new CloudEventBatchEncoder(result.val).toMessage();
      return res.status(200).set(message.headers).send(message.body);
    },
  );

  router.get(
    "/events/:eventId",
    validateRequest({
      params: z.object({
        eventId: z.string().min(1),
      }),
    }),
    async (req, res) => {
      const helper = new EventStoreHelper(store);
      const event = await helper.readOne(req.params.eventId);
      if (event === undefined) {
        return res.status(400).send(event);
      }
      const message = new CloudEventEncoder(event).toMessage();
      return res.status(200).set(message.headers).send(message.body);
    },
  );

  return router;
};
