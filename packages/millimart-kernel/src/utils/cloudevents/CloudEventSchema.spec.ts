import * as SDK from "cloudevents";
import { uuidv7 } from "uuidv7";
import { describe, expect, it } from "vitest";
import { ZodError, z } from "zod";
import { CloudEvent, CloudEventSchema } from "./CloudEventSchema";

describe("CloudEventSchema", () => {
  describe("parse", () => {
    it("returns an event with the type if valid", () => {
      const event: CloudEvent = {
        id: "123",
        source: "example.com",
        specversion: "1.0",
        type: "Foo",
      };
      expect(CloudEventSchema.parse(event)).toStrictEqual(event);
    });

    it("throws an error if not valid", () => {
      const event = {
        id: "123",
        // source: "example.com",
        specversion: "1.0",
        type: "Foo",
      };
      expect(() => CloudEventSchema.parse(event)).toThrowError(ZodError);
    });

    it("strips extension attributes", () => {
      const event: CloudEvent & Record<string, unknown> = {
        id: "123",
        source: "example.com",
        specversion: "1.0",
        type: "Foo",
        extension1: "1",
        extension2: "2",
      };
      const { extension1, extension2, ...rest } = event;
      expect(CloudEventSchema.parse(event)).toStrictEqual(rest);
    });

    // TODO
    it.fails("treats null as undefined", () => {
      const event = CloudEventSchema.parse({
        id: "123",
        source: "localhost",
        specversion: "1.0",
        type: "localhost.test",
        datacontenttype: null,
        dataschema: null,
        subject: null,
        time: null,
        data: null,
        data_base64: null,
      });
      expect(event).toStrictEqual({
        id: "123",
        source: "localhost",
        specversion: "1.0",
        type: "localhost.test",
        datacontenttype: undefined,
        dataschema: undefined,
        subject: undefined,
        time: undefined,
        data: undefined,
        data_base64: undefined,
      });
    });
  });

  describe("extend", () => {
    it("returns a custom schema", () => {
      type Foo = z.infer<typeof FooSchema>;
      const FooSchema = CloudEventSchema.extend({
        specversion: z.literal("1.0"),
        type: z.literal("Foo"),
        data: z.string().min(1),
      });
      const event: Foo = {
        id: uuidv7(),
        source: "example.com",
        specversion: "1.0",
        type: "Foo",
        data: "This is a test.",
      };
      expect(FooSchema.parse(event)).toStrictEqual(event);
    });
  });
});

describe("CloudEvent", () => {
  it("is assignable to CloudEvents of JavaScript SDK", () => {
    const event: CloudEvent = {
      id: "123",
      source: "localhost",
      specversion: "1.0",
      type: "localhost.test",
      datacontenttype: undefined,
      dataschema: undefined,
      subject: undefined,
      time: "2024-05-03T00:00:00.000Z",
      data: undefined,
      data_base64: undefined,
    };
    const ce = new SDK.CloudEvent(event);
    expect(ce.toJSON()).toStrictEqual({
      ...event,
      datacontentencoding: undefined,
      schemaurl: undefined,
    });
  });

  it("is assignable from HTTP of JavaScript SDK", () => {
    const ce = SDK.HTTP.toEvent({
      headers: {
        "ce-id": "123",
        "ce-source": "localhost",
        "ce-specversion": "1.0",
        "ce-type": "localhost.test",
        "ce-time": "2024-05-03T00:00:00.000Z",
        "content-type": "text/plain",
      },
      body: "Test",
    });
    expect(CloudEventSchema.parse(ce)).toStrictEqual({
      id: "123",
      source: "localhost",
      specversion: "1.0",
      type: "localhost.test",
      datacontenttype: "text/plain",
      dataschema: undefined,
      subject: undefined,
      time: "2024-05-03T00:00:00.000Z",
      data: "Test",
      data_base64: undefined,
    });
  });
});
