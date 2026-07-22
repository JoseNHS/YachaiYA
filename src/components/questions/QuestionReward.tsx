import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Typography, Colors } from '@/constants/theme';

export interface QuestionRewardProps {
  amount: number;
}

export const QuestionReward: React.FC<QuestionRewardProps> = ({ amount }) => {
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: 'rgba(255, 20, 147, 0.08)',
          borderColor: colorPalette.accent,
        }
      ]}
    >
      <ThemedText style={styles.icon}>💰</ThemedText>
      <ThemedText
        style={[
          styles.text,
          {
            fontFamily: Typography.fontFamily.semiBold,
            color: colorPalette.accent,
          }
        ]}
      >
        {amount} Tokens
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.eight,
    paddingVertical: Spacing.four,
    borderRadius: Radius.r20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    fontSize: 12,
    marginRight: Spacing.four,
  },
  text: {
    fontSize: Typography.sizes.caption,
  },
});
