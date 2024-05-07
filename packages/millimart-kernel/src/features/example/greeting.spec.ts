import { describe, expect, it } from "vitest";
import { greeting } from "./greeting";

describe("greeting", () => {
  it("prints a greeting message", () => {
    expect(greeting()).toBe("🍅 Welcome to MilliMart");
  });
});
