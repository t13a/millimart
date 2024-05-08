import { describe, expect, it } from "vitest";
import { CloudEvent } from "./CloudEventSchema";
import { toEventId } from "./toEventId";

describe("toEventId", () => {
  it("returns the unique identifier of CloudEvent", () => {
    const event: CloudEvent = {
      specversion: "1.0",
      type: "Test",
      id: "1234",
      source: "example.com",
    };
    expect(toEventId(event)).toBe("example.com-1234");
  });
});
