import React from 'react';
import { StyleSheet, Pressable, PressableProps } from 'react-native';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Typography, Colors } from '@/constants/theme';

export interface ChipProps extends PressableProps {
  label: string;
  selected?: boolean;
}

export const Chip: React.FC<ChipProps> = ({ label, selected = false, style, ...props }) => {
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? colorPalette.primary : colorPalette.backgroundElement,
          borderColor: selected ? colorPalette.primary : colorPalette.border,
          borderWidth: 1,
        },
        pressed && { opacity: 0.85 },
        style as any
      ]}
      {...props}
    >
      <ThemedText
        style={{
          fontSize: Typography.sizes.caption,
          fontFamily: selected ? Typography.fontFamily.semiBold : Typography.fontFamily.medium,
          color: selected ? '#111111' : colorPalette.text,
        }}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.twelve,
    paddingVertical: Spacing.six,
    borderRadius: Radius.r20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.eight,
    marginBottom: Spacing.eight,
  },
});
