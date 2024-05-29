import { Request, Response } from "express";
import { CloudEvent, CloudEventEncoder, CloudEventEncoderMode } from "millimart-kernel";

export const responseCloudEvent = <CE extends CloudEvent>(event: CE, req: Request, res: Response) => {
  if (event === undefined) {
    return res.status(404).send(event);
  }
  const mode: CloudEventEncoderMode =
    req.accepts(["application/cloudevents+json", "*/*"]) ===
    "application/cloudevents+json"
      ? "structured"
      : "binary";
  const encoder = new CloudEventEncoder(event, { mode });
  const message = encoder.toMessage();
  return res.status(200).set(message.headers).send(message.body);

}