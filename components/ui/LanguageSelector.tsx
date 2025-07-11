import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@/lib/contexts/LocalizationContext';

interface LanguageSelectorProps {
  style?: any;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ style }) => {
  const { currentLocale, setLocale, availableLocales, t } = useI18n();
  const [showModal, setShowModal] = useState(false);

  const currentLanguage = availableLocales.find(locale => locale.code === currentLocale);

  const handleLanguageChange = async (localeCode: string) => {
    try {
      await setLocale(localeCode);
      setShowModal(false);
      
      // Show success message
      Alert.alert(
        t('common.success') || 'Success',
        t('settings.languageChanged')
      );
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert(
        t('common.error'),
        t('errors.unknownError')
      );
    }
  };

  return (
    <View style={style}>
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        className="flex-row items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
      >
        <View className="flex-row items-center">
          <Ionicons name="language" size={24} color="#6B7280" />
          <Text className="ml-3 text-base font-medium text-gray-900">
            {t('settings.language')}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-gray-600 mr-2">
            {currentLanguage?.name}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </View>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-lg p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-lg font-bold text-gray-900">
                {t('settings.changeLanguage')}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {availableLocales.map((locale) => (
              <TouchableOpacity
                key={locale.code}
                onPress={() => handleLanguageChange(locale.code)}
                className="flex-row items-center justify-between py-4 border-b border-gray-100"
              >
                <Text 
                  className={`text-base ${
                    currentLocale === locale.code 
                      ? 'font-bold text-pink-500' 
                      : 'text-gray-900'
                  }`}
                >
                  {locale.name}
                </Text>
                {currentLocale === locale.code && (
                  <Ionicons name="checkmark" size={20} color="#EC4899" />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setShowModal(false)}
              className="mt-6 py-3 bg-gray-100 rounded-lg"
            >
              <Text className="text-center text-base font-medium text-gray-700">
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};