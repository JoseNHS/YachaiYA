import React from 'react';
import { StyleSheet, View, TextInput, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Typography, Colors } from '@/constants/theme';
import { ThemedText } from '../themed-text';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Buscar ejercicios...',
  style,
}) => {
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colorPalette.backgroundElement,
          borderColor: colorPalette.border,
        },
        style
      ]}
    >
      <ThemedText style={styles.searchIcon}>🔍</ThemedText>
      <TextInput
        style={[
          styles.input,
          {
            color: colorPalette.text,
            fontFamily: Typography.fontFamily.regular,
          }
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colorPalette.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.r16,
    borderWidth: 1,
    paddingHorizontal: Spacing.sixteen,
    height: 48,
    width: '100%',
  },
  searchIcon: {
    marginRight: Spacing.twelve,
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: Typography.sizes.body,
    height: '100%',
    padding: 0,
  },
});
