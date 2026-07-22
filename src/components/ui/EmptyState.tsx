import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Typography, Colors } from '@/constants/theme';

export interface EmptyStateProps {
  emoji?: string;
  title: string;
  description: string;
  actionButton?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  emoji = '🔭',
  title,
  description,
  actionButton,
}) => {
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colorPalette.backgroundElement,
          borderColor: colorPalette.border,
        }
      ]}
    >
      <ThemedText style={styles.emoji}>{emoji}</ThemedText>
      
      <ThemedText
        style={[
          styles.title,
          {
            fontFamily: Typography.fontFamily.semiBold,
            color: colorPalette.text,
          }
        ]}
      >
        {title}
      </ThemedText>

      <ThemedText
        style={[
          styles.description,
          {
            fontFamily: Typography.fontFamily.regular,
            color: colorPalette.textSecondary,
          }
        ]}
      >
        {description}
      </ThemedText>

      {actionButton && (
        <View style={styles.actionContainer}>
          {actionButton}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.r16,
    borderWidth: 1,
    padding: Spacing.thirtyTwo,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.sixteen,
    width: '100%',
  },
  emoji: {
    fontSize: 40,
    marginBottom: Spacing.sixteen,
  },
  title: {
    fontSize: Typography.sizes.h3,
    textAlign: 'center',
    marginBottom: Spacing.eight,
  },
  description: {
    fontSize: Typography.sizes.body,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.twentyFour,
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
  },
});
