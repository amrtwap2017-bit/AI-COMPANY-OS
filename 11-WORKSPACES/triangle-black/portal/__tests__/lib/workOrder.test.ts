// @ts-nocheck
import { WorkOrderSchema, WO_PRIORITIES, WO_CATEGORIES } from "@/lib/schemas/workOrder";

describe("WorkOrderSchema", () => {
  it("validates a valid work order", () => {
    const result = WorkOrderSchema.safeParse({
      title: "HVAC Repair", priority: "high", category: "hvac"
    });
    expect(result.success).toBe(true);
  });
  it("rejects title too short", () => {
    const result = WorkOrderSchema.safeParse({ title: "AB" });
    expect(result.success).toBe(false);
  });
  it("has 5 priority levels", () => {
    expect(WO_PRIORITIES).toHaveLength(5);
  });
  it("has priority objects with value/color/label", () => {
    WO_PRIORITIES.forEach(p => {
      expect(p).toHaveProperty("value");
      expect(p).toHaveProperty("color");
      expect(p).toHaveProperty("label");
    });
  });
  it("sets priority default to medium", () => {
    const result = WorkOrderSchema.parse({ title: "Test Work" });
    expect(result.priority).toBe("medium");
  });
});
