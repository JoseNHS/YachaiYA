import React from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { Question } from '../types/auth';
import { QuestionCard } from './QuestionCard';
import { QuestionEmptyState } from './QuestionEmptyState';
import { QuestionLoading } from './QuestionLoading';
import { Spacing } from '../constants/theme';

interface QuestionListProps {
  questions: Question[];
  role: 'alumno' | 'docente';
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  error?: any;
  onRetry?: () => void;
}

export function QuestionList({
  questions,
  role,
  loading,
  refreshing,
  onRefresh,
  error,
  onRetry
}: QuestionListProps) {
  if (loading && questions.length === 0) {
    return <QuestionLoading />;
  }

  if (error) {
    const errorType = error.message?.includes('Network') || error.message?.includes('fetch')
      ? 'connection_error'
      : 'database_error';
    return (
      <QuestionEmptyState
        type={errorType}
        message={error.message}
        onRetry={onRetry}
      />
    );
  }

  const renderItem = ({ item }: { item: Question }) => (
    <QuestionCard question={item} role={role} />
  );

  const handleEmpty = () => {
    const emptyType = 'empty';
    const message = role === 'alumno'
      ? 'Aún no has publicado ningún ejercicio matemático. ¡Haz clic en el botón de publicar para empezar!'
      : 'No hay ejercicios disponibles para resolver en este momento. ¡Vuelve más tarde!';
    return <QuestionEmptyState type={emptyType} message={message} />;
  };

  return (
    <FlatList
      data={questions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={role === 'alumno' ? '#6366F1' : '#3B82F6'}
          colors={[role === 'alumno' ? '#6366F1' : '#3B82F6']}
        />
      }
      ListEmptyComponent={handleEmpty}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: Spacing.six,
  },
});
