import React, { useRef, useEffect } from 'react';
import { View, Animated } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | `${number}%`;
  height?: number;
  className?: string;
  borderRadius?: number;
}

export function SkeletonLoader({ 
  width = '100%' as const, 
  height = 20, 
  className = '',
  borderRadius = 4 
}: SkeletonLoaderProps) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [pulseAnim]);

  return (
    <Animated.View 
      style={{ 
        opacity: pulseAnim, 
        width, 
        height, 
        backgroundColor: '#E5E7EB',
        borderRadius,
      }}
      className={`bg-gray-200 dark:bg-gray-700 ${className}`}
    />
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <View className={`p-4 bg-white dark:bg-gray-800 rounded-lg ${className}`}>
      <SkeletonLoader height={16} className="mb-3" width="60%" />
      <SkeletonLoader height={12} className="mb-2" width="100%" />
      <SkeletonLoader height={12} className="mb-2" width="80%" />
      <SkeletonLoader height={12} width="40%" />
    </View>
  );
}

interface SkeletonListProps {
  itemCount?: number;
  className?: string;
}

export function SkeletonList({ itemCount = 3, className = '' }: SkeletonListProps) {
  return (
    <View className={className}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <SkeletonCard key={index} className="mb-3" />
      ))}
    </View>
  );
}