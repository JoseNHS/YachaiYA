import React, { useState } from 'react';
import { StyleSheet, ScrollView, Pressable, View, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { MathText } from '@/components/MathText';
import { Question, Answer } from '@/types/auth';

export default function DocenteHomeScreen() {
  const theme = useTheme();
  const { user, signOut } = useAuth();

  // Ejercicios disponibles en el marketplace
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'q2',
      title: 'Sistema de ecuaciones lineales 3x3',
      description: 'Resuelve por Cramer el siguiente sistema:\n$$ \\begin{cases} x + 2y - z = 4 \\\\ 2x - y + z = 3 \\\\ -x + y + 2z = 5 \\end{cases} $$',
      category: 'Álgebra',
      difficulty: 'Básica',
      reward_tokens: 15,
      status: 'open',
      author_id: 'alumno-1',
      created_at: 'Hace 5 horas',
    },
    {
      id: 'q3',
      title: 'Derivada implícita de curva elíptica',
      description: 'Encuentra $dy/dx$ para la curva definida por:\n$$ y^2 = x^3 + a x + b $$',
      category: 'Cálculo',
      difficulty: 'Avanzada',
      reward_tokens: 35,
      status: 'open',
      author_id: 'alumno-2',
      created_at: 'Hace 1 día',
    }
  ]);

  // Respuestas escritas por el docente logueado
  const [myAnswers, setMyAnswers] = useState<Answer[]>([
    {
      id: 'ans-10',
      question_id: 'q1',
      user_id: user?.id || 'docente-me',
      content: 'La solución de la integral es $\\pi$ aplicando integración por partes.',
      votes: 3,
      is_accepted: true,
      created_at: 'Hace 1 día',
    }
  ]);

  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [solutionText, setSolutionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmitSolution = (question: Question) => {
    if (!solutionText) return;
    setSubmitting(true);

    setTimeout(() => {
      const newAnswer: Answer = {
        id: 'ans-' + Math.random().toString(36).substr(2, 9),
        question_id: question.id,
        user_id: user?.id || 'docente-me',
        content: solutionText,
        votes: 0,
        is_accepted: false,
        created_at: 'Recién publicado',
      };

      setMyAnswers([newAnswer, ...myAnswers]);

      // Simular que el alumno acepta automáticamente la respuesta de prueba en 4 segundos
      // para mostrar la billetera de tokens y reputación subiendo automáticamente!
      // ¡Esto hará que la experiencia se sienta mágica!
      setTimeout(() => {
        newAnswer.is_accepted = true;

        // Simular abonos de tokens y reputación en Demo Mode
        if (user) {
          user.tokens += question.reward_tokens;
          user.reputation += 10;
        }

        // Marcar la pregunta como resuelta localmente
        setQuestions(prev => prev.filter(q => q.id !== question.id));

        setSuccessMsg(`🎉 ¡Tu respuesta para "${question.title}" fue aceptada! Has ganado 🪙 ${question.reward_tokens} tokens y +10 de reputación.`);
        setTimeout(() => setSuccessMsg(null), 6000);
      }, 4000);

      setSolutionText('');
      setSelectedQuestionId(null);
      setSubmitting(false);
    }, 1500);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header Premium */}
        <ThemedView type="backgroundElement" style={styles.header}>
          <View>
            <ThemedText type="small" themeColor="textSecondary">Panel Experto / Docente</ThemedText>
            <ThemedText type="smallBold" style={styles.profileName}>{user?.full_name}</ThemedText>
          </View>
          <Pressable style={styles.logoutBtn} onPress={signOut}>
            <ThemedText style={styles.logoutText}>Salir</ThemedText>
          </Pressable>
        </ThemedView>

        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Tarjeta de Ganancias y Reputación */}
          <View style={styles.walletCard}>
            <View style={styles.walletStat}>
              <ThemedText style={styles.walletLabel}>Ganancias Acumuladas</ThemedText>
              <ThemedText style={styles.walletValue}>🪙 {user?.tokens ?? 0} Tokens</ThemedText>
            </View>
            <View style={styles.divider} />
            <View style={styles.walletStat}>
              <ThemedText style={styles.walletLabel}>Reputación Experta</ThemedText>
              <ThemedText style={styles.walletValue}>⭐ {user?.reputation ?? 45} Puntos</ThemedText>
            </View>
          </View>

          {successMsg && (
            <View style={styles.successBanner}>
              <ThemedText style={styles.successBannerText}>{successMsg}</ThemedText>
            </View>
          )}

          {/* Muro de Ejercicios */}
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Muro de Ejercicios Disponibles</ThemedText>
          </View>

          {questions.length === 0 ? (
            <ThemedView type="backgroundElement" style={styles.emptyCard}>
              <ThemedText type="small" themeColor="textSecondary">No hay más ejercicios matemáticos abiertos en este momento.</ThemedText>
            </ThemedView>
          ) : (
            questions.map((question) => {
              const isSelected = selectedQuestionId === question.id;

              return (
                <ThemedView key={question.id} type="backgroundElement" style={styles.questionCard}>
                  <View style={styles.qHeader}>
                    <View style={styles.tagContainer}>
                      <View style={styles.categoryTag}>
                        <ThemedText style={styles.tagText}>{question.category}</ThemedText>
                      </View>
                      <View style={[styles.difficultyTag, { borderColor: theme.backgroundSelected }]}>
                        <ThemedText style={styles.difficultyText}>{question.difficulty}</ThemedText>
                      </View>
                    </View>
                    <ThemedText type="smallBold" style={styles.rewardText}>🪙 {question.reward_tokens} Tokens</ThemedText>
                  </View>

                  <ThemedText type="smallBold" style={styles.qTitle}>{question.title}</ThemedText>

                  {/* Renderizar Enunciado LaTeX */}
                  <MathText text={question.description} style={styles.mathBlock} />

                  <View style={styles.qActions}>
                    <ThemedText type="small" themeColor="textSecondary">{question.created_at}</ThemedText>
                    <Pressable
                      style={[styles.resolveBtn, { backgroundColor: isSelected ? '#EF4444' : '#3B82F6' }]}
                      onPress={() => {
                        setSelectedQuestionId(isSelected ? null : question.id);
                        setSolutionText('');
                      }}
                      disabled={submitting}
                    >
                      <ThemedText style={styles.resolveBtnText}>{isSelected ? 'Cerrar' : 'Resolver Ejercicio'}</ThemedText>
                    </Pressable>
                  </View>

                  {/* Formulario de Respuesta LaTeX */}
                  {isSelected && (
                    <View style={[styles.answerForm, { borderColor: theme.backgroundSelected }]}>
                      <View style={styles.formHeader}>
                        <ThemedText type="smallBold">Redactar Solución Matemática</ThemedText>
                        <ThemedText type="code" style={styles.latexHint}>LaTeX soportado</ThemedText>
                      </View>
                      <TextInput
                        style={[styles.textArea, {
                          backgroundColor: theme.background,
                          color: theme.text,
                          borderColor: theme.backgroundSelected
                        }]}
                        placeholder="Ej:\nPor la regla de derivación implícita:\n$$ 2y \\frac{dy}{dx} = 3x^2 + a $$"
                        placeholderTextColor={theme.textSecondary}
                        multiline
                        numberOfLines={5}
                        value={solutionText}
                        onChangeText={setSolutionText}
                        editable={!submitting}
                      />
                      <Pressable
                        style={styles.submitAnswerBtn}
                        onPress={() => handleSubmitSolution(question)}
                        disabled={submitting || !solutionText}
                      >
                        {submitting ? (
                          <ActivityIndicator color="#ffffff" size="small" />
                        ) : (
                          <ThemedText style={styles.submitAnswerBtnText}>Enviar Solución</ThemedText>
                        )}
                      </Pressable>
                    </View>
                  )}
                </ThemedView>
              );
            })
          )}

          {/* Historial de Respuestas */}
          <View style={[styles.sectionHeader, { marginTop: Spacing.four }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Mi Historial de Soluciones</ThemedText>
          </View>

          {myAnswers.map((ans) => (
            <ThemedView key={ans.id} type="backgroundElement" style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View style={[styles.statusBadge, { backgroundColor: ans.is_accepted ? '#10B98115' : '#F59E0B15' }]}>
                  <ThemedText style={{ color: ans.is_accepted ? '#10B981' : '#F59E0B', fontSize: 10, fontWeight: 'bold' }}>
                    {ans.is_accepted ? 'Aceptada' : 'Pendiente'}
                  </ThemedText>
                </View>
                <ThemedText type="small" themeColor="textSecondary">{ans.created_at}</ThemedText>
              </View>
              <MathText text={ans.content} style={styles.mathBlock} />
              {ans.is_accepted && (
                <ThemedText type="small" style={{ color: '#10B981', fontWeight: 'bold', marginTop: Spacing.one }}>
                  ✓ Recompensa cobrada y reputación añadida
                </ThemedText>
              )}
            </ThemedView>
          ))}

        </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    borderBottomWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.1)',
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  contentContainer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  walletCard: {
    backgroundColor: '#3B82F6',
    borderRadius: Spacing.four,
    padding: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 6,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  walletStat: {
    flex: 1,
    alignItems: 'center',
  },
  walletLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: Spacing.one,
  },
  walletValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    height: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  successBanner: {
    backgroundColor: '#10B98115',
    borderColor: '#10B98140',
    borderWidth: 1.5,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    marginTop: Spacing.one,
  },
  successBannerText: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 13,
    lineHeight: 18,
  },
  sectionHeader: {
    marginTop: Spacing.two,
    marginBottom: Spacing.half,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyCard: {
    padding: Spacing.five,
    borderRadius: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.1)',
  },
  questionCard: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.1)',
    gap: Spacing.two,
  },
  qHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagContainer: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  categoryTag: {
    backgroundColor: '#3B82F615',
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  difficultyTag: {
    borderWidth: 1,
    paddingHorizontal: Spacing.two,
    paddingVertical: 1,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  rewardText: {
    color: '#3B82F6',
    fontWeight: 'bold',
    fontSize: 14,
  },
  qTitle: {
    fontSize: 16,
    marginTop: Spacing.one,
  },
  mathBlock: {
    marginVertical: Spacing.one,
  },
  qActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.one,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.08)',
    paddingTop: Spacing.two,
  },
  resolveBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  resolveBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  answerForm: {
    marginTop: Spacing.three,
    borderWidth: 1.5,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  latexHint: {
    fontSize: 9,
    color: '#3B82F6',
  },
  textArea: {
    borderWidth: 1.5,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
    height: 100,
    textAlignVertical: 'top',
  },
  submitAnswerBtn: {
    backgroundColor: '#3B82F6',
    height: 40,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitAnswerBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  historyCard: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.1)',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  statusBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: 6,
  },
});
