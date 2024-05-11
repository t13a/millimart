import { uuidv7 } from "uuidv7";
import { describe, expect, it } from "vitest";
import z from "zod";
import { CloudEventSchema } from "./CloudEventSchema";
import { CloudEventHandlerMap, handleCloudEvent } from "./handleCloudEvent";

type Foo = z.infer<typeof FooSchema>;
const FooSchema = CloudEventSchema.extend({
  specversion: z.literal("1.0"),
  type: z.literal("Foo"),
  data: z.string().min(1),
});

type Bar = z.infer<typeof BarSchema>;
const BarSchema = CloudEventSchema.extend({
  specversion: z.literal("1.0"),
  type: z.literal("Bar"),
  data: z.number().min(1),
});

type FooBar = z.infer<typeof FooBarSchema>;
const FooBarSchema = z.union([FooSchema, BarSchema]);

describe("handleCloudEvent", () => {
  it("handles CloudEvent based event", async () => {
    const result1: string[] = [];
    const result2: number[] = [];

    const handlers: CloudEventHandlerMap<FooBar> = {
      Foo: (e) => result1.push(e.data),
      Bar: async (e) => result2.push(e.data),
    };

    const event1: Foo = {
      id: uuidv7(),
      source: "example.com",
      specversion: "1.0",
      type: "Foo",
      data: "ABC",
    };
    await handleCloudEvent(event1, handlers);

    const event2: Bar = {
      id: uuidv7(),
      source: "example.com",
      specversion: "1.0",
      type: "Bar",
      data: 123,
    };
    await handleCloudEvent(event2, handlers);

    expect(result1).toStrictEqual(["ABC"]);
    expect(result2).toStrictEqual([123]);
  });
});
