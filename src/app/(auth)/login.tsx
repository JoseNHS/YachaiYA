import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Typography, Colors } from '@/constants/theme';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function LoginScreen() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

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
        router.replace(`/(app)/${user.role}/home` as any);
      } else {
        router.replace('/' as any);
      }
    } catch (e) {
      console.error('Error al iniciar sesión:', e);
      setErrorMsg('Ocurrió un error inesperado durante el inicio de sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colorPalette.background }}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colorPalette.background }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <ThemedText
            style={[
              styles.logo,
              {
                fontFamily: Typography.fontFamily.bold,
                color: colorPalette.primary, // Celeste logo!
              }
            ]}
          >
            YachaiYa
          </ThemedText>
          <ThemedText
            style={[
              styles.title,
              {
                fontFamily: Typography.fontFamily.semiBold,
                color: colorPalette.text,
              }
            ]}
          >
            ¡Bienvenido!
          </ThemedText>
          <ThemedText
            style={[
              styles.subtitle,
              {
                fontFamily: Typography.fontFamily.regular,
                color: colorPalette.textSecondary,
              }
            ]}
          >
            Inicia sesión para continuar en el marketplace.
          </ThemedText>
        </View>

        <Card style={styles.formContainer}>
          {errorMsg && (
            <View style={styles.errorBox}>
              <ThemedText style={styles.errorText}>⚠️ {errorMsg}</ThemedText>
            </View>
          )}

          <Input
            label="Correo Electrónico"
            placeholder="correo@ejemplo.com"
            type="email"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />

          <Input
            label="Contraseña"
            placeholder="••••••••"
            type="password"
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />

          <Button
            variant="primary"
            title="Iniciar sesión"
            onPress={handleLogin}
            loading={loading}
            style={styles.submitButton}
          />

          <Button
            variant="ghost"
            title="¿No tienes cuenta? Regístrate aquí"
            onPress={() => router.push('/(auth)/register' as any)}
            disabled={loading}
            style={styles.registerLink}
          />
        </Card>

        {isDemoMode && (
          <Card style={styles.demoBanner}>
            <ThemedText
              style={[
                styles.demoTitle,
                {
                  fontFamily: Typography.fontFamily.semiBold,
                  color: colorPalette.accent, // fucsia emphasis
                }
              ]}
            >
              💡 Modo Demo Activo (Prueba de Roles)
            </ThemedText>
            <ThemedText
              style={[
                styles.demoText,
                {
                  fontFamily: Typography.fontFamily.regular,
                  color: colorPalette.textSecondary,
                }
              ]}
            >
              Para validar la navegación segura e independiente por perfiles, inicia sesión con:
            </ThemedText>
            <ThemedText
              style={[
                styles.demoDetails,
                {
                  fontFamily: Typography.fontFamily.regular,
                  color: colorPalette.textSecondary,
                }
              ]}
            >
              • alumno@yachaiya.com ➜ Panel Alumno{'\n'}
              • docente@yachaiya.com ➜ Panel Docente{'\n'}
              • admin@yachaiya.com ➜ Panel Admin (Moderación)
            </ThemedText>
          </Card>
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
    paddingHorizontal: Spacing.twentyFour,
    paddingVertical: Spacing.thirtyTwo,
    gap: Spacing.twentyFour,
  },
  headerSection: {
    alignItems: 'center',
    gap: Spacing.four,
  },
  logo: {
    fontSize: Typography.sizes.display,
    marginBottom: Spacing.eight,
  },
  title: {
    fontSize: Typography.sizes.h1,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: Typography.sizes.body,
    lineHeight: 20,
  },
  formContainer: {
    padding: Spacing.twenty,
    gap: Spacing.four,
    borderWidth: 1,
  },
  errorBox: {
    backgroundColor: '#EF444415',
    padding: Spacing.twelve,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF444430',
    marginBottom: Spacing.eight,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: Spacing.eight,
    height: 48,
  },
  registerLink: {
    marginTop: Spacing.four,
  },
  demoBanner: {
    padding: Spacing.sixteen,
    borderWidth: 1,
  },
  demoTitle: {
    fontSize: Typography.sizes.caption + 1,
    marginBottom: Spacing.eight,
  },
  demoText: {
    fontSize: Typography.sizes.caption,
    lineHeight: 16,
  },
  demoDetails: {
    fontSize: Typography.sizes.caption,
    marginTop: Spacing.eight,
    lineHeight: 18,
  },
});
