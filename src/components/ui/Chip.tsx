import React from 'react';
import { StyleSheet, Pressable, PressableProps } from 'react-native';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Typography } from '@/constants/theme';

export interface ChipProps extends PressableProps {
  label: string;
  selected?: boolean;
}

export const Chip: React.FC<ChipProps> = ({ label, selected = false, style, ...props }) => {
  const theme = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.primary : theme.backgroundElement,
          borderColor: selected ? theme.primary : theme.border,
          borderWidth: 1,
        },
        pressed && { opacity: 0.85, transform: [{ scale: 0.95 }] },
        style as any
      ]}
      {...props}
    >
      <ThemedText
        style={{
          fontSize: Typography.sizes.caption,
          fontFamily: selected ? Typography.fontFamily.semiBold : Typography.fontFamily.medium,
          color: selected ? '#FFFFFF' : theme.textSecondary,
        }}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.sixteen,
    paddingVertical: Spacing.eight - 2,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.eight,
    marginBottom: Spacing.eight,
  },
});
