export const supportedLocales = ["zh-CN", "en"] as const;
export type Locale = (typeof supportedLocales)[number];
export const defaultLocale: Locale = "zh-CN";

export function cloneData<T>(value: T): T {
  return structuredClone(value);
}

export function getLocalizedValue<T>(
  values: Record<Locale, T>,
  locale: Locale = defaultLocale,
): T {
  return cloneData(values[locale] ?? values[defaultLocale]);
}
