import React, { useState } from 'react';
import { StyleSheet, ScrollView, Pressable, View, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { MathText } from '@/components/MathText';
import { Question } from '@/types/auth';

export default function AlumnoHomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, signOut } = useAuth();

  // Datos simulados locales del marketplace
  const [myQuestions, setMyQuestions] = useState<Question[]>([
    {
      id: 'q1',
      title: 'Integral definida trigonométrica',
      description: 'Necesito encontrar el valor exacto de la siguiente integral:\n$$ \\int_0^{\\pi} x \\sin(x) dx $$',
      category: 'Cálculo',
      difficulty: 'Intermedia',
      reward_tokens: 25,
      status: 'solved',
      author_id: user?.id || 'me',
      accepted_answer_id: 'ans1',
      created_at: 'Hace 2 horas',
    },
    {
      id: 'q2',
      title: 'Sistema de ecuaciones lineales 3x3',
      description: 'Resuelve por Cramer la matriz:\n$$ \\begin{cases} x + 2y - z = 4 \\\\ 2x - y + z = 3 \\\\ -x + y + 2z = 5 \\end{cases} $$',
      category: 'Álgebra',
      difficulty: 'Básica',
      reward_tokens: 15,
      status: 'open',
      author_id: user?.id || 'me',
      created_at: 'Hace 5 horas',
    }
  ]);

  const mockAnswers = [
    {
      id: 'ans1',
      question_id: 'q1',
      user_id: 'docente-1',
      user_name: 'Dr. Roberto Gómez (Docente)',
      content: 'Aplicamos integración por partes con $u = x$ y $dv = \\sin(x)dx$:\n$$ u = x \\implies du = dx $$\n$$ v = -\\cos(x) $$\n\nPor lo tanto:\n$$ \\int x \\sin(x) dx = -x\\cos(x) + \\int \\cos(x)dx = -x\\cos(x) + \\sin(x) $$\n\nEvaluando en los límites $[0, \\pi]$:\n$$ [-\\pi\\cos(\\pi) + \\sin(\\pi)] - [-0\\cos(0) + \\sin(0)] = \\pi + 0 = \\pi $$',
      votes: 4,
      is_accepted: true,
      created_at: 'Hace 1 hora',
    }
  ];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header Premium */}
        <ThemedView type="backgroundElement" style={styles.header}>
          <View>
            <ThemedText type="small" themeColor="textSecondary">Panel Alumno</ThemedText>
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
          {/* Tarjeta de Economía Marketplace */}
          <View style={styles.walletCard}>
            <View style={styles.walletStat}>
              <ThemedText style={styles.walletLabel}>Mi Billetera</ThemedText>
              <ThemedText style={styles.walletValue}>🪙 {user?.tokens ?? 100} Tokens</ThemedText>
            </View>
            <View style={styles.divider} />
            <View style={styles.walletStat}>
              <ThemedText style={styles.walletLabel}>Reputación</ThemedText>
              <ThemedText style={styles.walletValue}>⭐ {user?.reputation ?? 0} Puntos</ThemedText>
            </View>
          </View>

          {/* Botón de Publicar Acción Rápida */}
          <Pressable
            style={[styles.publishBtn, { shadowColor: '#6366F1' }]}
            onPress={() => router.push('/(app)/alumno/publish' as any)}
          >
            <ThemedText style={styles.publishBtnText}>➕ Publicar Nuevo Ejercicio</ThemedText>
          </Pressable>

          {/* Sección de Ejercicios */}
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Mis Desafíos Publicados</ThemedText>
          </View>

          {myQuestions.map((question) => {
            const answer = question.status === 'solved'
              ? mockAnswers.find(a => a.question_id === question.id)
              : null;

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
                  <View style={[styles.statusBadge, { backgroundColor: question.status === 'solved' ? '#10B98115' : '#F59E0B15' }]}>
                    <ThemedText style={{ color: question.status === 'solved' ? '#10B981' : '#F59E0B', fontSize: 11, fontWeight: 'bold' }}>
                      {question.status === 'solved' ? '✓ Solucionado' : '⚡ Abierto'}
                    </ThemedText>
                  </View>
                </View>

                <ThemedText type="smallBold" style={styles.qTitle}>{question.title}</ThemedText>

                {/* Renderizar Enunciado LaTeX */}
                <MathText text={question.description} style={styles.mathBlock} />

                <View style={styles.qFooter}>
                  <ThemedText type="small" themeColor="textSecondary">{question.created_at}</ThemedText>
                  <ThemedText type="smallBold" style={styles.rewardText}>Recompensa: 🪙 {question.reward_tokens} Tokens</ThemedText>
                </View>

                {/* Si está resuelto, mostrar la solución aceptada */}
                {answer && (
                  <View style={[styles.solutionBox, { borderColor: theme.backgroundSelected }]}>
                    <ThemedText type="smallBold" style={styles.solutionHeader}>
                      💡 Solución Aceptada de {answer.user_name}
                    </ThemedText>
                    <MathText text={answer.content} style={styles.mathBlock} />
                    <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: Spacing.two }}>
                      ⭐ Ganancia transferida al experto • {answer.created_at}
                    </ThemedText>
                  </View>
                )}
              </ThemedView>
            );
          })}
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
    backgroundColor: '#6366F1',
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
  publishBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: Spacing.three,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginTop: Spacing.one,
  },
  publishBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  sectionHeader: {
    marginTop: Spacing.three,
    marginBottom: Spacing.half,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    backgroundColor: '#6366F115',
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6366F1',
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
  statusBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: 6,
  },
  qTitle: {
    fontSize: 16,
    marginTop: Spacing.one,
  },
  mathBlock: {
    marginVertical: Spacing.one,
  },
  qFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.08)',
    paddingTop: Spacing.two,
  },
  rewardText: {
    color: '#6366F1',
    fontSize: 13,
  },
  solutionBox: {
    marginTop: Spacing.three,
    borderWidth: 1.5,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    backgroundColor: '#10B98104',
  },
  solutionHeader: {
    color: '#10B981',
    fontSize: 13,
    marginBottom: Spacing.one,
  },
});
