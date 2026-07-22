import React, { useState, useEffect } from 'react';
import { StyleSheet, Pressable, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Typography, Colors } from '@/constants/theme';
import { questionService } from '@/services/questionService';
import { Category } from '@/types/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function PublishQuestionScreen() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<'Básica' | 'Intermedia' | 'Avanzada' | 'Olimpiada'>('Intermedia');
  const [rewardTokens, setRewardTokens] = useState('20');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchCategories = async () => {
      try {
        const cats = await questionService.getCategories();
        if (active) {
          setCategoriesList(cats);
          const defaultCat = cats.find(c => c.slug === 'calculo') || cats[0];
          if (defaultCat) {
            setSelectedCategoryId(defaultCat.id);
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
    return () => {
      active = false;
    };
  }, []);

  const difficulties: ('Básica' | 'Intermedia' | 'Avanzada' | 'Olimpiada')[] = ['Básica', 'Intermedia', 'Avanzada', 'Olimpiada'];

  const handlePublish = async () => {
    if (!title || !description) {
      setErrorMsg('Por favor completa el título y el enunciado del ejercicio.');
      return;
    }

    const tokensAmount = parseInt(rewardTokens, 10);
    if (isNaN(tokensAmount) || tokensAmount <= 0) {
      setErrorMsg('Por favor ingresa un monto válido de tokens.');
      return;
    }

    const currentTokens = user?.tokens ?? 100;
    if (tokensAmount > currentTokens) {
      setErrorMsg(`Saldo insuficiente de tokens. Quieres ofrecer ${tokensAmount} tokens pero tu balance es de ${currentTokens}.`);
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      if (!user) throw new Error('Usuario no identificado.');
      if (!selectedCategoryId) throw new Error('Debe seleccionar una categoría.');

      await questionService.createQuestion(
        title,
        description,
        selectedCategoryId,
        difficulty,
        tokensAmount,
        user.id,
        []
      );

      setLoading(false);
      router.back();
    } catch (e: any) {
      setErrorMsg(e.message || 'Ocurrió un error al intentar publicar tu ejercicio.');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colorPalette.background }}
    >
      <ThemedView style={[styles.container, { backgroundColor: colorPalette.background }]}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colorPalette.backgroundElement, borderBottomColor: colorPalette.border }]}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <ThemedText style={[styles.backText, { fontFamily: Typography.fontFamily.semiBold }]}>✕ Cancelar</ThemedText>
            </Pressable>
            <ThemedText style={[styles.headerTitle, { fontFamily: Typography.fontFamily.semiBold, color: colorPalette.text }]}>
              Publicar Ejercicio
            </ThemedText>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {errorMsg && (
              <View style={styles.errorBox}>
                <ThemedText style={styles.errorText}>⚠️ {errorMsg}</ThemedText>
              </View>
            )}

            <Card style={styles.formCard}>
              <Input
                label="Título del Ejercicio"
                placeholder="Ej. Derivada de función compuesta exponencial"
                value={title}
                onChangeText={setTitle}
                editable={!loading}
              />

              <Input
                label="Enunciado / Pregunta (Soporta LaTeX $$)"
                placeholder="Escribe el problema matemático aquí detallando los pasos..."
                type="textarea"
                value={description}
                onChangeText={setDescription}
                editable={!loading}
              />

              {/* Categorías */}
              <View style={styles.inputGroup}>
                <ThemedText
                  style={[
                    styles.label,
                    {
                      fontFamily: Typography.fontFamily.medium,
                      color: colorPalette.textSecondary,
                      marginBottom: Spacing.eight,
                    }
                  ]}
                >
                  Categoría
                </ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgeRow}>
                  {categoriesList.map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    const activeBg = isSelected ? 'rgba(108, 198, 255, 0.08)' : colorPalette.backgroundElement;
                    const borderClr = isSelected ? colorPalette.primary : colorPalette.border;
                    const textClr = isSelected ? colorPalette.primary : colorPalette.text;

                    return (
                      <Pressable
                        key={cat.id}
                        style={[
                          styles.badgeOption,
                          {
                            backgroundColor: activeBg,
                            borderColor: borderClr
                          }
                        ]}
                        onPress={() => setSelectedCategoryId(cat.id)}
                        disabled={loading}
                      >
                        <ThemedText
                          style={{
                            color: textClr,
                            fontSize: 13,
                            fontFamily: Typography.fontFamily.semiBold
                          }}
                        >
                          {cat.name}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Dificultad */}
              <View style={styles.inputGroup}>
                <ThemedText
                  style={[
                    styles.label,
                    {
                      fontFamily: Typography.fontFamily.medium,
                      color: colorPalette.textSecondary,
                      marginBottom: Spacing.eight,
                    }
                  ]}
                >
                  Dificultad
                </ThemedText>
                <View style={styles.difficultyGrid}>
                  {difficulties.map((diff) => {
                    const isSelected = difficulty === diff;
                    const activeBg = isSelected ? 'rgba(255, 20, 147, 0.08)' : colorPalette.backgroundElement;
                    const borderClr = isSelected ? colorPalette.accent : colorPalette.border;
                    const textClr = isSelected ? colorPalette.accent : colorPalette.text;

                    return (
                      <Pressable
                        key={diff}
                        style={[
                          styles.diffOption,
                          {
                            backgroundColor: activeBg,
                            borderColor: borderClr
                          }
                        ]}
                        onPress={() => setDifficulty(diff)}
                        disabled={loading}
                      >
                        <ThemedText
                          style={{
                            color: textClr,
                            fontSize: 13,
                            fontFamily: Typography.fontFamily.semiBold
                          }}
                        >
                          {diff}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Tokens de Recompensa */}
              <View style={styles.inputGroup}>
                <Input
                  label="Recompensa (Tokens 🪙)"
                  type="tokens"
                  value={rewardTokens}
                  onChangeText={setRewardTokens}
                  editable={!loading}
                />
                <ThemedText
                  style={[
                    styles.escrowHint,
                    {
                      fontFamily: Typography.fontFamily.regular,
                      color: colorPalette.textSecondary,
                    }
                  ]}
                >
                  Los tokens serán retenidos de tu saldo (🪙 {user?.tokens ?? 100} actuales) hasta que aceptes la solución de un experto.
                </ThemedText>
              </View>

              <Button
                variant="secondary" // Fucsia fucsia fucsia!
                title="Confirmar y Retener Tokens"
                onPress={handlePublish}
                loading={loading}
                style={styles.publishBtn}
              />
            </Card>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    </KeyboardAvoidingView>
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
    paddingHorizontal: Spacing.sixteen,
    paddingVertical: Spacing.twelve,
    borderBottomWidth: 1,
  },
  backBtn: {
    paddingVertical: Spacing.four,
  },
  backText: {
    color: '#EF4444',
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 16,
  },
  contentContainer: {
    padding: Spacing.sixteen,
    paddingBottom: Spacing.thirtyTwo,
    gap: Spacing.sixteen,
  },
  errorBox: {
    backgroundColor: '#EF444415',
    padding: Spacing.twelve,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF444430',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  formCard: {
    padding: Spacing.twenty,
    borderWidth: 1,
    gap: Spacing.sixteen,
  },
  inputGroup: {
    width: '100%',
  },
  label: {
    fontSize: Typography.sizes.caption,
  },
  badgeRow: {
    gap: Spacing.eight,
    paddingBottom: 4,
  },
  badgeOption: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: Spacing.sixteen,
    paddingVertical: Spacing.eight,
  },
  difficultyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.eight,
  },
  diffOption: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1.5,
    borderRadius: Radius.r16,
    paddingVertical: Spacing.twelve,
    alignItems: 'center',
  },
  escrowHint: {
    fontSize: Typography.sizes.caption - 1,
    lineHeight: 14,
    marginTop: -Spacing.eight,
    marginBottom: Spacing.eight,
  },
  publishBtn: {
    height: 48,
    marginTop: Spacing.eight,
  },
});
