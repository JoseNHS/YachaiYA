import React from 'react';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';

export interface EmptyQuestionsProps {
  onPublishPress?: () => void;
}

export const EmptyQuestions: React.FC<EmptyQuestionsProps> = ({ onPublishPress }) => {
  return (
    <EmptyState
      emoji="🪐"
      title="Todavía no existen ejercicios publicados"
      description="¡Sé el primero en compartir uno y ayuda a la comunidad matemática a crecer!"
      actionButton={
        onPublishPress ? (
          <Button
            title="Publicar ejercicio"
            variant="secondary"
            onPress={onPublishPress}
          />
        ) : undefined
      }
    />
  );
};
