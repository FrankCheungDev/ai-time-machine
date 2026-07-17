import {
  defaultLocale as dataDefaultLocale,
  normalizeLocale as dataNormalizeLocale,
  supportedLocales as dataSupportedLocales,
} from "@ai-history/data/locales";
import { describe, expect, it } from "vitest";
import {
  defaultLocale,
  getPathLocale,
  normalizeLocale,
  stripLocalePrefix,
  supportedLocales,
  toLocalizedPath,
  withTrailingSlash,
} from "./locales";

describe("locale helpers", () => {
  it("re-exports the canonical data-package locale contract", () => {
    expect(defaultLocale).toBe(dataDefaultLocale);
    expect(supportedLocales).toBe(dataSupportedLocales);
    expect(normalizeLocale).toBe(dataNormalizeLocale);
  });

  it("keeps Simplified Chinese as the default locale", () => {
    expect(defaultLocale).toBe("zh-CN");
  });

  it("normalizes browser language values into supported locales", () => {
    expect(normalizeLocale("en-US")).toBe("en");
    expect(normalizeLocale("en")).toBe("en");
    expect(normalizeLocale("zh-CN")).toBe("zh-CN");
    expect(normalizeLocale("zh-Hans")).toBe("zh-CN");
    expect(normalizeLocale("fr-FR")).toBeUndefined();
    expect(normalizeLocale(undefined)).toBeUndefined();
  });

  it("detects the locale from route prefixes", () => {
    expect(getPathLocale("/")).toBe("zh-CN");
    expect(getPathLocale("/chapters/rag/")).toBe("zh-CN");
    expect(getPathLocale("/en/")).toBe("en");
    expect(getPathLocale("/en/chapters/rag/")).toBe("en");
  });

  it("strips only the English route prefix", () => {
    expect(stripLocalePrefix("/en/chapters/rag/")).toBe("/chapters/rag/");
    expect(stripLocalePrefix("/en")).toBe("/");
    expect(stripLocalePrefix("/chapters/rag/")).toBe("/chapters/rag/");
  });

  it("maps routes between Chinese and English", () => {
    expect(toLocalizedPath("/", "en")).toBe("/en/");
    expect(toLocalizedPath("/chapters/rag/", "en")).toBe("/en/chapters/rag/");
    expect(toLocalizedPath("/en/chapters/rag/", "zh-CN")).toBe(
      "/chapters/rag/",
    );
    expect(toLocalizedPath("/en/", "zh-CN")).toBe("/");
  });

  it("normalizes paths to trailing slashes", () => {
    expect(withTrailingSlash("/timeline")).toBe("/timeline/");
    expect(withTrailingSlash("/timeline/")).toBe("/timeline/");
    expect(withTrailingSlash("/")).toBe("/");
  });
});
