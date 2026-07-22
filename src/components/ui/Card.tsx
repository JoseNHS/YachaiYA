import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Shadows, Colors } from '@/constants/theme';

export interface CardProps extends ViewProps {
  shadowSize?: 'xs' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ shadowSize = 'sm', style, children, ...props }) => {
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colorPalette.backgroundElement,
          borderColor: colorPalette.border,
        },
        Shadows[shadowSize],
        style
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.r16,
    borderWidth: 1,
    padding: Spacing.sixteen,
    marginBottom: Spacing.sixteen,
  },
});
