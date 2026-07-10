import { defaultLocale, type Locale } from "@ai-history/data";

export {
  defaultLocale,
  normalizeLocale,
  supportedLocales,
  type Locale,
} from "@ai-history/data";

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
