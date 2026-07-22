import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Colors, Spacing } from '@/constants/theme';

export interface DividerProps {
  style?: StyleProp<ViewStyle>;
  vertical?: boolean;
}

export const Divider: React.FC<DividerProps> = ({ style, vertical = false }) => {
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  return (
    <View
      style={[
        vertical ? styles.vertical : styles.horizontal,
        { backgroundColor: colorPalette.border },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    width: '100%',
    marginVertical: Spacing.twelve,
  },
  vertical: {
    width: 1,
    height: '100%',
    marginHorizontal: Spacing.twelve,
  },
});
