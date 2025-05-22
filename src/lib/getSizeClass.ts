export function getSizeClass(screenSize: string, size: string) {
  if (screenSize === "xs") {
    return "w-[calc(100%-2rem)] sm:max-w-full";
  }

  if (screenSize === "sm") {
    switch (size) {
      case "sm":
        return "w-[calc(100%-2rem)] sm:max-w-sm";
      default:
        return "w-[calc(100%-2rem)] sm:max-w-full";
    }
  }

  if (screenSize === "md") {
    switch (size) {
      case "sm":
        return "sm:max-w-sm";
      case "md":
        return "sm:max-w-md";
      case "lg":
        return "sm:max-w-lg";
      case "xl":
        return "sm:max-w-xl";
      case "full":
        return "sm:max-w-lg";
      default:
        return "sm:max-w-md";
    }
  }

  if (screenSize === "lg") {
    switch (size) {
      case "sm":
        return "sm:max-w-sm";
      case "md":
        return "sm:max-w-md";
      case "lg":
        return "sm:max-w-3xl";
      case "xl":
        return "sm:max-w-xl";
      case "full":
        return "sm:max-w-2xl";
      default:
        return "sm:max-w-md";
    }
  }

  // xl, 2xl, etc.
  switch (size) {
    case "sm":
      return "sm:max-w-sm";
    case "md":
      return "sm:max-w-md";
    case "lg":
      return "sm:max-w-3xl";
    case "xl":
      return "sm:max-w-xl";
    case "full":
      return "sm:max-w-3xl";
    default:
      return "sm:max-w-md";
  }
}
