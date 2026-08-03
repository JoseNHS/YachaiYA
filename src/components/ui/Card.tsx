import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Shadows } from '@/constants/theme';

export interface CardProps extends ViewProps {
  shadowSize?: 'xs' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ shadowSize = 'xs', style, children, ...props }) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.border,
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
    borderRadius: Radius.r20,
    borderWidth: 1,
    padding: Spacing.twenty,
    marginBottom: Spacing.sixteen,
  },
});
