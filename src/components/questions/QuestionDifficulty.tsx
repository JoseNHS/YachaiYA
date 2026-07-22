import React from 'react';
import { Badge } from '../ui/Badge';

export interface QuestionDifficultyProps {
  difficulty: 'Básica' | 'Intermedia' | 'Avanzada' | 'Olimpiada';
}

export const QuestionDifficulty: React.FC<QuestionDifficultyProps> = ({ difficulty }) => {
  const getVariant = () => {
    switch (difficulty) {
      case 'Básica': return 'difficulty_easy';
      case 'Intermedia': return 'difficulty_medium';
      case 'Avanzada': return 'difficulty_hard';
      default: return 'difficulty_olympiad';
    }
  };

  return <Badge variant={getVariant()} />;
};
