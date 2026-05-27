import React, { useState } from 'react';
import { StyleSheet, TextInput, Pressable, View, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function LoginScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { signInWithEmail, isDemoMode } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    try {
      const { error, user } = await signInWithEmail(email, password);
      if (error) {
        setErrorMsg(typeof error === 'string' ? error : 'Credenciales inválidas. Verifica tu correo y contraseña.');
      } else if (user) {
        // Redirigir al home específico del rol de manera independiente y segura
        router.replace(`/(app)/${user.role}/home` as any);
      } else {
        router.replace('/' as any);
      }
    } catch (e) {
      setErrorMsg('Ocurrió un error inesperado durante el inicio de sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerSection}>
          <ThemedText style={styles.logo}>✨ YachaiYa</ThemedText>
          <ThemedText type="title" style={styles.title}>Iniciar Sesión</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Marketplace de resolución de ejercicios matemáticos
          </ThemedText>
        </View>

        <ThemedView type="backgroundElement" style={styles.formContainer}>
          {errorMsg && (
            <View style={styles.errorBox}>
              <ThemedText style={styles.errorText}>⚠️ {errorMsg}</ThemedText>
            </View>
          )}

          <View style={styles.inputGroup}>
            <ThemedText type="smallBold" style={styles.label}>Correo Electrónico</ThemedText>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.backgroundSelected
              }]}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="smallBold" style={styles.label}>Contraseña</ThemedText>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.backgroundSelected
              }]}
              placeholder="••••••••"
              placeholderTextColor={theme.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              { opacity: pressed || loading ? 0.9 : 1 }
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <ThemedText style={styles.submitButtonText}>Entrar</ThemedText>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.push('/(auth)/register' as any)}
            style={styles.registerLink}
            disabled={loading}
          >
            <ThemedText type="small" themeColor="textSecondary">
              ¿No tienes cuenta? <ThemedText type="linkPrimary">Regístrate aquí</ThemedText>
            </ThemedText>
          </Pressable>
        </ThemedView>

        {isDemoMode && (
          <ThemedView type="backgroundElement" style={styles.demoBanner}>
            <ThemedText type="smallBold" style={{ color: '#F59E0B', marginBottom: Spacing.half }}>
              💡 Modo Demo Activo (Prueba de Roles)
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Para validar la navegación segura e independiente por perfiles, inicia sesión con:
            </ThemedText>
            <ThemedText type="code" style={styles.demoDetails}>
              • alumno@yachaiya.com ➜ Panel Alumno{'\n'}
              • docente@yachaiya.com ➜ Panel Docente{'\n'}
              • admin@yachaiya.com ➜ Panel Admin (Moderación)
            </ThemedText>
          </ThemedView>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.six,
    gap: Spacing.five,
  },
  headerSection: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 13,
  },
  formContainer: {
    padding: Spacing.five,
    borderRadius: Spacing.four,
    gap: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.1)',
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
  input: {
    height: 48,
    borderWidth: 1.5,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.four,
    fontSize: 15,
  },
  submitButton: {
    backgroundColor: '#6366F1',
    height: 48,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  registerLink: {
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  demoBanner: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1.5,
    borderColor: '#F59E0B30',
    backgroundColor: '#F59E0B08',
  },
  demoDetails: {
    fontSize: 11,
    marginTop: Spacing.one,
    lineHeight: 16,
  },
});
