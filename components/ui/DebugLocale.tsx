import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useI18n } from '@/lib/contexts/LocalizationContext';

export const DebugLocale: React.FC = () => {
  const { currentLocale, setLocale, t } = useI18n();

  const forceEnglish = async () => {
    try {
      await setLocale('en');
      Alert.alert('Debug', 'Locale set to English');
    } catch (error) {
      console.error('Error setting locale:', error);
    }
  };

  const forceJapanese = async () => {
    try {
      await setLocale('ja');
      Alert.alert('Debug', 'Locale set to Japanese');
    } catch (error) {
      console.error('Error setting locale:', error);
    }
  };

  const clearStorage = async () => {
    try {
      await AsyncStorage.removeItem('user_locale');
      Alert.alert('Debug', 'Locale storage cleared. Please restart app.');
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  };

  return (
    <View className="p-4 bg-yellow-100 m-4 rounded-lg">
      <Text className="text-sm font-bold mb-2">🐛 Debug Locale</Text>
      <Text className="text-xs mb-2">Current: {currentLocale}</Text>
      <Text className="text-xs mb-2">Translation test: {t('navigation.home')}</Text>
      
      <View className="flex-row space-x-2">
        <TouchableOpacity onPress={forceEnglish} className="bg-blue-500 px-3 py-1 rounded">
          <Text className="text-white text-xs">EN</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={forceJapanese} className="bg-green-500 px-3 py-1 rounded">
          <Text className="text-white text-xs">JA</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={clearStorage} className="bg-red-500 px-3 py-1 rounded">
          <Text className="text-white text-xs">Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};