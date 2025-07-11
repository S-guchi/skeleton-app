import React, { forwardRef } from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, containerClassName, className, ...props }, ref) => {
    const inputClasses = `border border-gray-300 rounded-lg px-4 py-3 text-base ${
      error ? 'border-red-500' : 'focus:border-blue-500'
    } ${className || ''}`;

    return (
      <View className={containerClassName}>
        {label && (
          <Text className="text-sm font-medium text-gray-700 mb-1">
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          className={inputClasses}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
        {error && (
          <Text className="text-sm text-red-500 mt-1">{error}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';