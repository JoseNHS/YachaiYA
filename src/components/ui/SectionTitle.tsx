import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Typography, Colors } from '@/constants/theme';

export interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  subtitle,
  align = 'left',
}) => {
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  return (
    <ThemedText
      style={[
        styles.title,
        {
          textAlign: align,
          fontFamily: Typography.fontFamily.semiBold,
          color: colorPalette.text,
        }
      ]}
    >
      {title}
      {subtitle && (
        <ThemedText
          style={[
            styles.subtitle,
            {
              fontFamily: Typography.fontFamily.regular,
              color: colorPalette.textSecondary,
            }
          ]}
        >
          {'\n'}{subtitle}
        </ThemedText>
      )}
    </ThemedText>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: Typography.sizes.h2,
    marginBottom: Spacing.twelve,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: Typography.sizes.caption + 1,
    lineHeight: 18,
  },
});
