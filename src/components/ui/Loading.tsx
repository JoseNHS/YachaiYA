import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Animated, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Colors } from '@/constants/theme';

export interface SkeletonProps {
  width?: number | string;
  height: number;
  borderRadius?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height,
  borderRadius = Radius.r8,
}) => {
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  const [fadeAnim] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colorPalette.backgroundElement,
          opacity: fadeAnim,
        }
      ]}
    />
  );
};

export const LoadingSpinner: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.spinnerContainer}>
      <ActivityIndicator size="large" color={colorPalette.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    marginVertical: Spacing.four,
  },
  spinnerContainer: {
    padding: Spacing.twentyFour,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
