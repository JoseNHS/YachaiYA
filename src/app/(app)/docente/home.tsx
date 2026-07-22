import React, { useState, useEffect } from 'react';
import { StyleSheet, Pressable, View, FlatList, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Typography, Colors } from '@/constants/theme';
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
import { answerService } from '@/services/answerService';
import { notificationService } from '@/services/notificationService';
import { Answer } from '@/types/auth';

export default function DocenteHomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const themeObj = useTheme();
  const isDark = themeObj.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  const [activeTab, setActiveTab] = useState('inicio');
  const [myAnswers, setMyAnswers] = useState<Answer[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const {
    questions,
    categories,
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
    initialStatus: 'open',
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


  // Fetch teacher's proposed answers when answers tab becomes active
  useEffect(() => {
    if (activeTab === 'respuestas' && user?.id) {
      setLoadingAnswers(true);
      answerService.getAnswersByUser(user.id)
        .then(ans => {
          setMyAnswers(ans);
          setLoadingAnswers(false);
        })
        .catch(err => {
          console.warn('Error fetching answers by user:', err);
          setLoadingAnswers(false);
        });
    }
  }, [activeTab, user?.id]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const renderInicio = () => {
    return (
      <View style={{ flex: 1 }}>
        <FlatList
          data={questions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <QuestionCard
              question={item}
              onPress={() => router.push(`/(app)/question/${item.id}` as any)}
            />
          )}
          ListHeaderComponent={() => (
            <View style={styles.feedHeaderContainer}>
              {/* Wallet Card */}
              <Card style={styles.walletCard}>
                <View style={styles.walletStat}>
                  <ThemedText style={{ color: colorPalette.textSecondary, fontSize: Typography.sizes.caption }}>Balance de Billetera</ThemedText>
                  <ThemedText style={{ color: colorPalette.primary, fontFamily: Typography.fontFamily.bold, fontSize: Typography.sizes.h2, marginTop: 4 }}>
                    🪙 {user?.tokens ?? 0} Tokens
                  </ThemedText>
                </View>
                <View style={[styles.verticalDivider, { backgroundColor: colorPalette.border }]} />
                <View style={styles.walletStat}>
                  <ThemedText style={{ color: colorPalette.textSecondary, fontSize: Typography.sizes.caption }}>Reputación Experto</ThemedText>
                  <ThemedText style={{ color: colorPalette.accent, fontFamily: Typography.fontFamily.bold, fontSize: Typography.sizes.h2, marginTop: 4 }}>
                    ⭐ {user?.reputation ?? 0} Puntos
                  </ThemedText>
                </View>
              </Card>

              {/* Title Section */}
              <ThemedText style={[styles.sectionTitle, { fontFamily: Typography.fontFamily.semiBold, color: colorPalette.text }]}>
                Ejercicios Abiertos para Resolver
              </ThemedText>
            </View>
          )}
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
      </View>
    );
  };

  const renderMarketplace = () => {
    return (
      <View style={{ flex: 1 }}>
        <FlatList
          data={questions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <QuestionCard
              question={item}
              onPress={() => router.push(`/(app)/question/${item.id}` as any)}
            />
          )}
          ListHeaderComponent={() => (
            <View style={styles.feedHeaderContainer}>
              <SearchBar
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar en el marketplace..."
              />

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
          )}
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
      </View>
    );
  };

  const renderRespuestas = () => {
    return (
      <ScrollView contentContainerStyle={styles.tabContentContainer} showsVerticalScrollIndicator={false}>
        <ThemedText style={[styles.sectionTitle, { fontFamily: Typography.fontFamily.semiBold, color: colorPalette.text }]}>
          Mis Soluciones Propuestas ({myAnswers.length})
        </ThemedText>

        {loadingAnswers ? (
          <View style={{ paddingVertical: Spacing.thirtyTwo }}>
            <QuestionSkeleton />
          </View>
        ) : myAnswers.length === 0 ? (
          <Card style={styles.emptyAnswersCard}>
            <ThemedText style={{ fontSize: 28, marginBottom: Spacing.eight }}>🎓</ThemedText>
            <ThemedText style={{ fontFamily: Typography.fontFamily.semiBold, color: colorPalette.text, textAlign: 'center' }}>
              Aún no has propuesto soluciones
            </ThemedText>
            <ThemedText style={{ fontFamily: Typography.fontFamily.regular, color: colorPalette.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 4 }}>
              Navega en el marketplace, encuentra ejercicios abiertos y propón soluciones de alta calidad para ganar reputación y tokens.
            </ThemedText>
          </Card>
        ) : (
          <View style={{ gap: Spacing.twelve }}>
            {myAnswers.map((ans) => (
              <Pressable
                key={ans.id}
                onPress={() => router.push(`/(app)/question/${ans.question_id}` as any)}
              >
                <Card style={styles.answerHistoryCard}>
                  <View style={styles.answerHistoryHeader}>
                    <ThemedText numberOfLines={1} style={{ fontFamily: Typography.fontFamily.semiBold, color: colorPalette.text, flex: 1 }}>
                      {(ans as any).question_title || 'Ejercicio Resuelto'}
                    </ThemedText>
                    <ThemedText style={{ fontSize: 11, color: colorPalette.textSecondary }}>
                      {new Date(ans.created_at).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <ThemedText numberOfLines={2} style={{ fontSize: Typography.sizes.body, color: colorPalette.textSecondary, marginTop: Spacing.eight }}>
                    {ans.content}
                  </ThemedText>
                  <View style={styles.answerHistoryFooter}>
                    <ThemedText style={{ fontSize: 11, color: ans.is_accepted ? '#10B981' : colorPalette.accent, fontFamily: Typography.fontFamily.medium }}>
                      {ans.is_accepted ? '🏆 Solución Oficial Aceptada' : '⏳ Pendiente de Selección'}
                    </ThemedText>
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
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
              Te notificaremos cuando un alumno acepte tus soluciones y ganes tokens de recompensa.
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

    const proposedCount = myAnswers.length;
    const acceptedCount = myAnswers.filter(a => a.is_accepted).length;
    const dateJoined = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A';

    return (
      <ScrollView contentContainerStyle={styles.tabContentContainer} showsVerticalScrollIndicator={false}>
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={[styles.profileAvatar, { backgroundColor: colorPalette.accent }]}>
              <ThemedText style={{ fontSize: 20, fontFamily: Typography.fontFamily.bold, color: '#FFFFFF' }}>
                {userInitials}
              </ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.sizes.h2, color: colorPalette.text }}>
                {user?.full_name || 'Profesor'}
              </ThemedText>
              <ThemedText style={{ fontFamily: Typography.fontFamily.regular, fontSize: Typography.sizes.body, color: colorPalette.textSecondary }}>
                {user?.email || 'docente@yachaiya.com'}
              </ThemedText>
              <ThemedText style={{ fontFamily: Typography.fontFamily.medium, fontSize: Typography.sizes.caption, color: colorPalette.accent, marginTop: 4 }}>
                👨‍🏫 Rol: Docente / Experto
              </ThemedText>
            </View>
          </View>

          <View style={[styles.horizontalDivider, { backgroundColor: colorPalette.border }]} />

          <View style={styles.profileStatsRow}>
            <View style={styles.profileStatItem}>
              <ThemedText style={{ color: colorPalette.textSecondary, fontSize: Typography.sizes.caption }}>Ganancias libres</ThemedText>
              <ThemedText style={{ color: colorPalette.text, fontFamily: Typography.fontFamily.bold, fontSize: Typography.sizes.h3, marginTop: 4 }}>
                🪙 {user?.tokens ?? 0}
              </ThemedText>
            </View>
            <View style={styles.profileStatItem}>
              <ThemedText style={{ color: colorPalette.textSecondary, fontSize: Typography.sizes.caption }}>Reputación Docente</ThemedText>
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
              <ThemedText style={{ color: colorPalette.textSecondary, fontSize: 12 }}>Respuestas propuestas:</ThemedText>
              <ThemedText style={{ color: colorPalette.text, fontFamily: Typography.fontFamily.medium, fontSize: 12 }}>{proposedCount}</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ThemedText style={{ color: colorPalette.textSecondary, fontSize: 12 }}>Soluciones aceptadas:</ThemedText>
              <ThemedText style={{ color: colorPalette.text, fontFamily: Typography.fontFamily.medium, fontSize: 12 }}>{acceptedCount}</ThemedText>
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
        <EmptyQuestions />
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
          {activeTab === 'inicio' && (error ? renderErrorComponent() : renderInicio())}
          {activeTab === 'marketplace' && (error ? renderErrorComponent() : renderMarketplace())}
          {activeTab === 'respuestas' && renderRespuestas()}
          {activeTab === 'notificaciones' && renderNotificaciones()}
          {activeTab === 'perfil' && renderPerfil()}
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
  sectionTitle: {
    fontSize: Typography.sizes.h3,
    marginBottom: Spacing.twelve,
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
  emptyAnswersCard: {
    padding: Spacing.twenty,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  answerHistoryCard: {
    padding: Spacing.sixteen,
    borderWidth: 1,
  },
  answerHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  answerHistoryFooter: {
    marginTop: Spacing.twelve,
    flexDirection: 'row',
    justifyContent: 'flex-start',
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
