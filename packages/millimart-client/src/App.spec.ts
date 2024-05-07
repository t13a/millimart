import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("does nothing", () => {
    expect(App()).toBeTruthy();
  });
});
