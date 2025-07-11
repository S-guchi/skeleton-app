import type { TranslationKeys } from './i18n';

// ネストされたオブジェクトのキーをドット記法で結合する型
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

// 翻訳キーの型
export type TranslationKey = NestedKeyOf<TranslationKeys>;

// 補間パラメータの型
export interface InterpolationParams {
  [key: string]: string | number;
}

// 型安全なt関数の型定義
export interface TypeSafeTranslation {
  (key: TranslationKey, params?: InterpolationParams): string;
}

// useLocalizationの戻り値型
export interface LocalizationHook {
  currentLocale: string;
  setLocale: (locale: string) => Promise<void>;
  availableLocales: Array<{ code: string; name: string }>;
  t: TypeSafeTranslation;
  isRTL: boolean;
  isLoading: boolean;
  getCurrencySymbol: () => string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date) => string;
  formatTime: (date: Date) => string;
  deviceLocales: any[];
}

// 言語設定の型
export interface LocaleConfig {
  code: string;
  name: string;
  direction: 'ltr' | 'rtl';
  currencySymbol?: string;
  dateFormat?: string;
  timeFormat?: string;
}

// 複数形規則の型
export interface PluralRules {
  zero?: string;
  one: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

// 日付フォーマット設定の型
export interface DateFormatConfig {
  short: string;
  medium: string;
  long: string;
  full: string;
}

// 時刻フォーマット設定の型
export interface TimeFormatConfig {
  short: string;
  medium: string;
  long: string;
}

// 通貨フォーマット設定の型
export interface CurrencyFormatConfig {
  symbol: string;
  position: 'before' | 'after';
  space: boolean;
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
}

// 完全なロケール設定の型
export interface FullLocaleConfig extends LocaleConfig {
  pluralRules?: PluralRules;
  dateFormats?: DateFormatConfig;
  timeFormats?: TimeFormatConfig;
  currencyFormat?: CurrencyFormatConfig;
}