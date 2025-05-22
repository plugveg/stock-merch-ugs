import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { useScreenSize, useMobile } from "../useMobile";

describe("useScreenSize", () => {
  const resizeWindow = (width: number) => {
    (window.innerWidth as number) = width;
    window.dispatchEvent(new Event("resize"));
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const scenarios = [
    {
      width: 320,
      expected: "xs",
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    },
    {
      width: 500,
      expected: "sm",
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    },
    {
      width: 700,
      expected: "md",
      isMobile: false,
      isTablet: true,
      isDesktop: false,
    },
    {
      width: 900,
      expected: "lg",
      isMobile: false,
      isTablet: true,
      isDesktop: false,
    },
    {
      width: 1100,
      expected: "xl",
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    },
    {
      width: 1400,
      expected: "2xl",
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    },
  ];

  scenarios.forEach(({ width, expected, isMobile, isTablet, isDesktop }) => {
    it(`returns correct screen size '${expected}' for width ${width}`, () => {
      const { result } = renderHook(() => useScreenSize());

      act(() => {
        resizeWindow(width);
      });

      expect(result.current.screenSize).toBe(expected);
      expect(result.current.windowWidth).toBe(width);
      expect(result.current.isMobile).toBe(isMobile);
      expect(result.current.isTablet).toBe(isTablet);
      expect(result.current.isDesktop).toBe(isDesktop);
    });
  });
});

describe("useMobile", () => {
  const resizeWindow = (width: number) => {
    (window.innerWidth as number) = width;
    window.dispatchEvent(new Event("resize"));
  };

  beforeEach(() => {
    vi.stubGlobal("innerWidth", 1024);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns true when screen is mobile (xs)", () => {
    const { result } = renderHook(() => useMobile());
    act(() => {
      resizeWindow(300);
    });
    expect(result.current).toBe(true);
  });

  it("returns true when screen is mobile (sm)", () => {
    const { result } = renderHook(() => useMobile());
    act(() => {
      resizeWindow(500);
    });
    expect(result.current).toBe(true);
  });

  it("returns false when screen is tablet or desktop", () => {
    const { result } = renderHook(() => useMobile());
    act(() => {
      resizeWindow(900);
    });
    expect(result.current).toBe(false);
  });
});
