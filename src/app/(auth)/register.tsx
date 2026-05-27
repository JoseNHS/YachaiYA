import React, { useState } from 'react';
import { StyleSheet, TextInput, Pressable, View, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function RegisterScreen() {
  const router = useRouter();
  const theme = useTheme();
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
      // Registrar al usuario con el rol seguro (solo alumno o docente en el frontend)
      const { error } = await signUpWithEmail(email, password, fullName, role as UserRole);
      if (error) {
        setErrorMsg(typeof error === 'string' ? error : 'Error al registrar. Intenta con otro correo.');
      } else {
        // Redirigir al layout del rol correspondiente
        router.replace(`/(app)/${role}/home` as any);
      }
    } catch (e) {
      setErrorMsg('Ocurrió un error inesperado al registrar el usuario.');
    } finally {
      setLoading(false);
    }
  };

  // Solo se permiten registros públicos para Alumno y Docente. El rol Admin se asigna manualmente en Supabase.
  const roleOptions: { value: 'alumno' | 'docente'; label: string; emoji: string; desc: string; activeColor: string }[] = [
    { value: 'alumno', label: 'Alumno', emoji: '🎒', desc: 'Publica ejercicios matemáticos ofreciendo tokens de recompensa.', activeColor: '#6366F1' },
    { value: 'docente', label: 'Docente / Experto', emoji: '🎓', desc: 'Resuelve problemas complejos y gana tokens y reputación.', activeColor: '#3B82F6' },
  ];

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
          <ThemedText type="title" style={styles.title}>Crear Cuenta</ThemedText>
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
            <ThemedText type="smallBold" style={styles.label}>Nombre Completo</ThemedText>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.backgroundSelected
              }]}
              placeholder="Ej. Juan Pérez"
              placeholderTextColor={theme.textSecondary}
              value={fullName}
              onChangeText={setFullName}
              editable={!loading}
            />
          </View>

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
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={theme.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          {/* Selector de Roles de Negocio */}
          <View style={styles.roleGroup}>
            <ThemedText type="smallBold" style={styles.label}>Selecciona tu Perfil</ThemedText>
            <View style={styles.roleGrid}>
              {roleOptions.map((option) => {
                const isSelected = role === option.value;
                return (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.roleButton,
                      {
                        backgroundColor: isSelected ? option.activeColor + '10' : theme.background,
                        borderColor: isSelected ? option.activeColor : theme.backgroundSelected
                      }
                    ]}
                    onPress={() => setRole(option.value)}
                    disabled={loading}
                  >
                    <ThemedText style={styles.roleEmoji}>{option.emoji}</ThemedText>
                    <View style={{ flex: 1 }}>
                      <ThemedText type="smallBold" style={[styles.roleLabel, isSelected && { color: option.activeColor }]}>
                        {option.label}
                      </ThemedText>
                      <ThemedText style={styles.roleDesc} themeColor="textSecondary">
                        {option.desc}
                      </ThemedText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              { opacity: pressed || loading ? 0.9 : 1 }
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <ThemedText style={styles.submitButtonText}>Registrarme</ThemedText>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.push('/(auth)/login' as any)}
            style={styles.registerLink}
            disabled={loading}
          >
            <ThemedText type="small" themeColor="textSecondary">
              ¿Ya tienes cuenta? <ThemedText type="linkPrimary">Inicia sesión</ThemedText>
            </ThemedText>
          </Pressable>
        </ThemedView>
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
  roleGroup: {
    gap: Spacing.two,
  },
  roleGrid: {
    flexDirection: 'column',
    gap: Spacing.two,
  },
  roleButton: {
    borderWidth: 1.5,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  roleEmoji: {
    fontSize: 22,
    marginRight: Spacing.one,
  },
  roleLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  roleDesc: {
    fontSize: 11,
    lineHeight: 14,
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
});
