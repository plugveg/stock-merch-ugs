import { describe, it, expect } from "vitest";
import { getSizeClass } from "../getSizeClass";

const screenSizes = ["xs", "sm", "md", "lg", "xl"] as const;
const sizes = ["sm", "md", "lg", "xl", "full"] as const;

const expectedClasses: Record<string, Record<string, string>> = {
  xs: {
    sm: "w-[calc(100%-2rem)] sm:max-w-full",
    md: "w-[calc(100%-2rem)] sm:max-w-full",
    lg: "w-[calc(100%-2rem)] sm:max-w-full",
    xl: "w-[calc(100%-2rem)] sm:max-w-full",
    full: "w-[calc(100%-2rem)] sm:max-w-full",
  },
  sm: {
    sm: "w-[calc(100%-2rem)] sm:max-w-sm",
    md: "w-[calc(100%-2rem)] sm:max-w-full",
    lg: "w-[calc(100%-2rem)] sm:max-w-full",
    xl: "w-[calc(100%-2rem)] sm:max-w-full",
    full: "w-[calc(100%-2rem)] sm:max-w-full",
  },
  md: {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    full: "sm:max-w-lg",
  },
  lg: {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-3xl",
    xl: "sm:max-w-xl",
    full: "sm:max-w-2xl",
  },
  xl: {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-3xl",
    xl: "sm:max-w-xl",
    full: "sm:max-w-3xl",
  },
};

describe("getSizeClass", () => {
  screenSizes.forEach((screenSize) => {
    sizes.forEach((size) => {
      it(`returns correct class for screenSize="${screenSize}" and size="${size}"`, () => {
        expect(getSizeClass(screenSize, size)).toBe(
          expectedClasses[screenSize][size],
        );
      });
    });
  });

  it("returns default for unknown screenSize and known size", () => {
    expect(getSizeClass("unknown", "md")).toBe("sm:max-w-md");
  });

  it("returns default for known screenSize and unknown size", () => {
    expect(getSizeClass("md", "giant")).toBe("sm:max-w-md");
  });

  it("returns default for known screenSize and unknown size", () => {
    expect(getSizeClass("lg", "giant")).toBe("sm:max-w-md");
  });

  it("returns default for unknown screenSize and unknown size", () => {
    expect(getSizeClass("weird", "huge")).toBe("sm:max-w-md");
  });
});
