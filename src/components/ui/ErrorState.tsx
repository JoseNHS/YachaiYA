import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Typography, Colors } from '@/constants/theme';
import { Card } from './Card';
import { Button } from './Button';

export interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Ocurrió un error inesperado al intentar cargar los datos.',
  onRetry,
}) => {
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  return (
    <Card style={styles.card}>
      <ThemedText style={styles.emoji}>⚠️</ThemedText>
      <ThemedText
        style={[
          styles.title,
          {
            fontFamily: Typography.fontFamily.semiBold,
            color: colorPalette.text,
          }
        ]}
      >
        Error de Carga
      </ThemedText>
      <ThemedText
        style={[
          styles.text,
          {
            fontFamily: Typography.fontFamily.regular,
            color: colorPalette.textSecondary,
          }
        ]}
      >
        {message}
      </ThemedText>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          title="Reintentar"
          onPress={onRetry}
          style={styles.retryBtn}
        />
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.twentyFour,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.sixteen,
  },
  emoji: {
    fontSize: 36,
    marginBottom: Spacing.twelve,
  },
  title: {
    fontSize: Typography.sizes.h3,
    marginBottom: Spacing.eight,
  },
  text: {
    fontSize: Typography.sizes.body,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.sixteen,
  },
  retryBtn: {
    minWidth: 120,
  },
});
