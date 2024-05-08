import assert from "assert";
import express, { RequestHandler } from "express";
import { Server } from "http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CloudEvent, CloudEventSchema } from "../CloudEventSchema";
import { HttpClientChannel } from "./HttpClientChannel";

const reqEvent: CloudEvent = {
  id: "123",
  source: "request.example.com",
  specversion: "1.0",
  type: "com.example.v1.Greeting",
  time: "2006-01-02T15:04:05.000Z",
  datacontenttype: "application/json",
  data: {
    message: "This is a request",
  },
};

const resEvent: CloudEvent = {
  id: "456",
  source: "response.example.com",
  specversion: "1.0",
  type: "com.example.v1.Greeting",
  time: "2006-01-02T15:04:05.000Z",
  datacontenttype: "application/json",
  data: {
    message: "This is a response",
  },
};

describe("HttpClientChannel", () => {
  const port = 9999;
  let server: Server | undefined;
  let reqHeaders: Parameters<RequestHandler>["0"]["headers"] | undefined;
  let reqBody: Parameters<RequestHandler>["0"]["body"] | undefined;

  beforeEach(() => {
    server = express()
      .post("/", express.text({ type: "*/*" }), (req, res) => {
        reqHeaders = req.headers;
        reqBody = req.body;
        return res
          .status(200)
          .type("application/cloudevents+json")
          .send(JSON.stringify(resEvent));
      })
      .listen(port);
  });

  afterEach(() => {
    server?.close();
    server = undefined;
    reqHeaders = undefined;
    reqBody = undefined;
  });

  describe("send", () => {
    it("sends an event as HTTP request", async () => {
      const channel = new HttpClientChannel<CloudEvent>(
        `http://localhost:${port}`,
      );

      await channel.send(reqEvent);

      assert(reqHeaders);
      expect(
        Object.fromEntries(
          Object.entries(reqHeaders).filter(
            ([k, _v]) => k.startsWith("ce-") || k === "content-type",
          ),
        ),
      ).toStrictEqual({
        "ce-id": "123",
        "ce-source": "request.example.com",
        "ce-specversion": "1.0",
        "ce-time": "2006-01-02T15:04:05.000Z",
        "ce-type": "com.example.v1.Greeting",
        "content-type": "application/json",
      });

      assert(reqBody);
      expect(reqBody).toBe('{"message":"This is a request"}');
    });
  });

  describe("receive", () => {
    it("receives an event as HTTP response", async () => {
      const result: CloudEvent[] = [];
      const channel = new HttpClientChannel<CloudEvent>(
        `http://localhost:${port}`,
        {
          receive: true,
          schema: CloudEventSchema,
        },
      );
      channel.receive((e) => result.push(e));

      await channel.send(reqEvent);

      assert(reqHeaders);
      expect(
        Object.fromEntries(
          Object.entries(reqHeaders).filter(
            ([k, _v]) => k.startsWith("ce-") || k === "content-type",
          ),
        ),
      ).toStrictEqual({
        "ce-id": "123",
        "ce-source": "request.example.com",
        "ce-specversion": "1.0",
        "ce-time": "2006-01-02T15:04:05.000Z",
        "ce-type": "com.example.v1.Greeting",
        "content-type": "application/json",
      });

      assert(reqBody);
      expect(reqBody).toBe('{"message":"This is a request"}');

      expect(result.length).toBe(1);
      expect(result[0]).toStrictEqual(resEvent);
    });
  });
});
