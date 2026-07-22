import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Typography, Colors } from '@/constants/theme';

export interface QuestionFooterProps {
  answersCount: number;
}

export const QuestionFooter: React.FC<QuestionFooterProps> = ({ answersCount }) => {
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.container}>
      <View style={styles.metric}>
        <ThemedText style={styles.icon}>💬</ThemedText>
        <ThemedText
          style={[
            styles.text,
            {
              fontFamily: Typography.fontFamily.medium,
              color: colorPalette.textSecondary,
            }
          ]}
        >
          {answersCount === 0
            ? 'Sin respuestas aún'
            : answersCount === 1
              ? '1 respuesta'
              : `${answersCount} respuestas`}
        </ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(150, 150, 150, 0.08)',
    paddingTop: Spacing.eight,
    marginTop: Spacing.eight,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 14,
    marginRight: Spacing.six,
  },
  text: {
    fontSize: Typography.sizes.caption,
  },
});
