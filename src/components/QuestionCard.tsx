import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Question } from '../types/auth';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { QuestionStatusBadge } from './QuestionStatusBadge';
import { QuestionReward } from './QuestionReward';
import { QuestionDifficulty } from './QuestionDifficulty';
import { Spacing } from '../constants/theme';
import { useTheme } from '../hooks/use-theme';

interface QuestionCardProps {
  question: Question & {
    answers?: any[];
    author?: { full_name: string } | null;
  };
  role: 'alumno' | 'docente';
}

export const QuestionCard = React.memo(({ question, role }: QuestionCardProps) => {
  const router = useRouter();
  const theme = useTheme();

  const handlePress = () => {
    router.push({
      pathname: '/(app)/question/[id]',
      params: { id: question.id }
    } as any);
  };

  const formattedDate = new Date(question.created_at).toLocaleDateString();
  const categoryName = question.category?.name || 'Matemáticas';

  // Count active answers
  const activeAnswers = question.answers?.filter((a: any) => a.deleted_at === null) || [];
  const answersCount = activeAnswers.length;

  // Check if has image/document attachments
  const hasAttachments = !!(question.attachments && question.attachments.length > 0);

  return (
    <Pressable style={({ pressed }) => pressed && styles.pressed} onPress={handlePress}>
      <ThemedView type="backgroundElement" style={[styles.card, { borderColor: theme.backgroundSelected }]}>
        
        {/* Header: Category & Difficulty */}
        <View style={styles.cardHeader}>
          <View style={styles.tagContainer}>
            <View style={[styles.categoryTag, { backgroundColor: theme.backgroundSelected }]}>
              <ThemedText style={[styles.tagText, { color: theme.textSecondary }]}>{categoryName}</ThemedText>
            </View>
            <QuestionDifficulty difficulty={question.difficulty} />
          </View>
          
          {role === 'alumno' && <QuestionStatusBadge status={question.status} />}
        </View>

        {/* Title */}
        <ThemedText type="smallBold" style={styles.title} numberOfLines={2}>
          {question.title}
        </ThemedText>

        {/* Footer: Date, Reward, and Role-specific metadata */}
        <View style={[styles.cardFooter, { borderTopColor: theme.backgroundSelected }]}>
          <View style={styles.footerLeft}>
            <ThemedText type="small" themeColor="textSecondary">
              {formattedDate}
            </ThemedText>
            
            {role === 'alumno' && (
              <ThemedText type="small" themeColor="textSecondary" style={styles.metaSpacing}>
                💬 {answersCount} {answersCount === 1 ? 'respuesta' : 'respuestas'}
              </ThemedText>
            )}

            {role === 'docente' && (
              <>
                <ThemedText type="small" themeColor="textSecondary" style={styles.metaSpacing}>
                  👤 {question.author?.full_name || 'Estudiante'}
                </ThemedText>
                {hasAttachments && (
                  <ThemedText type="small" style={[styles.metaSpacing, styles.attachmentIndicator]}>
                    📎 adjunto
                  </ThemedText>
                )}
              </>
            )}
          </View>

          <QuestionReward tokens={question.reward_tokens} />
        </View>

      </ThemedView>
    </Pressable>
  );
});
QuestionCard.displayName = 'QuestionCard';

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
  },
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1,
    marginBottom: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: Spacing.three,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: Spacing.two,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaSpacing: {
    marginLeft: Spacing.three,
  },
  attachmentIndicator: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
});
