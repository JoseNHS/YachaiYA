import React from 'react';
import { Pressable, StyleSheet, PressableProps, StyleProp, ViewStyle } from 'react-native';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Colors } from '@/constants/theme';

export interface IconButtonProps extends PressableProps {
  icon: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  style?: StyleProp<ViewStyle>;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 'md',
  variant = 'ghost',
  style,
  disabled,
  ...props
}) => {
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  const getStyles = () => {
    const bgStyle: ViewStyle = {};
    let iconColor = colorPalette.text;

    switch (variant) {
      case 'primary':
        bgStyle.backgroundColor = colorPalette.primary;
        iconColor = '#111111';
        break;
      case 'secondary':
        bgStyle.backgroundColor = colorPalette.accent;
        iconColor = '#FFFFFF';
        break;
      case 'outline':
        bgStyle.backgroundColor = 'transparent';
        bgStyle.borderWidth = 1.5;
        bgStyle.borderColor = colorPalette.border;
        iconColor = colorPalette.text;
        break;
      case 'ghost':
        bgStyle.backgroundColor = 'transparent';
        iconColor = colorPalette.text;
        break;
    }

    if (disabled) {
      bgStyle.opacity = 0.5;
    }

    return { bgStyle, iconColor };
  };

  const { bgStyle, iconColor } = getStyles();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[size],
        bgStyle,
        pressed && !disabled && { opacity: 0.75 },
        style
      ]}
      disabled={disabled}
      {...props}
    >
      <ThemedText style={[styles.iconText, { color: iconColor }]}>
        {icon}
      </ThemedText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.r32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: {
    width: 32,
    height: 32,
  },
  md: {
    width: 40,
    height: 40,
  },
  lg: {
    width: 48,
    height: 48,
  },
  iconText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
