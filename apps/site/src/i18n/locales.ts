export const supportedLocales = ["zh-CN", "en"] as const;
export type Locale = (typeof supportedLocales)[number];
export const defaultLocale: Locale = "zh-CN";

export function normalizeLocale(
  value: string | null | undefined,
): Locale | undefined {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) {
    return undefined;
  }

  if (normalized === "en" || normalized.startsWith("en-")) {
    return "en";
  }

  if (normalized === "zh" || normalized.startsWith("zh-")) {
    return "zh-CN";
  }

  return undefined;
}

export function withTrailingSlash(pathname: string): string {
  if (pathname === "" || pathname === "/") {
    return "/";
  }

  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export function stripLocalePrefix(pathname: string): string {
  const normalizedPath = withTrailingSlash(pathname);

  if (normalizedPath === "/en/") {
    return "/";
  }

  if (normalizedPath.startsWith("/en/")) {
    return normalizedPath.replace(/^\/en/, "");
  }

  return normalizedPath;
}

export function getPathLocale(pathname: string): Locale {
  return withTrailingSlash(pathname).startsWith("/en/") ? "en" : defaultLocale;
}

export function toLocalizedPath(pathname: string, locale: Locale): string {
  const basePath = stripLocalePrefix(pathname);

  if (locale === defaultLocale) {
    return basePath;
  }

  return basePath === "/" ? "/en/" : `/en${basePath}`;
}
