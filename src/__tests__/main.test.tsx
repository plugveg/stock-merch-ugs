import { describe, it, expect, vi } from "vitest";
import * as ReactDOM from "react-dom/client";

vi.mock("react-dom/client", async () => {
  const actual = await vi.importActual("react-dom/client");
  return {
    ...actual,
    createRoot: vi.fn(() => ({
      render: vi.fn(),
    })),
  };
});

import "../main";

describe("main.tsx", () => {
  it("should render App using ReactDOM.createRoot", () => {
    expect(ReactDOM.createRoot).toHaveBeenCalled();
    const rootElement = document.getElementById("root");
    expect(rootElement).toBeNull();
  });
});
