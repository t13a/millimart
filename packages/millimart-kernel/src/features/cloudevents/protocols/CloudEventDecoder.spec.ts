import { Message } from "cloudevents";
import express from "express";
import { Server } from "http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { CloudEventSchema } from "../CloudEventSchema";
import { CloudEventDecoder } from "./CloudEventDecoder";

type GreetingEvent = z.infer<typeof GreetingEventSchema>;
const GreetingEventSchema = CloudEventSchema.extend({
  type: z.literal("com.example.v1.Greeting"),
  data: z.object({
    message: z.string().min(1),
  }),
});

const jsonEvent: GreetingEvent = {
  id: "123",
  source: "example.com",
  specversion: "1.0",
  type: "com.example.v1.Greeting",
  time: "2006-01-02T15:04:05.000Z",
  datacontenttype: "application/json",
  data: {
    message: "Hello world!",
  },
};

describe("CloudEventDecoder", () => {
  describe("fromMessage", () => {
    it("convert Message to CloudEvent", () => {
      const message: Message = {
        headers: {
          "ce-id": "123",
          "ce-source": "example.com",
          "ce-specversion": "1.0",
          "ce-type": "com.example.v1.Greeting",
          "ce-time": "2006-01-02T15:04:05.000Z",
          "content-type": "application/json",
        },
        body: '{"message":"Hello world!"}',
      };
      const event = new CloudEventDecoder(GreetingEventSchema).fromMessage(
        message,
      );
      expect(event).toStrictEqual({
        id: "123",
        source: "example.com",
        specversion: "1.0",
        type: "com.example.v1.Greeting",
        time: "2006-01-02T15:04:05.000Z",
        datacontenttype: "application/json",
        data: {
          message: "Hello world!",
        },
      });
    });
  });

  describe("fromResponse", () => {
    const port = 9999;
    let server: Server | undefined;

    beforeEach(() => {
      server = express()
        .get("/", (_req, res) => {
          res
            .status(200)
            .type("application/cloudevents+json")
            .send(JSON.stringify(jsonEvent));
        })
        .listen(port);
    });

    afterEach(() => {
      server?.close();
      server = undefined;
    });

    it("converts Response to CloudEvent", async () => {
      const res = await fetch(`http://localhost:${port}/`);
      const e = await new CloudEventDecoder(GreetingEventSchema).fromResponse(
        res,
      );
      expect(e).toStrictEqual(jsonEvent);
    });
  });
});
