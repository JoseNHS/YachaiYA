import React, { useState } from 'react';
import { StyleSheet, TextInput, Pressable, View, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function PublishQuestionScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Cálculo');
  const [difficulty, setDifficulty] = useState<'Básica' | 'Intermedia' | 'Avanzada' | 'Olimpiada'>('Intermedia');
  const [rewardTokens, setRewardTokens] = useState('20');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categories = ['Álgebra', 'Cálculo', 'Geometría', 'Estadística', 'Física Matemática'];
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
      // Simular guardado exitoso
      setTimeout(() => {
        // En una app real, realizaríamos supabase.from('questions').insert(...)
        // lo cual dispararía el trigger de escrow.

        // Simular descuento del balance de usuario (en demo)
        if (user) {
          user.tokens -= tokensAmount;
        }

        setLoading(false);
        router.back();
      }, 1500);
    } catch (e) {
      setErrorMsg('Ocurrió un error al intentar publicar tu ejercicio.');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <ThemedView type="backgroundElement" style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <ThemedText style={styles.backText}>✕ Cancelar</ThemedText>
            </Pressable>
            <ThemedText type="smallBold" style={styles.headerTitle}>Publicar Ejercicio</ThemedText>
            <View style={{ width: 60 }} />
          </ThemedView>

          <ScrollView
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
          >
            {errorMsg && (
              <View style={styles.errorBox}>
                <ThemedText style={styles.errorText}>⚠️ {errorMsg}</ThemedText>
              </View>
            )}

            <View style={styles.inputGroup}>
              <ThemedText type="smallBold" style={styles.label}>Título del Ejercicio</ThemedText>
              <TextInput
                style={[styles.input, {
                  backgroundColor: theme.backgroundElement,
                  color: theme.text,
                  borderColor: theme.backgroundSelected
                }]}
                placeholder="Ej. Derivada de función compuesta exponencial"
                placeholderTextColor={theme.textSecondary}
                value={title}
                onChangeText={setTitle}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelWithHint}>
                <ThemedText type="smallBold" style={styles.label}>Enunciado / Pregunta</ThemedText>
                <ThemedText type="code" style={styles.hint}>Soporta fórmulas LaTeX usando $$</ThemedText>
              </View>
              <TextInput
                style={[styles.textArea, {
                  backgroundColor: theme.backgroundElement,
                  color: theme.text,
                  borderColor: theme.backgroundSelected
                }]}
                placeholder="Escribe el problema aquí. Ej:\nEncuentra el límite:\n$$ \lim_{x \to 0} \frac{\sin(x)}{x} $$"
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={6}
                value={description}
                onChangeText={setDescription}
                editable={!loading}
              />
            </View>

            {/* Categorías */}
            <View style={styles.inputGroup}>
              <ThemedText type="smallBold" style={styles.label}>Categoría</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgeRow}>
                {categories.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <Pressable
                      key={cat}
                      style={[
                        styles.badgeOption,
                        {
                          backgroundColor: isSelected ? '#6366F1' : theme.backgroundElement,
                          borderColor: isSelected ? '#6366F1' : theme.backgroundSelected
                        }
                      ]}
                      onPress={() => setCategory(cat)}
                      disabled={loading}
                    >
                      <ThemedText style={{ color: isSelected ? '#ffffff' : theme.text, fontSize: 13, fontWeight: 'bold' }}>
                        {cat}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Dificultad */}
            <View style={styles.inputGroup}>
              <ThemedText type="smallBold" style={styles.label}>Dificultad</ThemedText>
              <View style={styles.difficultyGrid}>
                {difficulties.map((diff) => {
                  const isSelected = difficulty === diff;
                  return (
                    <Pressable
                      key={diff}
                      style={[
                        styles.diffOption,
                        {
                          backgroundColor: isSelected ? '#3B82F6' : theme.backgroundElement,
                          borderColor: isSelected ? '#3B82F6' : theme.backgroundSelected
                        }
                      ]}
                      onPress={() => setDifficulty(diff)}
                      disabled={loading}
                    >
                      <ThemedText style={{ color: isSelected ? '#ffffff' : theme.text, fontSize: 13, fontWeight: 'bold' }}>
                        {diff}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Tokens de Recompensa */}
            <View style={styles.inputGroup}>
              <ThemedText type="smallBold" style={styles.label}>Recompensa (Tokens 🪙)</ThemedText>
              <View style={styles.tokensInputContainer}>
                <TextInput
                  style={[styles.input, styles.tokenInput, {
                    backgroundColor: theme.backgroundElement,
                    color: theme.text,
                    borderColor: theme.backgroundSelected
                  }]}
                  keyboardType="numeric"
                  value={rewardTokens}
                  onChangeText={setRewardTokens}
                  editable={!loading}
                />
                <ThemedText type="small" themeColor="textSecondary" style={{ flex: 1, marginLeft: Spacing.three }}>
                  Los tokens serán retenidos de tu saldo (🪙 {user?.tokens ?? 100} actuales) hasta que aceptes la solución de un experto.
                </ThemedText>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.publishBtn,
                { opacity: pressed || loading ? 0.9 : 1 }
              ]}
              onPress={handlePublish}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <ThemedText style={styles.publishBtnText}>Confirmar y Retener Tokens</ThemedText>
              )}
            </Pressable>

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
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    borderBottomWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.1)',
  },
  backBtn: {
    paddingVertical: Spacing.one,
  },
  backText: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentContainer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  errorBox: {
    backgroundColor: '#EF444415',
    padding: Spacing.three,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: '#EF444430',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  inputGroup: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 13,
  },
  labelWithHint: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hint: {
    fontSize: 9,
    color: '#3B82F6',
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.four,
    fontSize: 15,
  },
  textArea: {
    borderWidth: 1.5,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    fontSize: 15,
    textAlignVertical: 'top',
    height: 120,
  },
  badgeRow: {
    gap: Spacing.two,
    paddingBottom: 2,
  },
  badgeOption: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  difficultyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  diffOption: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1.5,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  tokensInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenInput: {
    width: 80,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  publishBtn: {
    backgroundColor: '#6366F1',
    height: 48,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.three,
  },
  publishBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
