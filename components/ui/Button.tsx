import React, { useRef } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps, Animated, GestureResponderEvent } from 'react-native';
import * as Haptics from 'expo-haptics';

interface ButtonProps extends TouchableOpacityProps {
  title?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className,
  children,
  onPress,
  ...props
}: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const baseClasses = 'flex-row items-center justify-center rounded-lg';
  
  const variantClasses = {
    primary: 'bg-blue-600 active:bg-blue-700',
    secondary: 'bg-gray-200 active:bg-gray-300',
    ghost: 'bg-transparent',
  };

  const sizeClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  const textVariantClasses = {
    primary: 'text-white',
    secondary: 'text-gray-900',
    ghost: 'text-blue-600',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
    disabled || isLoading ? 'opacity-50' : ''
  } ${className || ''}`;

  const textClasses = `font-medium ${textVariantClasses[variant]} ${textSizeClasses[size]}`;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = (event: GestureResponderEvent) => {
    if (disabled || isLoading) return;
    
    // 触覚フィードバック
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (onPress) {
      onPress(event);
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        className={buttonClasses}
        disabled={disabled || isLoading}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        {...props}
      >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' ? 'white' : '#3B82F6'}
          size="small"
        />
      ) : children ? (
        children
      ) : (
        <Text className={textClasses}>{title}</Text>
      )}
      </TouchableOpacity>
    </Animated.View>
  );
}