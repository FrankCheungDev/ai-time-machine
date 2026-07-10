import {
  normalizeLocale,
  supportedLocales,
  type Locale,
} from "./locales";
import { languageStorageKey } from "./siteCopy";

export function parseStoredLocale(
  value: string | null | undefined,
): Locale | undefined {
  return supportedLocales.find((locale) => locale === value);
}

export function detectBrowserLocale(
  languages: readonly string[],
): Locale | undefined {
  for (const language of languages) {
    const locale = normalizeLocale(language);
    if (locale) {
      return locale;
    }
  }

  return undefined;
}

function getCookieLocale(): Locale | undefined {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${languageStorageKey}=([^;]+)`),
  );

  if (!match) {
    return undefined;
  }

  try {
    return parseStoredLocale(decodeURIComponent(match[1]));
  } catch {
    return undefined;
  }
}

function getPreferredLocale(): Locale | undefined {
  try {
    const storedLocale = parseStoredLocale(
      localStorage.getItem(languageStorageKey),
    );
    if (storedLocale) {
      return storedLocale;
    }
  } catch {
    // Fall back to the cookie when local storage is restricted.
  }

  return getCookieLocale();
}

function persistLocale(locale: Locale): void {
  try {
    localStorage.setItem(languageStorageKey, locale);
  } catch {
    // Cookie persistence below still covers storage-restricted browsers.
  }

  document.cookie = `${languageStorageKey}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

export function initializeLanguagePreference(): void {
  if (location.pathname === "/") {
    const locale =
      getPreferredLocale() ?? detectBrowserLocale(navigator.languages ?? []);

    if (locale === "en") {
      location.replace("/en/");
    }
  }

  document
    .querySelector("[data-language-switch]")
    ?.addEventListener("click", (event) => {
      const target = event.currentTarget;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const locale = parseStoredLocale(target.dataset.languageTarget);
      if (locale) {
        persistLocale(locale);
      }
    });
}
