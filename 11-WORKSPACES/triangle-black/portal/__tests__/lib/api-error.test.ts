// @ts-nocheck
import { ApiError, getErrorMessage, isNotFound, isUnauthorized } from "@/lib/api-error";

describe("ApiError", () => {
  it("creates error with status", () => {
    const err = new ApiError("Not found", 404);
    expect(err.status).toBe(404);
    expect(err.message).toBe("Not found");
  });
  it("isNotFound returns true for 404", () => {
    expect(isNotFound(new ApiError("x",404))).toBe(true);
  });
  it("isUnauthorized returns true for 401", () => {
    expect(isUnauthorized(new ApiError("x",401))).toBe(true);
  });
  it("getErrorMessage handles unknown error", () => {
    expect(getErrorMessage(null)).toBe("An unexpected error occurred");
  });
});
