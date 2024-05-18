import { z } from "zod";

export const coalesce = <Output>(attribute: z.ZodType<Output>) =>
  attribute.optional();
//attribute.nullish().transform((x) => x ?? undefined);

export type CloudEvent = z.infer<typeof CloudEventSchema>;
export const CloudEventSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  //specversion: z.string().min(1),
  specversion: z.literal("1.0"),
  type: z.string().min(1),
  datacontenttype: coalesce(z.string().min(1)),
  dataschema: coalesce(z.string().url().min(1)),
  subject: coalesce(z.string().min(1)),
  time: coalesce(z.string().datetime({ offset: true }).min(1)),
  data: coalesce(z.any()),
  data_base64: coalesce(z.string().base64()),
});

export type CloudEventType<
  CE extends CloudEvent,
  TypePrefix extends string = "",
> = CE["type"] extends `${TypePrefix}${infer U}` ? U : never;

export type CloudEventMap<
  CE extends CloudEvent,
  TypePrefix extends string = "",
> = {
  [Type in CloudEventType<CE, TypePrefix>]: Extract<
    CE,
    {
      type: `${TypePrefix}${Type}`;
    }
  >;
};
