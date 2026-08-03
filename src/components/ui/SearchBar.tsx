import React from 'react';
import { StyleSheet, View, TextInput, StyleProp, ViewStyle, Pressable } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Typography } from '@/constants/theme';

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

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.border,
        },
        style
      ]}
    >
      <Search size={18} color={theme.textSecondary} style={styles.searchIcon} />
      <TextInput
        style={[
          styles.input,
          {
            color: theme.text,
            fontFamily: Typography.fontFamily.regular,
          }
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} style={{ padding: Spacing.four }}>
          <X size={16} color={theme.textSecondary} />
        </Pressable>
      )}
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
