import { describe, expect, it } from "vitest";
import { ExampleRouter } from "./ExampleRouter";

describe("ExampleRouter", () => {
  it("does nothing", () => {
    expect(ExampleRouter()).toBeTruthy();
  });
});
