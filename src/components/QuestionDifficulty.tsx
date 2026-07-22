import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { useTheme } from '../hooks/use-theme';

interface QuestionDifficultyProps {
  difficulty: 'Básica' | 'Intermedia' | 'Avanzada' | 'Olimpiada';
}

export function QuestionDifficulty({ difficulty }: QuestionDifficultyProps) {
  const theme = useTheme();

  let difficultyColor = '#3B82F6';
  switch (difficulty) {
    case 'Básica':
      difficultyColor = '#10B981';
      break;
    case 'Intermedia':
      difficultyColor = '#3B82F6';
      break;
    case 'Avanzada':
      difficultyColor = '#F59E0B';
      break;
    case 'Olimpiada':
      difficultyColor = '#EF4444';
      break;
  }

  return (
    <View style={[styles.difficultyTag, { borderColor: theme.backgroundSelected }]}>
      <ThemedText style={[styles.difficultyText, { color: difficultyColor }]}>
        {difficulty}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  difficultyTag: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});
