import React, { useState } from 'react';
import { StyleSheet, Pressable, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Typography, Colors } from '@/constants/theme';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function RegisterScreen() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  const { signUpWithEmail } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'alumno' | 'docente'>('alumno');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    try {
      const { error } = await signUpWithEmail(email, password, fullName, role as UserRole);
      if (error) {
        setErrorMsg(typeof error === 'string' ? error : 'Error al registrar. Intenta con otro correo.');
      } else {
        router.replace(`/(app)/${role}/home` as any);
      }
    } catch (e) {
      console.error('Error al registrar usuario:', e);
      setErrorMsg('Ocurrió un error inesperado al registrar el usuario.');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions: { value: 'alumno' | 'docente'; label: string; emoji: string; desc: string; activeColor: string }[] = [
    { value: 'alumno', label: 'Alumno', emoji: '🎒', desc: 'Publica ejercicios matemáticos ofreciendo tokens de recompensa.', activeColor: colorPalette.primary },
    { value: 'docente', label: 'Docente / Experto', emoji: '🎓', desc: 'Resuelve problemas complejos y gana tokens y reputación.', activeColor: colorPalette.accent },
  ];

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
                color: colorPalette.primary,
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
            Crear Cuenta
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
            Únete a la red de colaboración matemática.
          </ThemedText>
        </View>

        <Card style={styles.formContainer}>
          {errorMsg && (
            <View style={styles.errorBox}>
              <ThemedText style={styles.errorText}>⚠️ {errorMsg}</ThemedText>
            </View>
          )}

          <Input
            label="Nombre Completo"
            placeholder="Ej. Juan Pérez"
            value={fullName}
            onChangeText={setFullName}
            editable={!loading}
          />

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
            placeholder="Mínimo 6 caracteres"
            type="password"
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />

          {/* Selector de Roles de Negocio */}
          <View style={styles.roleGroup}>
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
              Selecciona tu Perfil
            </ThemedText>
            <View style={styles.roleGrid}>
              {roleOptions.map((option) => {
                const isSelected = role === option.value;
                const activeBg = isSelected ? (option.value === 'alumno' ? 'rgba(108, 198, 255, 0.08)' : 'rgba(255, 20, 147, 0.08)') : colorPalette.backgroundElement;
                const borderClr = isSelected ? option.activeColor : colorPalette.border;

                return (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.roleButton,
                      {
                        backgroundColor: activeBg,
                        borderColor: borderClr
                      }
                    ]}
                    onPress={() => setRole(option.value)}
                    disabled={loading}
                  >
                    <ThemedText style={styles.roleEmoji}>{option.emoji}</ThemedText>
                    <View style={{ flex: 1 }}>
                      <ThemedText
                        style={[
                          styles.roleLabel,
                          {
                            fontFamily: Typography.fontFamily.semiBold,
                            color: isSelected ? option.activeColor : colorPalette.text,
                          }
                        ]}
                      >
                        {option.label}
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.roleDesc,
                          {
                            fontFamily: Typography.fontFamily.regular,
                            color: colorPalette.textSecondary,
                          }
                        ]}
                      >
                        {option.desc}
                      </ThemedText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Button
            variant="primary"
            title="Registrarme"
            onPress={handleRegister}
            loading={loading}
            style={styles.submitButton}
          />

          <Button
            variant="ghost"
            title="¿Ya tienes cuenta? Inicia sesión"
            onPress={() => router.push('/(auth)/login' as any)}
            disabled={loading}
            style={styles.registerLink}
          />
        </Card>
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
  label: {
    fontSize: Typography.sizes.caption,
  },
  roleGroup: {
    marginBottom: Spacing.twelve,
  },
  roleGrid: {
    flexDirection: 'column',
    gap: Spacing.twelve,
  },
  roleButton: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: Spacing.sixteen,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.twelve,
  },
  roleEmoji: {
    fontSize: 24,
    marginRight: Spacing.four,
  },
  roleLabel: {
    fontSize: Typography.sizes.body + 1,
    marginBottom: 2,
  },
  roleDesc: {
    fontSize: Typography.sizes.caption,
    lineHeight: 14,
  },
  submitButton: {
    marginTop: Spacing.eight,
    height: 48,
  },
  registerLink: {
    marginTop: Spacing.four,
  },
});
