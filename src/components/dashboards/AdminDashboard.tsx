import React from 'react';
import { StyleSheet, ScrollView, View, Pressable } from 'react-native';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';
import { useAuth } from '../../hooks/useAuth';

export function AdminDashboard() {
  const theme = useTheme();
  const { isDemoMode } = useAuth();

  const stats = [
    { label: 'Total Usuarios', value: '1,482', change: '+12% esta semana', color: '#10B981' },
    { label: 'Servidores API', value: '99.98%', change: 'Óptimo (24ms latency)', color: '#10B981' },
    { label: 'Base de Datos', value: 'Activa', change: 'Supabase Cloud (AWS)', color: '#3B82F6' },
    { label: 'Reportes Abiertos', value: '2', change: 'Requieren atención', color: '#EF4444' },
  ];

  const recentLogs = [
    { id: '1', event: 'Registro exitoso de usuario', user: 'carlos.mendoza@docente.com', time: 'Hace 5 min' },
    { id: '2', event: 'Error de conexión Supabase (Handshake)', user: 'Sistema', time: 'Hace 15 min' },
    { id: '3', event: 'Actualización de perfil (Rol: Alumno)', user: 'alejandro.rivera@alumno.com', time: 'Hace 1 hora' },
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Saludo Administrador */}
      <View style={[styles.welcomeCard, { backgroundColor: '#10B981' }]}>
        <ThemedText style={styles.welcomeTitle}>Panel de Administración 🛡️</ThemedText>
        <ThemedText style={styles.welcomeSubtitle}>
          {isDemoMode 
            ? 'Estás en MODO DEMO. Todas las interacciones de base de datos están siendo simuladas de manera segura.'
            : 'Conexión activa con Supabase Cloud. Tienes control completo de la infraestructura.'
          }
        </ThemedText>
      </View>

      {/* Grid de Estadísticas */}
      <View style={styles.statsGrid}>
        {stats.map((stat, i) => (
          <ThemedView key={i} type="backgroundElement" style={styles.statCard}>
            <ThemedText type="small" themeColor="textSecondary">{stat.label}</ThemedText>
            <ThemedText style={[styles.statValue, { color: theme.text }]}>{stat.value}</ThemedText>
            <ThemedText style={[styles.statChange, { color: stat.color }]}>{stat.change}</ThemedText>
          </ThemedView>
        ))}
      </View>

      {/* Estado de los Servicios */}
      <View style={styles.sectionHeader}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Logs Recientes del Sistema</ThemedText>
      </View>

      {recentLogs.map((log) => (
        <ThemedView key={log.id} type="backgroundElement" style={styles.logCard}>
          <View style={styles.logMain}>
            <ThemedText type="smallBold" style={styles.logEvent}>{log.event}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">{log.user}</ThemedText>
          </View>
          <ThemedText style={styles.logTime} themeColor="textSecondary">{log.time}</ThemedText>
        </ThemedView>
      ))}

      {/* Herramientas de Desarrollo */}
      <View style={[styles.sectionHeader, { marginTop: Spacing.four }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Herramientas Rápidas</ThemedText>
      </View>

      <View style={styles.toolsContainer}>
        <Pressable style={[styles.toolButton, { borderColor: theme.backgroundSelected }]}>
          <ThemedText style={styles.toolIcon}>⚙️</ThemedText>
          <ThemedText type="smallBold">Ajustes Generales</ThemedText>
          <ThemedText style={styles.toolDesc} themeColor="textSecondary">Configuración de la app</ThemedText>
        </Pressable>
        <Pressable style={[styles.toolButton, { borderColor: theme.backgroundSelected }]}>
          <ThemedText style={styles.toolIcon}>👥</ThemedText>
          <ThemedText type="smallBold">Gestión de Roles</ThemedText>
          <ThemedText style={styles.toolDesc} themeColor="textSecondary">Editar perfiles y permisos</ThemedText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  welcomeCard: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    marginBottom: Spacing.two,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  welcomeTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: Spacing.one,
  },
  welcomeSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  statCard: {
    width: '47%',
    padding: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.1)',
    gap: Spacing.one,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: Spacing.one,
  },
  statChange: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: Spacing.half,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.1)',
  },
  logMain: {
    flex: 1,
    gap: Spacing.half,
  },
  logEvent: {
    fontSize: 14,
  },
  logTime: {
    fontSize: 12,
  },
  toolsContainer: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  toolButton: {
    flex: 1,
    padding: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1.5,
    gap: Spacing.one,
  },
  toolIcon: {
    fontSize: 24,
    marginBottom: Spacing.one,
  },
  toolDesc: {
    fontSize: 10,
  },
});
