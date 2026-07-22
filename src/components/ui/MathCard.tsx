import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Typography, Shadows, Colors } from '@/constants/theme';

export interface MathCardProps extends ViewProps {
  title?: string;
}

export const MathCard: React.FC<MathCardProps> = ({ title, children, style, ...props }) => {
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#1C1D21' : '#F8FAFC',
          borderColor: isDark ? '#2E3035' : '#E2E8F0',
        },
        Shadows.xs,
        style
      ]}
      {...props}
    >
      {title && (
        <ThemedText
          style={[
            styles.title,
            {
              fontFamily: Typography.fontFamily.semiBold,
              color: colorPalette.textSecondary,
              borderBottomColor: isDark ? '#2E3035' : '#E2E8F0',
            }
          ]}
        >
          {title}
        </ThemedText>
      )}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.r12,
    borderWidth: 1.5,
    marginVertical: Spacing.eight,
    overflow: 'hidden',
  },
  title: {
    fontSize: Typography.sizes.caption,
    paddingHorizontal: Spacing.twelve,
    paddingVertical: Spacing.six,
    borderBottomWidth: 1,
  },
  content: {
    padding: Spacing.twelve,
  },
});
