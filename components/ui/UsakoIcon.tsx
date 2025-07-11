import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

export interface UsakoIconProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
}

const sizeMap = {
  small: { width: 32, height: 32 },
  medium: { width: 48, height: 48 },
  large: { width: 64, height: 64 },
  xlarge: { width: 96, height: 96 },
} as const;

export const UsakoIcon: React.FC<UsakoIconProps> = ({
  size = 'small',
  style,
  accessibilityLabel = 'うさこ',
}) => {
  const sizeStyle = sizeMap[size];

  return (
    <Image
      testID="usako-icon"
      source={require('@/assets/images/usako_home.png')}
      style={[sizeStyle, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
    />
  );
};