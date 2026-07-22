import React, { useState } from 'react';
import { StyleSheet, TextInput, View, Pressable, TextInputProps, StyleProp, ViewStyle } from 'react-native';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Typography, Colors } from '@/constants/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'search' | 'number' | 'tokens' | 'textarea';
  error?: string | null;
  containerStyle?: StyleProp<ViewStyle>;
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  error,
  containerStyle,
  style,
  secureTextEntry,
  multiline,
  ...props
}) => {
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getKeyboardType = () => {
    switch (type) {
      case 'email':
        return 'email-address';
      case 'number':
      case 'tokens':
        return 'numeric';
      default:
        return 'default';
    }
  };

  const isPasswordType = type === 'password';
  const actualSecureTextEntry = isPasswordType ? !showPassword : secureTextEntry;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <ThemedText
          style={[
            styles.label,
            {
              fontFamily: Typography.fontFamily.medium,
              color: colorPalette.textSecondary,
            }
          ]}
        >
          {label}
        </ThemedText>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colorPalette.backgroundElement,
            borderColor: error 
              ? '#EF4444' 
              : isFocused 
                ? colorPalette.primary 
                : colorPalette.border,
            borderWidth: 1.5,
          },
          type === 'textarea' && { height: 120, alignItems: 'flex-start' }
        ]}
      >
        {type === 'search' && (
          <ThemedText style={styles.prefixIcon}>🔍</ThemedText>
        )}
        {type === 'tokens' && (
          <ThemedText style={styles.prefixIcon}>🪙</ThemedText>
        )}

        <TextInput
          style={[
            styles.textInput,
            {
              color: colorPalette.text,
              fontFamily: Typography.fontFamily.regular,
            },
            type === 'textarea' && { height: '100%', textAlignVertical: 'top', paddingTop: Spacing.eight },
            style
          ]}
          placeholderTextColor={colorPalette.textSecondary}
          secureTextEntry={actualSecureTextEntry}
          keyboardType={getKeyboardType()}
          multiline={type === 'textarea' || multiline}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {isPasswordType && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeBtn}
          >
            <ThemedText style={{ color: colorPalette.textSecondary }}>
              {showPassword ? '👁️' : '🙈'}
            </ThemedText>
          </Pressable>
        )}
      </View>

      {error && (
        <ThemedText
          style={[
            styles.errorText,
            { fontFamily: Typography.fontFamily.regular }
          ]}
        >
          {error}
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: Spacing.sixteen,
  },
  label: {
    fontSize: Typography.sizes.caption,
    marginBottom: Spacing.eight,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.r16,
    paddingHorizontal: Spacing.twelve,
    height: 48,
  },
  textInput: {
    flex: 1,
    fontSize: Typography.sizes.body,
    height: '100%',
    padding: 0,
  },
  prefixIcon: {
    marginRight: Spacing.eight,
    fontSize: 16,
  },
  eyeBtn: {
    padding: Spacing.four,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: Typography.sizes.caption - 1,
    color: '#EF4444',
    marginTop: Spacing.four,
  },
});
