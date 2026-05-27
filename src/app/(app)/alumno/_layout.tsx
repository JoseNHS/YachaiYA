import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect, Slot } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/use-theme';

export default function AlumnoLayout() {
  const { user, loading } = useAuth();
  const theme = useTheme();

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  // Protección estricta contra accesos cruzados
  if (!user || user.role !== 'alumno') {
    const fallbackPath = user ? `/(app)/${user.role}/home` : '/(auth)/login';
    return <Redirect href={fallbackPath as any} />;
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
