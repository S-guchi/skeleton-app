import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';

// Import translations
import ja from './locales/ja.json';
import en from './locales/en.json';

// Create i18n instance
const i18n = new I18n({
  ja,
  en,
});

// Set fallback locale
i18n.defaultLocale = 'ja';
// Don't auto-set locale here, let useLocalization handle it
i18n.locale = 'ja';

// Enable fallbacks for missing translations
i18n.enableFallback = true;

export default i18n;

// Type-safe translation helper
export const t = (key: string, options?: any): string => {
  return i18n.t(key, options);
};

// Get current locale
export const getCurrentLocale = (): string => {
  return i18n.locale;
};

// Change locale
export const changeLocale = (locale: string): void => {
  i18n.locale = locale;
};

// Available locales
export const availableLocales = [
  { code: 'ja', name: '日本語' },
  { code: 'en', name: 'English' },
];