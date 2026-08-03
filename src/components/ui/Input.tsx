import React, { useState } from 'react';
import { StyleSheet, TextInput, View, Pressable, TextInputProps, StyleProp, ViewStyle } from 'react-native';
import { Search, Eye, EyeOff, Coins } from 'lucide-react-native';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Typography } from '@/constants/theme';

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
              color: theme.textSecondary,
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
            backgroundColor: theme.backgroundElement,
            borderColor: error 
              ? '#EF4444' 
              : isFocused 
                ? theme.primary 
                : theme.border,
            borderWidth: 1.5,
          },
          type === 'textarea' && { height: 120, alignItems: 'flex-start' }
        ]}
      >
        {type === 'search' && (
          <Search size={18} color={theme.textSecondary} style={styles.prefixIcon} />
        )}
        {type === 'tokens' && (
          <Coins size={18} color={theme.primary} style={styles.prefixIcon} />
        )}

        <TextInput
          style={[
            styles.textInput,
            {
              color: theme.text,
              fontFamily: Typography.fontFamily.regular,
            },
            type === 'textarea' && { height: '100%', textAlignVertical: 'top', paddingTop: Spacing.eight },
            style
          ]}
          placeholderTextColor={theme.textSecondary}
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
            {showPassword ? (
              <EyeOff size={18} color={theme.textSecondary} />
            ) : (
              <Eye size={18} color={theme.textSecondary} />
            )}
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
