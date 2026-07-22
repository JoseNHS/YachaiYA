import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Pressable, View, ActivityIndicator, RefreshControl, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MathText } from '@/components/MathText';
import { QuestionStatusBadge } from '@/components/QuestionStatusBadge';
import { QuestionReward } from '@/components/questions/QuestionReward';
import { QuestionDifficulty } from '@/components/QuestionDifficulty';
import { AnswerCard } from '@/components/AnswerCard';
import { AnswerForm } from '@/components/AnswerForm';
import { questionService } from '@/services/questionService';
import { answerService } from '@/services/answerService';
import { Question, Answer } from '@/types/auth';
import { useAuth } from '@/hooks/useAuth';
import { Spacing, Colors, Typography, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export default function QuestionDetailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;
  const { user, refreshProfile } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<any>(null);

  const loadData = useCallback(async (showIndicator = true) => {
    if (!id) return;
    if (showIndicator) setLoading(true);
    setError(null);
    try {
      const [q, ansList] = await Promise.all([
        questionService.getQuestionById(id),
        answerService.getAnswersByQuestion(id)
      ]);
      setQuestion(q);
      setAnswers(ansList);
    } catch (err: any) {
      console.error('Error loading question or answers:', err);
      setError(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(false);
  };

  const handleAcceptAnswer = useCallback((answerId: string) => {
    setSelectedAnswerId(answerId);
    setConfirmModalVisible(true);
  }, []);

  const confirmAcceptAnswer = async () => {
    if (!id || !selectedAnswerId) return;
    setConfirmModalVisible(false);
    setLoading(true);
    try {
      await answerService.acceptAnswer(id, selectedAnswerId);
      await refreshProfile(); // Actualizar balance y reputación en el frontend de forma atómica
      alert('¡Solución aceptada con éxito! El ejercicio ha sido resuelto.');
      await loadData(false);
    } catch (e: any) {
      console.error('Error accepting answer:', e);
      alert(e.message || 'Error al aceptar la respuesta.');
    } finally {
      setLoading(false);
      setSelectedAnswerId(null);
    }
  };

  if (loading && !question) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </ThemedView>
    );
  }

  if (error || !question) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText style={styles.errorEmoji}>⚠️</ThemedText>
        <ThemedText type="smallBold" style={styles.errorTitle}>Error al cargar</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.errorText}>
          {error?.message || 'El ejercicio solicitado no pudo ser encontrado.'}
        </ThemedText>
        
        <Pressable style={[styles.backErrorBtn, { backgroundColor: theme.text, marginBottom: 12 }]} onPress={() => loadData(true)}>
          <ThemedText style={{ color: theme.background, fontWeight: 'bold' }}>Reintentar</ThemedText>
        </Pressable>

        <Pressable style={[styles.backErrorBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.border }]} onPress={() => router.back()}>
          <ThemedText style={{ color: theme.text, fontWeight: 'bold' }}>Volver al Home</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  // Find image attachment if exists
  const imageAttachment = question.attachments?.find(
    (att) => att.file_type.startsWith('image/')
  );

  const isSelfQuestion = user !== null && question.author_id === user.id;
  const isDocente = user !== null && user.role === 'docente';

  // Renders all the question content at the top of the FlatList
  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Metadata section */}
      <View style={styles.metaRow}>
        <View style={styles.tagsContainer}>
          <View style={[styles.categoryTag, { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText style={[styles.tagText, { color: theme.textSecondary }]}>
              {question.category?.name || 'Matemáticas'}
            </ThemedText>
          </View>
          <QuestionDifficulty difficulty={question.difficulty} />
        </View>
        <QuestionStatusBadge status={question.status} />
      </View>

      {/* Reward & Author Box */}
      <View style={[styles.infoCard, { backgroundColor: theme.backgroundElement }]}>
        <View style={styles.infoCol}>
          <QuestionReward amount={question.reward_tokens} />
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoCol}>
          <ThemedText type="small" themeColor="textSecondary">Publicado por</ThemedText>
          <ThemedText type="smallBold">
            {(question as any).author?.full_name || 'Estudiante'}
          </ThemedText>
        </View>
      </View>

      {/* Title & Description */}
      <ThemedText type="title" style={styles.title}>
        {question.title}
      </ThemedText>

      <ThemedText type="small" themeColor="textSecondary" style={styles.dateLabel}>
        Publicado el {new Date(question.created_at).toLocaleString()}
      </ThemedText>

      <View style={styles.descriptionContainer}>
        <MathText text={question.description} style={styles.mathBlock} />
      </View>

      {/* Image attachment */}
      {imageAttachment && (
        <View style={styles.attachmentContainer}>
          <ThemedText type="smallBold" style={styles.attachmentTitle}>
            🖼️ Imagen Adjunta:
          </ThemedText>
          <Image
            source={{ uri: imageAttachment.file_url }}
            style={styles.attachmentImage}
            contentFit="contain"
          />
        </View>
      )}

      {/* Answers Section Header */}
      <View style={[styles.answersSectionHeader, { borderBottomColor: theme.backgroundSelected }]}>
        <ThemedText type="subtitle" style={styles.answersSectionTitle}>
          🎓 Soluciones de Expertos ({answers.length})
        </ThemedText>
      </View>
    </View>
  );

  // Renders the form or warnings at the bottom of the FlatList
  const renderFooter = () => {
    if (!isDocente) {
      return (
        <View style={styles.footerPlaceholder}>
          <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
            Solo los docentes colaboradores y expertos pueden proponer soluciones a los ejercicios.
          </ThemedText>
        </View>
      );
    }

    if (isSelfQuestion) {
      return (
        <ThemedView type="backgroundElement" style={[styles.warningBox, styles.footerPlaceholder, { borderColor: theme.backgroundSelected }]}>
          <ThemedText type="smallBold" style={styles.warningTitle}>⚠️ Auto-Resolución Restringida</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
            No puedes proponer soluciones a tus propios ejercicios matemáticos.
          </ThemedText>
        </ThemedView>
      );
    }

    if (question.status !== 'open') {
      return (
        <ThemedView type="backgroundElement" style={[styles.warningBox, styles.footerPlaceholder, { borderColor: theme.backgroundSelected }]}>
          <ThemedText type="smallBold" style={styles.warningTitle}>🔒 Ejercicio Cerrado</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
            Este ejercicio se encuentra solucionado o cerrado y no acepta nuevas respuestas.
          </ThemedText>
        </ThemedView>
      );
    }

    return (
      <AnswerForm
        questionId={question.id}
        userId={user.id}
        onSuccess={() => loadData(false)}
      />
    );
  };

  const renderEmptyAnswers = () => (
    <View style={styles.emptyAnswersCard}>
      <ThemedText style={styles.emptyAnswersEmoji}>⏳</ThemedText>
      <ThemedText type="smallBold" style={styles.emptyAnswersTitle}>Sin respuestas aún</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.emptyAnswersText}>
        Esperando a que un docente proponga una solución detallada paso a paso.
      </ThemedText>
    </View>
  );

  const sortedAnswers = [...answers].sort((a, b) => {
    const aAccepted = question?.accepted_answer_id === a.id || a.is_accepted;
    const bAccepted = question?.accepted_answer_id === b.id || b.is_accepted;
    if (aAccepted && !bAccepted) return -1;
    if (!aAccepted && bAccepted) return 1;
    if (a.votes !== b.votes) return b.votes - a.votes;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <ThemedView style={[styles.container, { backgroundColor: colorPalette.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        
        {/* Detail Header */}
        <View style={[styles.header, { backgroundColor: colorPalette.backgroundElement, borderBottomColor: colorPalette.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ThemedText style={[styles.backBtnText, { color: colorPalette.primary, fontFamily: Typography.fontFamily.semiBold }]}>
              ← Volver
            </ThemedText>
          </Pressable>
          <ThemedText style={[styles.headerTitle, { fontFamily: Typography.fontFamily.semiBold, color: colorPalette.text }]}>
            Detalle del Ejercicio
          </ThemedText>
          <View style={{ width: 60 }} />
        </View>

        {/* Optimally render content list using FlatList */}
        <FlatList
          data={sortedAnswers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSelfQuestion = user !== null && question.author_id === user.id;
            const isAccepted = question.accepted_answer_id === item.id || item.is_accepted;
            const canAccept = isSelfQuestion && question.status === 'open' && !isAccepted;
            return (
              <AnswerCard
                answer={item}
                currentUserId={user?.id || null}
                onRefresh={() => loadData(false)}
                canAccept={canAccept}
                onAccept={handleAcceptAnswer}
                isAcceptedAnswer={isAccepted}
              />
            );
          }}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmptyAnswers}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colorPalette.primary} />
          }
        />

        {/* Modal de Confirmación de Aceptación */}
        <Modal
          visible={confirmModalVisible}
          onClose={() => {
            setConfirmModalVisible(false);
            setSelectedAnswerId(null);
          }}
          title="Aceptar esta respuesta"
        >
          <View style={{ gap: Spacing.sixteen }}>
            <ThemedText style={{ fontSize: 14, fontFamily: Typography.fontFamily.regular, color: colorPalette.text, lineHeight: 20 }}>
              Esta acción transferirá automáticamente la recompensa de <ThemedText style={{ fontFamily: Typography.fontFamily.bold, color: colorPalette.accent }}>🪙{question.reward_tokens} tokens</ThemedText> al docente y cerrará la pregunta permanentemente.
            </ThemedText>
            <ThemedText style={{ fontSize: 13, fontFamily: Typography.fontFamily.semiBold, color: colorPalette.text }}>
              ¿Deseas continuar?
            </ThemedText>
            <View style={{ flexDirection: 'row', gap: Spacing.twelve, marginTop: Spacing.eight }}>
              <Button
                variant="outline"
                title="Cancelar"
                onPress={() => {
                  setConfirmModalVisible(false);
                  setSelectedAnswerId(null);
                }}
                style={{ flex: 1 }}
              />
              <Button
                variant="secondary" // Fucsia fucsia!
                title="Aceptar"
                onPress={confirmAcceptAnswer}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.sixteen,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.sixteen,
    paddingVertical: Spacing.twelve,
    borderBottomWidth: 1,
  },
  backBtn: {
    paddingVertical: Spacing.four,
  },
  backBtnText: {
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 15,
  },
  listContainer: {
    padding: Spacing.sixteen,
    paddingBottom: Spacing.thirtyTwo,
  },
  headerContent: {
    marginBottom: Spacing.sixteen,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.twelve,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.eight,
  },
  categoryTag: {
    paddingHorizontal: Spacing.eight,
    paddingVertical: Spacing.four,
    borderRadius: 6,
  },
  tagText: {
    fontSize: Typography.sizes.caption,
  },
  infoCard: {
    flexDirection: 'row',
    borderRadius: Radius.r16,
    padding: Spacing.sixteen,
    marginBottom: Spacing.sixteen,
    alignItems: 'center',
    borderWidth: 1,
  },
  infoCol: {
    flex: 1,
    alignItems: 'center',
  },
  infoDivider: {
    width: 1.5,
    height: '80%',
  },
  rewardText: {
    fontSize: Typography.sizes.h3,
    marginTop: Spacing.four,
  },
  title: {
    fontSize: Typography.sizes.h2 - 1,
    lineHeight: 26,
    marginBottom: Spacing.four,
  },
  dateLabel: {
    fontSize: Typography.sizes.caption,
    marginBottom: Spacing.sixteen,
  },
  descriptionContainer: {
    marginVertical: Spacing.eight,
  },
  mathBlock: {
    marginVertical: Spacing.eight,
  },
  attachmentContainer: {
    marginTop: Spacing.sixteen,
    marginBottom: Spacing.sixteen,
  },
  attachmentTitle: {
    fontSize: 14,
    marginBottom: Spacing.eight,
  },
  attachmentImage: {
    width: '100%',
    height: 250,
    borderRadius: Radius.r16,
  },
  answersSectionHeader: {
    marginTop: Spacing.twentyFour,
    borderBottomWidth: 1,
    paddingBottom: Spacing.eight,
  },
  answersSectionTitle: {
    fontSize: 16,
  },
  footerPlaceholder: {
    marginTop: Spacing.twentyFour,
    padding: Spacing.sixteen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningBox: {
    borderWidth: 1,
    borderRadius: Radius.r16,
    gap: Spacing.four,
  },
  warningTitle: {
    fontSize: 14,
    color: '#F59E0B',
  },
  emptyAnswersCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.thirtyTwo,
    paddingHorizontal: Spacing.sixteen,
  },
  emptyAnswersEmoji: {
    fontSize: 32,
    marginBottom: Spacing.eight,
  },
  emptyAnswersTitle: {
    fontSize: 14,
    marginBottom: Spacing.four,
  },
  emptyAnswersText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: Spacing.eight,
  },
  errorTitle: {
    fontSize: 18,
    marginBottom: Spacing.four,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: Spacing.sixteen,
  },
  backErrorBtn: {
    paddingHorizontal: Spacing.sixteen,
    paddingVertical: Spacing.twelve,
    borderRadius: Radius.r16,
  },
});
