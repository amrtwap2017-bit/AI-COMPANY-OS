// @ts-nocheck
import { render, screen } from "@testing-library/react";
import { StatusPill } from "@/components/ui/StatusPill";

describe("StatusPill", () => {
  it("renders active status", () => {
    render(<StatusPill status="active" />);
    expect(screen.getByText("active")).toBeInTheDocument();
  });
  it("renders pending status", () => {
    render(<StatusPill status="pending" />);
    expect(screen.getByText("pending")).toBeInTheDocument();
  });
  it("renders without crashing for unknown status", () => {
    render(<StatusPill status="unknown" />);
    expect(screen.getByText("unknown")).toBeInTheDocument();
  });
});
