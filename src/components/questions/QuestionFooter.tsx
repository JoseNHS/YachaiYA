import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MessageSquare } from 'lucide-react-native';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Typography } from '@/constants/theme';

export interface QuestionFooterProps {
  answersCount: number;
}

export const QuestionFooter: React.FC<QuestionFooterProps> = ({ answersCount }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.metric}>
        <MessageSquare size={15} color={theme.textSecondary} style={{ marginRight: Spacing.eight }} />
        <ThemedText
          style={[
            styles.text,
            {
              fontFamily: Typography.fontFamily.medium,
              color: theme.textSecondary,
            }
          ]}
        >
          {answersCount === 0
            ? 'Sin respuestas aún'
            : answersCount === 1
              ? '1 respuesta'
              : `${answersCount} respuestas`}
        </ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(150, 150, 150, 0.08)',
    paddingTop: Spacing.eight,
    marginTop: Spacing.eight,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 14,
    marginRight: Spacing.six,
  },
  text: {
    fontSize: Typography.sizes.caption,
  },
});
