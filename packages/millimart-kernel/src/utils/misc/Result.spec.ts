import { describe, expect, it } from "vitest";
import { Result } from "./Result";

describe("Result", () => {
  describe("success", () => {
    it("returns a success result", () => {
      const result = Result.success("Succeeded");
      expect(result.success).toBe(true);
      expect(result.value).toBe("Succeeded");
      expect(result.error).toBe(undefined);
    });
  });

  describe("failure", () => {
    it("returns a failure result", () => {
      const result = Result.failure(new Error("Failed"));
      expect(result.success).toBe(false);
      expect(result.value).toBe(undefined);
      expect(result.error).instanceOf(Error);
    });
  });
});
