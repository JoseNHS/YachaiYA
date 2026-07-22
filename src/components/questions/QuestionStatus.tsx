import React from 'react';
import { Badge } from '../ui/Badge';

export interface QuestionStatusProps {
  status: 'open' | 'solved' | 'in_review' | 'expired' | 'cancelled';
}

export const QuestionStatus: React.FC<QuestionStatusProps> = ({ status }) => {
  return <Badge variant={status} />;
};
