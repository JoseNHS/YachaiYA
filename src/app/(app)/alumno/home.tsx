import React, { useState, useEffect } from 'react';
import { StyleSheet, Pressable, View, FlatList, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Typography, Colors } from '@/constants/theme';
import { QuestionCard } from '@/components/questions/QuestionCard';
import { QuestionSkeleton } from '@/components/questions/QuestionSkeleton';
import { EmptyQuestions } from '@/components/questions/EmptyQuestions';
import { Select } from '@/components/ui/Select';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SearchBar } from '@/components/ui/SearchBar';
import { Header } from '@/components/ui/Header';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { useMarketplace } from '@/hooks/useMarketplace';
import { notificationService } from '@/services/notificationService';

export default function AlumnoHomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const themeObj = useTheme();
  const isDark = themeObj.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  const [activeTab, setActiveTab] = useState('inicio');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const {
    questions,
    categories,
    myQuestions,
    loading,
    loadingMore,
    refreshing,
    error,
    search,
    setSearch,
    selectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedStatus,
    setSelectedStatus,
    orderBy,
    setOrderBy,
    onRefresh,
    handleLoadMore,
    handleCategoryPress,
    handleRetry,
    triggerFocusRefresh,
    hasMore,
  } = useMarketplace({
    initialStatus: 'all',
    loadMyQuestions: true,
  });

  useFocusEffect(triggerFocusRefresh);

  useEffect(() => {
    if (activeTab === 'notificaciones' && user?.id) {
      setLoadingNotifications(true);
      notificationService.getNotifications(user.id)
        .then((list: any[]) => {
          setNotifications(list);
          setLoadingNotifications(false);
        })
        .catch((err: any) => {
          console.warn('Error loading notifications:', err);
          setLoadingNotifications(false);
        });
    }
  }, [activeTab, user?.id]);

  const handleMarkAsRead = async (notifId: string) => {
    try {
      await notificationService.markNotificationRead(notifId);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
    } catch (e) {
      console.warn('Error marking notification as read:', e);
    }
  };

  const handleTabChange = (tabId: string) => {
    if (tabId === 'publicar') {
      router.push('/(app)/alumno/publish' as any);
    } else {
      setActiveTab(tabId);
    }
  };

  const renderInicio = () => {
    return (
      <ScrollView contentContainerStyle={styles.tabContentContainer} showsVerticalScrollIndicator={false}>
        {/* Billetera Card */}
        <Card style={styles.walletCard}>
          <View style={styles.walletStat}>
            <ThemedText style={{ color: colorPalette.textSecondary, fontSize: Typography.sizes.caption }}>Mi Billetera</ThemedText>
            <ThemedText style={{ color: colorPalette.primary, fontFamily: Typography.fontFamily.bold, fontSize: Typography.sizes.h2, marginTop: 4 }}>
              🪙 {user?.tokens ?? 0} Tokens
            </ThemedText>
          </View>
          <View style={[styles.verticalDivider, { backgroundColor: colorPalette.border }]} />
          <View style={styles.walletStat}>
            <ThemedText style={{ color: colorPalette.textSecondary, fontSize: Typography.sizes.caption }}>Reputación Alumno</ThemedText>
            <ThemedText style={{ color: colorPalette.accent, fontFamily: Typography.fontFamily.bold, fontSize: Typography.sizes.h2, marginTop: 4 }}>
              ⭐ {user?.reputation ?? 0} Puntos
            </ThemedText>
          </View>
        </Card>

        {/* Publicar Nueva Pregunta button */}
        <Button
          variant="secondary"
          title="+ Publicar Nuevo Ejercicio"
          onPress={() => router.push('/(app)/alumno/publish' as any)}
          style={styles.publishBtn}
        />

        {/* Mis Ejercicios Section Title */}
        <ThemedText style={[styles.sectionTitle, { fontFamily: Typography.fontFamily.semiBold, color: colorPalette.text }]}>
          Mis Ejercicios Publicados ({myQuestions.length})
        </ThemedText>

        {myQuestions.length === 0 ? (
          <Card style={styles.emptyMineCard}>
            <ThemedText style={{ fontSize: 28, marginBottom: Spacing.eight }}>📚</ThemedText>
            <ThemedText style={{ fontFamily: Typography.fontFamily.semiBold, color: colorPalette.text, textAlign: 'center' }}>
              Aún no has publicado ningún ejercicio
            </ThemedText>
            <ThemedText style={{ fontFamily: Typography.fontFamily.regular, color: colorPalette.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 4 }}>
              Crea tu primera pregunta matemática para que la comunidad de docentes expertos comience a resolverla.
            </ThemedText>
          </Card>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.myQuestionsScroll}
          >
            {myQuestions.map((q) => (
              <Pressable
                key={q.id}
                style={[styles.myQuestionItem, { backgroundColor: colorPalette.backgroundElement, borderColor: colorPalette.border }]}
                onPress={() => router.push(`/(app)/question/${q.id}` as any)}
              >
                <ThemedText
                  numberOfLines={2}
                  style={[styles.myQuestionTitle, { fontFamily: Typography.fontFamily.semiBold, color: colorPalette.text }]}
                >
                  {q.title}
                </ThemedText>
                <View style={styles.myQuestionMeta}>
                  <ThemedText style={{ fontSize: Typography.sizes.caption, color: colorPalette.accent, fontFamily: Typography.fontFamily.medium }}>
                    💰 {q.reward_tokens} TK
                  </ThemedText>
                  <ThemedText style={{ fontSize: Typography.sizes.small, color: colorPalette.textSecondary }}>
                    {q.status === 'solved' ? '✅ Resuelto' : '⏳ Abierto'}
                  </ThemedText>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </ScrollView>
    );
  };

  const renderNotificaciones = () => {
    return (
      <ScrollView contentContainerStyle={styles.tabContentContainer} showsVerticalScrollIndicator={false}>
        <ThemedText style={[styles.sectionTitle, { fontFamily: Typography.fontFamily.semiBold, color: colorPalette.text }]}>
          Mis Notificaciones ({notifications.filter(n => !n.is_read).length} sin leer)
        </ThemedText>

        {loadingNotifications ? (
          <Card style={{ padding: Spacing.twenty, alignItems: 'center' }}>
            <ThemedText style={{ color: colorPalette.textSecondary }}>Cargando notificaciones...</ThemedText>
          </Card>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyAlertsContainer}>
            <ThemedText style={{ fontSize: 48, marginBottom: Spacing.sixteen }}>🔔</ThemedText>
            <ThemedText style={{ fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.sizes.h3, color: colorPalette.text }}>
              Sin alertas nuevas
            </ThemedText>
            <ThemedText style={{ fontFamily: Typography.fontFamily.regular, fontSize: Typography.sizes.body, color: colorPalette.textSecondary, textAlign: 'center', marginTop: 8 }}>
              Te notificaremos en cuanto un docente proponga una solución a tus ejercicios.
            </ThemedText>
          </View>
        ) : (
          <View style={{ gap: Spacing.twelve }}>
            {notifications.map((notif) => (
              <Pressable
                key={notif.id}
                onPress={() => handleMarkAsRead(notif.id)}
              >
                <Card
                  style={[
                    styles.notificationCard,
                    !notif.is_read && { borderColor: colorPalette.primary, borderWidth: 1.5, backgroundColor: 'rgba(108, 198, 255, 0.03)' }
                  ]}
                >
                  <View style={styles.notifHeader}>
                    <ThemedText style={{ fontFamily: Typography.fontFamily.semiBold, fontSize: 13, color: colorPalette.text }}>
                      {notif.title}
                    </ThemedText>
                    {!notif.is_read && (
                      <View style={[styles.unreadDot, { backgroundColor: colorPalette.primary }]} />
                    )}
                  </View>
                  <ThemedText style={{ fontSize: Typography.sizes.body, color: colorPalette.textSecondary, marginTop: Spacing.four }}>
                    {notif.message}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 9, color: colorPalette.textSecondary, marginTop: Spacing.eight }}>
                    {new Date(notif.created_at).toLocaleString()}
                  </ThemedText>
                </Card>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  const renderPerfil = () => {
    const userInitials = user?.full_name
      ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : 'U';

    const publishedCount = myQuestions.length;
    const solvedCount = myQuestions.filter(q => q.status === 'solved').length;
    const dateJoined = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A';

    return (
      <ScrollView contentContainerStyle={styles.tabContentContainer} showsVerticalScrollIndicator={false}>
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={[styles.profileAvatar, { backgroundColor: colorPalette.primary }]}>
              <ThemedText style={{ fontSize: 20, fontFamily: Typography.fontFamily.bold, color: '#111111' }}>
                {userInitials}
              </ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.sizes.h2, color: colorPalette.text }}>
                {user?.full_name || 'Estudiante'}
              </ThemedText>
              <ThemedText style={{ fontFamily: Typography.fontFamily.regular, fontSize: Typography.sizes.body, color: colorPalette.textSecondary }}>
                {user?.email || 'alumno@yachaiya.com'}
              </ThemedText>
              <ThemedText style={{ fontFamily: Typography.fontFamily.medium, fontSize: Typography.sizes.caption, color: colorPalette.primary, marginTop: 4 }}>
                🎒 Rol: Alumno
              </ThemedText>
            </View>
          </View>

          <View style={[styles.horizontalDivider, { backgroundColor: colorPalette.border }]} />

          <View style={styles.profileStatsRow}>
            <View style={styles.profileStatItem}>
              <ThemedText style={{ color: colorPalette.textSecondary, fontSize: Typography.sizes.caption }}>Saldo de Tokens</ThemedText>
              <ThemedText style={{ color: colorPalette.text, fontFamily: Typography.fontFamily.bold, fontSize: Typography.sizes.h3, marginTop: 4 }}>
                🪙 {user?.tokens ?? 0}
              </ThemedText>
            </View>
            <View style={styles.profileStatItem}>
              <ThemedText style={{ color: colorPalette.textSecondary, fontSize: Typography.sizes.caption }}>Reputación</ThemedText>
              <ThemedText style={{ color: colorPalette.text, fontFamily: Typography.fontFamily.bold, fontSize: Typography.sizes.h3, marginTop: 4 }}>
                ⭐ {user?.reputation ?? 0}
              </ThemedText>
            </View>
          </View>

          <View style={[styles.horizontalDivider, { backgroundColor: colorPalette.border }]} />

          <View style={{ gap: Spacing.eight }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ThemedText style={{ color: colorPalette.textSecondary, fontSize: 12 }}>Miembro desde:</ThemedText>
              <ThemedText style={{ color: colorPalette.text, fontFamily: Typography.fontFamily.medium, fontSize: 12 }}>{dateJoined}</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ThemedText style={{ color: colorPalette.textSecondary, fontSize: 12 }}>Preguntas realizadas:</ThemedText>
              <ThemedText style={{ color: colorPalette.text, fontFamily: Typography.fontFamily.medium, fontSize: 12 }}>{publishedCount}</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ThemedText style={{ color: colorPalette.textSecondary, fontSize: 12 }}>Ejercicios resueltos:</ThemedText>
              <ThemedText style={{ color: colorPalette.text, fontFamily: Typography.fontFamily.medium, fontSize: 12 }}>{solvedCount}</ThemedText>
            </View>
          </View>
        </Card>

        {/* Botón de acceso directo a la Billetera */}
        <Button
          variant="outline"
          title="💳 Ver Mi Billetera"
          onPress={() => router.push('/(app)/wallet' as any)}
          style={{ marginTop: Spacing.sixteen }}
        />

        <Button
          variant="danger"
          title="Cerrar Sesión"
          onPress={signOut}
          style={{ marginTop: Spacing.twenty }}
        />
      </ScrollView>
    );
  };

  const renderHeaderComponent = () => (
    <View style={styles.feedHeaderContainer}>
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar ejercicios..."
      />

      {/* Category Horizontal chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryChipsScroll}
      >
        <Chip
          label="Todos"
          selected={selectedCategory === null}
          onPress={() => handleCategoryPress(null)}
        />
        {categories.map((cat) => (
          <Chip
            key={cat.id}
            label={cat.name}
            selected={selectedCategory === cat.id}
            onPress={() => handleCategoryPress(cat.id)}
          />
        ))}
      </ScrollView>

      {/* Filters options row */}
      <View style={styles.filterGrid}>
        <View style={styles.filterHalf}>
          <Select
            label="Dificultad"
            selectedValue={selectedDifficulty}
            onValueChange={setSelectedDifficulty}
            options={[
              { label: 'Todas', value: 'all' },
              { label: 'Básica', value: 'Básica' },
              { label: 'Intermedia', value: 'Intermedia' },
              { label: 'Avanzada', value: 'Avanzada' },
              { label: 'Olímpica', value: 'Olimpiada' },
            ]}
          />
        </View>
        <View style={styles.filterHalf}>
          <Select
            label="Ordenar por"
            selectedValue={orderBy}
            onValueChange={setOrderBy}
            options={[
              { label: 'Más recientes', value: 'recent' },
              { label: 'Mayor Recompensa', value: 'highest_reward' },
              { label: 'Menor Recompensa', value: 'lowest_reward' },
              { label: 'Más respuestas', value: 'most_answers' },
              { label: 'Mayor reputación', value: 'highest_reputation' },
            ]}
          />
        </View>
      </View>

      <View style={styles.filterGrid}>
        <View style={{ flex: 1 }}>
          <Select
            label="Estado"
            selectedValue={selectedStatus}
            onValueChange={setSelectedStatus}
            options={[
              { label: 'Todos los estados', value: 'all' },
              { label: 'Abiertas', value: 'open' },
              { label: 'Resueltas', value: 'solved' },
              { label: 'En revisión', value: 'in_review' },
            ]}
          />
        </View>
      </View>
    </View>
  );

  const renderFooterComponent = () => {
    if (!hasMore) {
      return (
        <View style={styles.endOfFeedContainer}>
          <ThemedText style={{ color: colorPalette.textSecondary, fontSize: 12 }}>
            Has llegado al final del Marketplace
          </ThemedText>
        </View>
      );
    }
    if (loadingMore) {
      return (
        <View style={styles.footerLoader}>
          <QuestionSkeleton />
        </View>
      );
    }
    return null;
  };

  const renderEmptyComponent = () => {
    if (loading) return null;
    return (
      <View style={styles.centerContainer}>
        <EmptyQuestions onPublishPress={() => router.push('/(app)/alumno/publish' as any)} />
      </View>
    );
  };

  const renderErrorComponent = () => (
    <View style={styles.errorContainer}>
      <ThemedText style={styles.errorText}>No pudimos cargar los ejercicios del Marketplace.</ThemedText>
      <Button title="Reintentar" onPress={handleRetry} style={{ marginTop: Spacing.twelve }} />
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Header onNotificationPress={() => handleTabChange('notificaciones')} />

        <View style={styles.content}>
          {activeTab === 'inicio' && renderInicio()}
          {activeTab === 'notificaciones' && renderNotificaciones()}
          {activeTab === 'perfil' && renderPerfil()}

          {activeTab === 'explorar' && (
            error ? (
              renderErrorComponent()
            ) : (
              <FlatList
                data={questions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <QuestionCard
                    question={item}
                    onPress={() => router.push(`/(app)/question/${item.id}` as any)}
                  />
                )}
                ListHeaderComponent={renderHeaderComponent}
                ListFooterComponent={renderFooterComponent}
                ListEmptyComponent={
                  loading ? (
                    <View style={styles.skeletonsContainer}>
                      <QuestionSkeleton />
                      <QuestionSkeleton />
                      <QuestionSkeleton />
                    </View>
                  ) : (
                    renderEmptyComponent()
                  )
                }
                refreshing={refreshing}
                onRefresh={onRefresh}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.4}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
              />
            )
          )}
        </View>

        <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabContentContainer: {
    padding: Spacing.sixteen,
    paddingBottom: Spacing.thirtyTwo,
  },
  walletCard: {
    padding: Spacing.sixteen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sixteen,
    borderWidth: 1,
  },
  walletStat: {
    flex: 1,
    alignItems: 'center',
  },
  verticalDivider: {
    width: 1.5,
    height: 40,
  },
  publishBtn: {
    marginBottom: Spacing.twentyFour,
  },
  sectionTitle: {
    fontSize: Typography.sizes.h3,
    marginBottom: Spacing.twelve,
  },
  emptyMineCard: {
    padding: Spacing.twenty,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  myQuestionsScroll: {
    paddingVertical: Spacing.four,
    gap: Spacing.twelve,
  },
  myQuestionItem: {
    width: 180,
    borderWidth: 1,
    borderRadius: Radius.r12,
    padding: Spacing.twelve,
  },
  myQuestionTitle: {
    fontSize: Typography.sizes.body,
    marginBottom: Spacing.eight,
  },
  myQuestionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryChipsScroll: {
    paddingVertical: Spacing.four,
    marginBottom: Spacing.eight,
    gap: Spacing.eight,
  },
  filterGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.twelve,
    marginBottom: Spacing.four,
  },
  filterHalf: {
    flex: 1,
  },
  skeletonsContainer: {
    gap: Spacing.twelve,
  },
  listContainer: {
    paddingHorizontal: Spacing.sixteen,
    paddingBottom: Spacing.thirtyTwo,
  },
  feedHeaderContainer: {
    marginTop: Spacing.sixteen,
    marginBottom: Spacing.eight,
  },
  endOfFeedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.twentyFour,
  },
  footerLoader: {
    marginVertical: Spacing.sixteen,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.twentyFour,
  },
  errorText: {
    fontSize: Typography.sizes.body,
    textAlign: 'center',
    color: '#EF4444',
  },
  emptyAlertsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sixtyFour,
    paddingHorizontal: Spacing.twentyFour,
  },
  profileCard: {
    padding: Spacing.twenty,
    borderWidth: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sixteen,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalDivider: {
    height: 1,
    marginVertical: Spacing.sixteen,
  },
  profileStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  profileStatItem: {
    alignItems: 'center',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.twentyFour,
  },
  notificationCard: {
    padding: Spacing.sixteen,
    borderWidth: 1,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
