import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Typography, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { 
          color: theme[themeColor ?? 'text'],
          fontFamily: Typography.fontFamily.regular,
        },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fontFamily.regular,
  },
  smallBold: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fontFamily.semiBold,
  },
  default: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fontFamily.regular,
  },
  title: {
    fontSize: Typography.sizes.display,
    fontFamily: Typography.fontFamily.bold,
  },
  subtitle: {
    fontSize: Typography.sizes.h2,
    fontFamily: Typography.fontFamily.semiBold,
  },
  link: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fontFamily.medium,
  },
  linkPrimary: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fontFamily.semiBold,
    color: '#6CC6FF',
  },
  code: {
    fontFamily: Platform.select({ ios: 'CourierNewPSMT', default: 'monospace' }),
    fontSize: 12,
  },
});
