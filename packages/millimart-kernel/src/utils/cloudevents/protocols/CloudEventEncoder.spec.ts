import express, { RequestHandler } from "express";
import { Server } from "http";
import { afterEach, assert, beforeEach, describe, expect, it } from "vitest";
import { CloudEvent } from "../CloudEventSchema";
import { CloudEventEncoder } from "./CloudEventEncoder";

const jsonEvent: CloudEvent = {
  id: "123",
  source: "localhost",
  specversion: "1.0",
  type: "Test",
  time: "2006-01-02T15:04:05.000Z",
  datacontenttype: "application/json",
  data: {
    message: "Hello world!",
  },
};

const binaryEvent: CloudEvent = {
  id: "123",
  source: "localhost",
  specversion: "1.0",
  type: "Test",
  time: "2006-01-02T15:04:05.000Z",
  datacontenttype: "application/json",
  data_base64: "eyJtZXNzYWdlIjoiSGVsbG8gd29ybGQhIn0=",
};

describe("CloudEventEncoder", () => {
  describe("toMessage", () => {
    it("converts CloudEvent to Message (JSON valued data, binary content mode)", async () => {
      const message = new CloudEventEncoder(jsonEvent, {
        mode: "binary",
      }).toMessage();

      expect(message.headers).toStrictEqual({
        "ce-id": "123",
        "ce-source": "localhost",
        "ce-specversion": "1.0",
        "ce-type": "Test",
        "ce-time": "2006-01-02T15:04:05.000Z",
        "content-type": "application/json",
      });
      expect(message.body).toBe('{"message":"Hello world!"}');
    });

    it("converts CloudEvent to Message (JSON valued data, structured content mode)", async () => {
      const message = new CloudEventEncoder(jsonEvent, {
        mode: "structured",
      }).toMessage();

      expect(message.headers).toStrictEqual({
        "content-type": "application/cloudevents+json; charset=utf-8",
      });
      assert(typeof message.body === "string");
      expect(JSON.parse(message.body)).toStrictEqual(jsonEvent);
    });

    it("converts CloudEvent to Message (binary valued data, binary content mode)", async () => {
      const message = new CloudEventEncoder(binaryEvent, {
        mode: "binary",
      }).toMessage();

      expect(message.headers).toStrictEqual({
        "ce-id": "123",
        "ce-source": "localhost",
        "ce-specversion": "1.0",
        "ce-type": "Test",
        "ce-time": "2006-01-02T15:04:05.000Z",
        "content-type": "application/json",
      });
      assert(message.body instanceof Uint8Array);
      expect(new TextDecoder().decode(message.body.buffer)).toBe(
        '{"message":"Hello world!"}',
      );
    });

    it("converts CloudEvent to Message (binary valued data, structured content mode)", async () => {
      const message = new CloudEventEncoder(binaryEvent, {
        mode: "structured",
      }).toMessage();

      expect(message.headers).toStrictEqual({
        "content-type": "application/cloudevents+json; charset=utf-8",
      });
      assert(typeof message.body === "string");
      expect(JSON.parse(message.body)).toStrictEqual(binaryEvent);
    });
  });

  describe("toRequestInit", () => {
    const port = 9999;
    let server: Server | undefined;
    let reqHeaders: Parameters<RequestHandler>["0"]["headers"] | undefined;
    let reqBody: Parameters<RequestHandler>["0"]["body"] | undefined;

    beforeEach(() => {
      server = express()
        .post("/", express.text({ type: "*/*" }), (req, res) => {
          reqHeaders = req.headers;
          reqBody = req.body;
          res.send(200);
        })
        .listen(port);
    });

    afterEach(() => {
      server?.close();
      server = undefined;
      reqHeaders = undefined;
      reqBody = undefined;
    });

    it("is used as an argument to the fetch function", async () => {
      const requestInit = new CloudEventEncoder(jsonEvent).toRequestInit();
      await fetch(`http://localhost:${port}/`, requestInit);

      expect(reqHeaders).toStrictEqual({
        host: `localhost:${port}`,
        connection: "keep-alive",
        "ce-id": "123",
        "ce-source": "localhost",
        "ce-specversion": "1.0",
        "ce-time": "2006-01-02T15:04:05.000Z",
        "ce-type": "Test",
        "content-type": "application/json",
        accept: "*/*",
        "accept-language": "*",
        "sec-fetch-mode": "cors",
        "user-agent": "node",
        "accept-encoding": "gzip, deflate",
        "content-length": "26",
      });
      expect(reqBody).toBe('{"message":"Hello world!"}');
    });
  });
});
