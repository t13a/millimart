import { describe, expect, it } from "vitest";
import { CallbackChannel } from "./CallbackChannel";

type TestEvent = {
  type: string;
  data: unknown;
};

describe("CallbackChannel", () => {
  describe("receive", () => {
    it("handles an events", async () => {
      const events: TestEvent[] = [
        { type: "foo", data: {} },
        { type: "bar", data: {} },
      ];
      const channel = new CallbackChannel({
        receiveCallback: () => events.shift(),
        sink: "/",
      });

      const result: TestEvent[] = [];
      const received = await channel.receive((e) => result.push(e));

      expect(result).toStrictEqual([{ type: "foo", data: {} }]);
      expect(received).toBe(true);
    });

    it("does nothing if there is no event", async () => {
      const events: TestEvent[] = [];
      const channel = new CallbackChannel({
        receiveCallback: () => events.shift(),
        sink: "/",
      });

      const result: TestEvent[] = [];
      const received = await channel.receive((e) => result.push(e));

      expect(result).toStrictEqual([]);
      expect(received).toBe(false);
    });
  });
});
