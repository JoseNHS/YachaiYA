import React from 'react';
import { Pressable, StyleSheet, ActivityIndicator, PressableProps, StyleProp, ViewStyle } from 'react-native';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Typography } from '@/constants/theme';

export interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'emphasis' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  title: string;
  style?: StyleProp<ViewStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  title,
  style,
  ...props
}) => {
  const theme = useTheme();

  const getStyles = () => {
    const bgStyle: ViewStyle = {};
    let textColor: string = theme.text;

    switch (variant) {
      case 'primary':
        bgStyle.backgroundColor = theme.primary;
        textColor = '#FFFFFF';
        break;
      case 'secondary':
        bgStyle.backgroundColor = theme.backgroundElement;
        bgStyle.borderWidth = 1.5;
        bgStyle.borderColor = theme.border;
        textColor = '#111111';
        break;
      case 'emphasis':
        bgStyle.backgroundColor = theme.accent;
        textColor = '#FFFFFF';
        break;
      case 'outline':
        bgStyle.backgroundColor = 'transparent';
        bgStyle.borderWidth = 1.5;
        bgStyle.borderColor = theme.primary;
        textColor = theme.primary;
        break;
      case 'ghost':
        bgStyle.backgroundColor = 'transparent';
        textColor = theme.text;
        break;
      case 'danger':
        bgStyle.backgroundColor = '#EF4444';
        textColor = '#FFFFFF';
        break;
    }

    if (disabled || loading) {
      bgStyle.opacity = 0.5;
    }

    return { bgStyle, textColor };
  };

  const { bgStyle, textColor } = getStyles();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[size],
        bgStyle,
        pressed && !disabled && !loading && { opacity: 0.9, transform: [{ scale: 0.98 }] },
        style
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <ThemedText
          style={[
            styles.text,
            { 
              color: textColor,
              fontFamily: Typography.fontFamily.semiBold,
            }
          ]}
        >
          {title}
        </ThemedText>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.r16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  sm: {
    paddingVertical: Spacing.eight,
    paddingHorizontal: Spacing.sixteen,
  },
  md: {
    paddingVertical: Spacing.twelve,
    paddingHorizontal: Spacing.twentyFour,
  },
  lg: {
    paddingVertical: Spacing.sixteen,
    paddingHorizontal: Spacing.thirtyTwo,
  },
  text: {
    fontSize: Typography.sizes.body,
    textAlign: 'center',
  },
});
