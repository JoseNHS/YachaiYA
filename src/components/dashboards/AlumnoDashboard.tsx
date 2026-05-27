import React from 'react';
import { StyleSheet, ScrollView, Pressable, View } from 'react-native';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';

export function AlumnoDashboard() {
  const theme = useTheme();

  const courses = [
    { id: '1', title: 'Matemáticas Avanzadas II', schedule: 'Lun - Mié 08:00 - 10:00', progress: 0.85, color: '#6366F1' },
    { id: '2', title: 'Física Cuántica Aplicada', schedule: 'Mar - Jue 10:00 - 12:00', progress: 0.60, color: '#3B82F6' },
    { id: '3', title: 'Desarrollo Mobile con React Native', schedule: 'Viernes 14:00 - 18:00', progress: 0.95, color: '#10B981' },
  ];

  const assignments = [
    { id: 'a1', title: 'Proyecto Final - Navegación', due: 'Mañana 23:59', subject: 'Desarrollo Mobile', status: 'Pendiente', statusColor: '#F59E0B' },
    { id: 'a2', title: 'Ensayo Efecto Fotoeléctrico', due: '30 May', subject: 'Física Cuántica', status: 'Entregado', statusColor: '#10B981' },
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Tarjeta de Bienvenida */}
      <View style={[styles.welcomeCard, { backgroundColor: '#6366F1' }]}>
        <ThemedText style={styles.welcomeTitle}>¡Hola Estudiante! 👋</ThemedText>
        <ThemedText style={styles.welcomeSubtitle}>Tu promedio general actual es de 9.4. ¡Sigue así!</ThemedText>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <ThemedText style={styles.progressLabel}>Progreso del Semestre</ThemedText>
            <ThemedText style={styles.progressValue}>72%</ThemedText>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '72%' }]} />
          </View>
        </View>
      </View>

      {/* Mis Cursos */}
      <View style={styles.sectionHeader}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Mis Cursos</ThemedText>
        <Pressable style={styles.seeAllButton}>
          <ThemedText type="linkPrimary">Ver todos</ThemedText>
        </Pressable>
      </View>

      {courses.map((course) => (
        <ThemedView key={course.id} type="backgroundElement" style={styles.courseCard}>
          <View style={styles.courseHeader}>
            <View style={[styles.colorDot, { backgroundColor: course.color }]} />
            <View style={styles.courseInfo}>
              <ThemedText type="smallBold" style={styles.courseTitle}>{course.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">{course.schedule}</ThemedText>
            </View>
          </View>
          
          <View style={styles.courseProgressSection}>
            <View style={styles.courseProgressHeader}>
              <ThemedText type="small" themeColor="textSecondary">Progreso de asistencia</ThemedText>
              <ThemedText type="smallBold" style={{ color: course.color }}>{Math.round(course.progress * 100)}%</ThemedText>
            </View>
            <View style={[styles.courseProgressBarBg, { backgroundColor: theme.backgroundSelected }]}>
              <View style={[styles.courseProgressBarFill, { width: `${course.progress * 100}%`, backgroundColor: course.color }]} />
            </View>
          </View>
        </ThemedView>
      ))}

      {/* Tareas Pendientes */}
      <View style={[styles.sectionHeader, { marginTop: Spacing.four }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Tareas y Entregas</ThemedText>
      </View>

      {assignments.map((assignment) => (
        <ThemedView key={assignment.id} type="backgroundElement" style={styles.assignmentCard}>
          <View style={styles.assignmentMain}>
            <ThemedText type="smallBold">{assignment.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">{assignment.subject} • Vence: {assignment.due}</ThemedText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: assignment.statusColor + '20' }]}>
            <ThemedText style={[styles.statusText, { color: assignment.statusColor }]}>{assignment.status}</ThemedText>
          </View>
        </ThemedView>
      ))}
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
    shadowColor: '#6366F1',
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
    marginBottom: Spacing.four,
  },
  progressContainer: {
    marginTop: Spacing.two,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.one,
  },
  progressLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
  },
  progressValue: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllButton: {
    paddingVertical: Spacing.one,
  },
  courseCard: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.1)',
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 15,
  },
  courseProgressSection: {
    gap: Spacing.one,
  },
  courseProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  courseProgressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  courseProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  assignmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.1)',
  },
  assignmentMain: {
    flex: 1,
    gap: Spacing.half,
  },
  statusBadge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});
