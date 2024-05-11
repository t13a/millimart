import { describe, expect, it } from "vitest";
import { z } from "zod";
import { CloudEventSchema } from "./CloudEventSchema";
import { createCloudEventFactory } from "./createCloudEventFactory";

const ExampleEventTypePrefix = "com.example.v1.";

const createTestEventSchema = <
  TypeName extends string,
  DataSchema extends z.ZodType,
>(
  typeName: TypeName,
  dataSchema: DataSchema,
) =>
  CloudEventSchema.extend({
    specversion: z.literal("1.0"),
    type: z.literal(`${ExampleEventTypePrefix}${typeName}`),
    data: dataSchema,
  });

const FooEventSchema = createTestEventSchema(
  "Foo",
  z.object({
    foo: z.string().min(1),
  }),
);

const BarEventSchema = createTestEventSchema(
  "Bar",
  z.object({
    bar: z.string().min(1),
  }),
);

type ExampleEvent = z.infer<typeof ExampleEventSchema>;
const ExampleEventSchema = z.union([FooEventSchema, BarEventSchema]);

describe("createCloudEventFactory", () => {
  it("retuans a function that creates an event by type without prefix", () => {
    const createExampleEvent = createCloudEventFactory<
      ExampleEvent,
      typeof ExampleEventTypePrefix
    >(ExampleEventTypePrefix);

    const foo = createExampleEvent("Foo", {
      id: "123",
      source: "example.com",
      time: "2024-05-03T00:00:00.000Z",
      data: {
        foo: "foo",
      },
    });

    expect(foo).toStrictEqual({
      id: "123",
      source: "example.com",
      specversion: "1.0",
      type: "com.example.v1.Foo",
      time: "2024-05-03T00:00:00.000Z",
      data: {
        foo: "foo",
      },
    });
  });
});
