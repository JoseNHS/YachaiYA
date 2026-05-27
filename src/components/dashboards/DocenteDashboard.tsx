import React from 'react';
import { StyleSheet, ScrollView, Pressable, View } from 'react-native';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';

export function DocenteDashboard() {
  const theme = useTheme();

  const classesToday = [
    { id: 'c1', course: 'Desarrollo Mobile con React Native', time: '08:00 - 10:00', room: 'Laboratorio B-3', active: true },
    { id: 'c2', course: 'Arquitectura de Software', time: '10:15 - 12:15', room: 'Aula 204', active: false },
    { id: 'c3', course: 'Tutorías Proyectos de Grado', time: '15:00 - 16:30', room: 'Cubículo 12', active: false },
  ];

  const statCards = [
    { label: 'Total Alumnos', value: '48', iconColor: '#3B82F6' },
    { label: 'Pendiente Revisar', value: '14', iconColor: '#F59E0B' },
    { label: 'Promedio General', value: '8.7', iconColor: '#10B981' },
    { label: 'Horas esta semana', value: '18h', iconColor: '#8B5CF6' },
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Saludo Docente */}
      <View style={[styles.welcomeCard, { backgroundColor: '#3B82F6' }]}>
        <ThemedText style={styles.welcomeTitle}>¡Hola Docente! 🎓</ThemedText>
        <ThemedText style={styles.welcomeSubtitle}>Hoy tienes programadas {classesToday.length} sesiones de clase. ¡Buen día de enseñanza!</ThemedText>
      </View>

      {/* Grid de Estadísticas */}
      <View style={styles.statsGrid}>
        {statCards.map((stat, i) => (
          <ThemedView key={i} type="backgroundElement" style={styles.statCard}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.statLabel}>{stat.label}</ThemedText>
            <ThemedText style={[styles.statValue, { color: stat.iconColor }]}>{stat.value}</ThemedText>
          </ThemedView>
        ))}
      </View>

      {/* Clases de Hoy */}
      <View style={styles.sectionHeader}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Clases de Hoy</ThemedText>
      </View>

      {classesToday.map((item) => (
        <ThemedView key={item.id} type="backgroundElement" style={[styles.classCard, item.active && styles.activeClassCard]}>
          <View style={styles.classMain}>
            <View style={styles.classInfo}>
              <ThemedText type="smallBold">{item.course}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">{item.time} • {item.room}</ThemedText>
            </View>
            {item.active && (
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <ThemedText style={styles.liveText}>EN VIVO</ThemedText>
              </View>
            )}
          </View>
          
          <View style={styles.classActions}>
            <Pressable style={[styles.actionButton, { backgroundColor: item.active ? '#3B82F6' : theme.backgroundSelected }]}>
              <ThemedText style={[styles.actionButtonText, { color: item.active ? '#ffffff' : theme.text }]}>
                {item.active ? 'Pasar Asistencia' : 'Ver Detalles'}
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      ))}

      {/* Acciones Rápidas */}
      <View style={[styles.sectionHeader, { marginTop: Spacing.four }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Acciones Rápidas</ThemedText>
      </View>

      <View style={styles.quickActionsContainer}>
        <Pressable style={[styles.quickActionButton, { borderColor: theme.backgroundSelected }]}>
          <ThemedText style={styles.quickActionEmoji}>📝</ThemedText>
          <ThemedText type="smallBold">Subir Notas</ThemedText>
        </Pressable>
        <Pressable style={[styles.quickActionButton, { borderColor: theme.backgroundSelected }]}>
          <ThemedText style={styles.quickActionEmoji}>📅</ThemedText>
          <ThemedText type="smallBold">Nueva Clase</ThemedText>
        </Pressable>
        <Pressable style={[styles.quickActionButton, { borderColor: theme.backgroundSelected }]}>
          <ThemedText style={styles.quickActionEmoji}>💬</ThemedText>
          <ThemedText type="smallBold">Mensajes</ThemedText>
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
    shadowColor: '#3B82F6',
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
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
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
  classCard: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.1)',
    gap: Spacing.three,
  },
  activeClassCard: {
    borderColor: '#3B82F6',
    borderWidth: 1.5,
  },
  classMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  classInfo: {
    flex: 1,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF444420',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 4,
    gap: Spacing.one,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveText: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: 'bold',
  },
  classActions: {
    marginTop: Spacing.one,
  },
  actionButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1.5,
    gap: Spacing.two,
  },
  quickActionEmoji: {
    fontSize: 24,
  },
});
