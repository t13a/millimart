import express, { Router } from "express";
import {
  CloudEvent,
  CloudEventBatchEncoder,
  CloudEventDecoder,
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
import { responseCloudEvent } from "../utils";

export type EventRouterProps<CE extends CloudEvent> = {
  schema: z.ZodType<CE>;
  source: string;
  store: EventStore<CE>;
};
CloudEventSchema;

export const EventStoreRouter = <CE extends CloudEvent>({
  schema,
  store,
}: EventRouterProps<CE>): Router => {
  const router = express.Router();

  router.post("/", express.text({ type: "*/*" }), async (req, res) => {
    const decoder = new CloudEventDecoder<CE>(schema);
    const result = tryCatchIntoResult(() => decoder.fromMessage(req));
    if (!result.ok) {
      return res.status(415).send(result.err);
    }
    await store.append(result.val);
    return res.status(202).send();
  });

  router.get(
    "/",
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
      const encoder = new CloudEventBatchEncoder(result.val);
      const message = encoder.toMessage();
      return res.status(200).set(message.headers).send(message.body);
    },
  );

  router.get(
    "/:eventId",
    validateRequest({
      params: z.object({
        eventId: z.string().min(1),
      }),
    }),
    async (req, res) => {
      const helper = new EventStoreHelper(store);
      const event = await helper.readOne(req.params.eventId);
      return responseCloudEvent(event, req, res);
    },
  );

  return router;
};
