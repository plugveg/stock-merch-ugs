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
    const rootDiv = document.createElement("div");
    rootDiv.id = "root";
    document.body.appendChild(rootDiv);

    expect(ReactDOM.createRoot).toHaveBeenCalled();

    const rootElement = document.getElementById("root");
    expect(rootElement).not.toBeNull();
  });
});
