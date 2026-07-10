import { describe, expect, it } from "vitest";
import { detectBrowserLocale, parseStoredLocale } from "./languagePreference";

describe("language preference helpers", () => {
  it("accepts only exact supported values from persistent storage", () => {
    expect(parseStoredLocale("en")).toBe("en");
    expect(parseStoredLocale("zh-CN")).toBe("zh-CN");
    expect(parseStoredLocale("en-US")).toBeUndefined();
    expect(parseStoredLocale("zh-cn")).toBeUndefined();
    expect(parseStoredLocale("not-a-locale")).toBeUndefined();
    expect(parseStoredLocale(null)).toBeUndefined();
  });

  it("normalizes browser languages in preference order", () => {
    expect(detectBrowserLocale(["zhongwen", "en-US"])).toBe("en");
    expect(detectBrowserLocale(["zh-Hans", "en-US"])).toBe("zh-CN");
    expect(detectBrowserLocale(["enochian", "zhongwen"])).toBeUndefined();
    expect(detectBrowserLocale([])).toBeUndefined();
  });
});
