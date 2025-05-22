import { describe, it, expect, vi, beforeAll } from "vitest";
import * as ReactDOM from "react-dom/client";

const mockRender = vi.fn();

vi.mock("react-dom/client", async () => {
  const actual = await vi.importActual("react-dom/client");
  return {
    ...actual,
    createRoot: vi.fn(() => ({
      render: mockRender,
    })),
  };
});

describe("main.tsx", () => {
  beforeAll(() => {
    const rootDiv = document.createElement("div");
    rootDiv.id = "root";
    document.body.appendChild(rootDiv);
  });

  it("should call ReactDOM.createRoot with #root", async () => {
    await import("../main");
    expect(ReactDOM.createRoot).toHaveBeenCalledWith(
      document.getElementById("root"),
    );
    expect(mockRender).toHaveBeenCalled();
  });
});
