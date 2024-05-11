import assert from "assert";
import express, { RequestHandler } from "express";
import { Server } from "http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CloudEvent } from "../CloudEventSchema";
import { UglyHttpClientChannel } from "./UglyHttpClientChannel";

const event1: CloudEvent = {
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

describe("UglyHttpClientChannel", () => {
  const port = 9999;
  let server: Server | undefined;
  let reqHeaders: Parameters<RequestHandler>["0"]["headers"] | undefined;
  let reqBody: Parameters<RequestHandler>["0"]["body"] | undefined;

  beforeEach(() => {
    server = express()
      .post("/", express.text({ type: "*/*" }), (req, res) => {
        reqHeaders = req.headers;
        reqBody = req.body;
        return res.status(200);
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
    it.skip("sends an event as HTTP request", async () => {
      const channel = new UglyHttpClientChannel<CloudEvent>(
        `http://localhost:${port}`,
      );

      await channel.send(event1);

      assert(reqHeaders);
      expect(
        Object.fromEntries(
          Object.entries(reqHeaders).filter(
            ([k, _v]) => k.startsWith("ce-") || k === "content-type",
          ),
        ),
      ).toStrictEqual({
        "ce-id": "123",
        "ce-source": "example.com",
        "ce-specversion": "1.0",
        "ce-time": "2006-01-02T15:04:05.000Z",
        "ce-type": "com.example.v1.Greeting",
        "content-type": "application/json",
      });

      assert(reqBody);
      expect(reqBody).toBe('{"message":"Hello world!"}');
    });
  });
});
