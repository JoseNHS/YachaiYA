import React, { useState } from 'react';
import { StyleSheet, Animated, Pressable } from 'react-native';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Typography, Colors } from '@/constants/theme';

export interface TokenChipProps {
  amount: number;
  onPress?: () => void;
}

export const TokenChip: React.FC<TokenChipProps> = ({ amount, onPress }) => {
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  const [scaleValue] = useState(() => new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: 'rgba(108, 198, 255, 0.12)',
            borderColor: colorPalette.primary,
            transform: [{ scale: scaleValue }],
          }
        ]}
      >
        <ThemedText style={styles.icon}>🪙</ThemedText>
        <ThemedText
          style={[
            styles.text,
            {
              fontFamily: Typography.fontFamily.semiBold,
              color: colorPalette.primary,
            }
          ]}
        >
          {amount} Tokens
        </ThemedText>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.twelve,
    paddingVertical: Spacing.six,
    borderRadius: Radius.r20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    fontSize: 14,
    marginRight: Spacing.four,
  },
  text: {
    fontSize: Typography.sizes.caption + 1,
  },
});
