import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

export interface TimeValue {
  hour: number;
  minute: number;
}

interface TimePickerProps {
  testID?: string;
  value: TimeValue;
  onTimeChange: (time: TimeValue) => void;
  format?: '12' | '24';
  disabled?: boolean;
  label?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  testID,
  value,
  onTimeChange,
  format = '24',
  disabled = false,
  label,
}) => {
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [tempTime, setTempTime] = useState<TimeValue>(value);

  const formatTime = (time: TimeValue): string => {
    if (format === '12') {
      const hour12 = time.hour === 0 ? 12 : time.hour > 12 ? time.hour - 12 : time.hour;
      const ampm = time.hour >= 12 ? 'PM' : 'AM';
      return `${hour12}:${time.minute.toString().padStart(2, '0')} ${ampm}`;
    } else {
      return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
    }
  };

  const validateTime = (time: TimeValue): boolean => {
    return time.hour >= 0 && time.hour <= 23 && time.minute >= 0 && time.minute <= 59;
  };

  const handleTimePress = () => {
    if (disabled) return;
    setTempTime(value);
    setIsPickerVisible(true);
  };

  const handleConfirm = () => {
    if (!validateTime(tempTime)) {
      Alert.alert('エラー', '無効な時間です。正しい時間を選択してください。');
      return;
    }
    onTimeChange(tempTime);
    setIsPickerVisible(false);
  };

  const handleCancel = () => {
    setTempTime(value);
    setIsPickerVisible(false);
  };

  const handleDateTimeChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      const newTime = {
        hour: selectedDate.getHours(),
        minute: selectedDate.getMinutes(),
      };
      setTempTime(newTime);
    }
  };

  // TimeValueからDateオブジェクトを作成
  const timeToDate = (time: TimeValue): Date => {
    const date = new Date();
    date.setHours(time.hour);
    date.setMinutes(time.minute);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  };

  return (
    <View testID={testID} className="w-full">
      {label && (
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </Text>
      )}
      
      <TouchableOpacity
        testID="time-display"
        onPress={handleTimePress}
        disabled={disabled}
        className={`
          flex-row items-center justify-between p-3 rounded-lg border
          ${disabled 
            ? 'bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700' 
            : 'bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600'
          }
        `}
      >
        <View className="flex-row items-center">
          <Ionicons
            name="time"
            size={20}
            color={disabled ? '#9CA3AF' : '#FF90BB'}
            className="mr-2"
          />
          <Text 
            testID="time-display-text"
            className={`text-base ${
              disabled 
                ? 'text-gray-500 dark:text-gray-400' 
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {formatTime(value)}
          </Text>
        </View>
        
        {!disabled && (
          <Ionicons
            name="chevron-down"
            size={20}
            color="#9CA3AF"
          />
        )}
      </TouchableOpacity>

      <Modal
        testID="time-picker-modal"
        visible={isPickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white dark:bg-gray-800 rounded-t-xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                時刻を選択
              </Text>
              <TouchableOpacity
                onPress={handleCancel}
                className="p-2"
              >
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View testID="time-picker-wheel" className="items-center mb-4">
              <DateTimePicker
                value={timeToDate(tempTime)}
                mode="time"
                display="spinner"
                onChange={handleDateTimeChange}
                is24Hour={format === '24'}
              />
            </View>

            <View className="flex-row justify-end space-x-3">
              <TouchableOpacity
                testID="cancel-button"
                onPress={handleCancel}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600"
              >
                <Text className="text-gray-700 dark:text-gray-300 font-medium">
                  キャンセル
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                testID="confirm-button"
                onPress={handleConfirm}
                className="px-4 py-2 rounded-lg bg-pink-500"
              >
                <Text className="text-white font-medium">
                  確定
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};