import { useState, useEffect } from 'react';
import { useLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n, { changeLocale, getCurrentLocale, availableLocales } from '../i18n';
import { getDeviceTimeZone, getDeviceRegion, getCurrentTimeInTimeZone } from '../utils/dateUtils';
import { formatAmount } from '../utils/pure-functions';

const LOCALE_STORAGE_KEY = 'user_locale';

export const useLocalization = () => {
  const [currentLocale, setCurrentLocale] = useState('ja'); // Start with Japanese default
  const [isLoading, setIsLoading] = useState(true);
  const deviceLocales = useLocales();
  
  // デバイス情報を取得
  const deviceTimeZone = getDeviceTimeZone();
  const deviceRegion = getDeviceRegion();

  // Initialize locale and display mode on app start
  useEffect(() => {
    const initializeSettings = async () => {
      try {
        if (__DEV__) console.log('🌐 Initializing locale and display mode...');
        if (__DEV__) console.log('🌐 Device locales:', deviceLocales);
        
        // Check if user has saved a preferred locale
        const savedLocale = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
        if (__DEV__) console.log('🌐 Saved locale:', savedLocale);
        
        
        if (savedLocale && availableLocales.some(locale => locale.code === savedLocale)) {
          // Use saved locale
          if (__DEV__) console.log('🌐 Using saved locale:', savedLocale);
          changeLocale(savedLocale);
          setCurrentLocale(savedLocale);
        } else {
          // Use device locale if available, otherwise fallback to Japanese
          const deviceLocale = deviceLocales[0]?.languageCode;
          if (__DEV__) console.log('🌐 Device locale:', deviceLocale);
          const supportedLocale = availableLocales.find(locale => locale.code === deviceLocale);
          if (__DEV__) console.log('🌐 Supported locale:', supportedLocale);
          
          if (supportedLocale) {
            if (__DEV__) console.log('🌐 Using device locale:', supportedLocale.code);
            changeLocale(supportedLocale.code);
            setCurrentLocale(supportedLocale.code);
            // Save device locale as preference
            await AsyncStorage.setItem(LOCALE_STORAGE_KEY, supportedLocale.code);
          } else {
            // Fallback to Japanese
            if (__DEV__) console.log('🌐 Fallback to Japanese');
            changeLocale('ja');
            setCurrentLocale('ja');
            await AsyncStorage.setItem(LOCALE_STORAGE_KEY, 'ja');
          }
        }

        
      } catch (error) {
        console.error('❌ Error initializing settings:', error);
        // Fallback to defaults on error
        changeLocale('ja');
        setCurrentLocale('ja');
      } finally {
        setIsLoading(false);
      }
    };

    // Only initialize when device locales are available
    if (deviceLocales.length > 0) {
      initializeSettings();
    }
  }, [deviceLocales]);

  // Change locale and save preference
  const setLocale = async (locale: string) => {
    try {
      if (availableLocales.some(availableLocale => availableLocale.code === locale)) {
        changeLocale(locale);
        setCurrentLocale(locale);
        await AsyncStorage.setItem(LOCALE_STORAGE_KEY, locale);
      }
    } catch (error) {
      console.error('Error saving locale preference:', error);
    }
  };


  // Get translation with current locale
  const t = (key: string, options?: any): string => {
    try {
      const result = i18n.t(key, options);
      // If translation is missing and we get back the key, return fallback
      if (result === key && i18n.locale !== 'ja') {
        // Try with Japanese fallback
        const oldLocale = i18n.locale;
        i18n.locale = 'ja';
        const fallback = i18n.t(key, options);
        i18n.locale = oldLocale;
        return fallback;
      }
      return result;
    } catch (error) {
      console.error('Translation error for key:', key, error);
      return key;
    }
  };

  // Check if current locale is RTL
  const isRTL = () => {
    const currentDeviceLocale = deviceLocales.find(
      locale => locale.languageCode === currentLocale
    );
    return currentDeviceLocale?.textDirection === 'rtl';
  };

  // Get currency symbol
  const getCurrencySymbol = () => {
    if (currentLocale === 'ja') {
      return '円';
    }
    // For other locales, you can add currency logic based on device locale
    const currentDeviceLocale = deviceLocales.find(
      locale => locale.languageCode === currentLocale
    );
    return currentDeviceLocale?.currencySymbol || '¥';
  };

  // Format currency (unified to points)
  const formatCurrency = (amount: number): string => {
    return formatAmount(amount);
  };

  // Format date
  const formatDate = (date: Date): string => {
    if (currentLocale === 'ja') {
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format time
  const formatTime = (date: Date): string => {
    if (currentLocale === 'ja') {
      return date.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // デバイスタイムゾーンでの現在時刻を取得
  const getCurrentTimeInDeviceTimeZone = () => {
    return getCurrentTimeInTimeZone(deviceTimeZone);
  };

  return {
    currentLocale,
    setLocale,
    availableLocales,
    t,
    isRTL: isRTL(),
    isLoading,
    getCurrencySymbol,
    formatCurrency,
    formatDate,
    formatTime,
    deviceLocales,
    // デバイス情報を追加
    deviceTimeZone,
    deviceRegion,
    getCurrentTimeInDeviceTimeZone,
  };
};