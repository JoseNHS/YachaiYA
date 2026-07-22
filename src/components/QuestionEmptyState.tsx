import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Spacing } from '../constants/theme';
import { useTheme } from '../hooks/use-theme';

interface QuestionEmptyStateProps {
  type: 'empty' | 'no_results' | 'connection_error' | 'database_error';
  message?: string;
  onRetry?: () => void;
}

export function QuestionEmptyState({ type, message, onRetry }: QuestionEmptyStateProps) {
  const theme = useTheme();

  let emoji = '📭';
  let title = 'Sin preguntas';
  let defaultMessage = 'No hay preguntas disponibles en este momento.';

  switch (type) {
    case 'empty':
      emoji = '🎒';
      title = 'Lista Vacía';
      defaultMessage = 'Aún no has publicado ningún ejercicio matemático.';
      break;
    case 'no_results':
      emoji = '🔍';
      title = 'Sin Resultados';
      defaultMessage = 'No se encontraron ejercicios que coincidan con la búsqueda.';
      break;
    case 'connection_error':
      emoji = '🔌';
      title = 'Error de Conexión';
      defaultMessage = 'Hubo un problema de conexión de red. Por favor, verifica tu internet.';
      break;
    case 'database_error':
      emoji = '⚠️';
      title = 'Error en Base de Datos';
      defaultMessage = 'Ocurrió un error inesperado al consultar los datos del servidor.';
      break;
  }

  const displayMessage = message || defaultMessage;

  return (
    <ThemedView type="backgroundElement" style={[styles.card, { borderColor: theme.backgroundSelected }]}>
      <ThemedText style={styles.emoji}>{emoji}</ThemedText>
      <ThemedText type="smallBold" style={styles.title}>{title}</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.message}>
        {displayMessage}
      </ThemedText>
      {onRetry && (
        <Pressable
          style={({ pressed }) => [
            styles.retryBtn,
            {
              backgroundColor: theme.text,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={onRetry}
        >
          <ThemedText style={[styles.retryBtnText, { color: theme.background }]}>
            🔄 Reintentar
          </ThemedText>
        </Pressable>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.six,
    borderRadius: Spacing.four,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.three,
  },
  emoji: {
    fontSize: 48,
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 18,
    marginBottom: Spacing.one,
  },
  message: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.three,
    paddingHorizontal: Spacing.two,
  },
  retryBtn: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
});
