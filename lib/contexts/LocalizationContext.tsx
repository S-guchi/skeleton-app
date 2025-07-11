import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalization } from '../hooks/useLocalization';

interface LocalizationContextType {
  currentLocale: string;
  setLocale: (locale: string) => Promise<void>;
  availableLocales: { code: string; name: string }[];
  t: (key: string, options?: any) => string;
  isRTL: boolean;
  isLoading: boolean;
  getCurrencySymbol: () => string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date) => string;
  formatTime: (date: Date) => string;
  deviceLocales: any[];
  // デバイス情報を追加
  deviceTimeZone: string;
  deviceRegion: string;
  getCurrentTimeInDeviceTimeZone: () => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

interface LocalizationProviderProps {
  children: ReactNode;
}

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({ children }) => {
  const localizationHook = useLocalization();

  // Show loading screen while initializing locale
  if (localizationHook.isLoading) {
    return null; // or a loading spinner
  }

  return (
    <LocalizationContext.Provider value={localizationHook}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useI18n = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useI18n must be used within a LocalizationProvider');
  }
  return context;
};

// Export for backward compatibility
export { useLocalization } from '../hooks/useLocalization';