import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from '../themed-text';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Typography, Colors, Radius } from '@/constants/theme';

export interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  const role = user?.role || 'alumno';

  const tabs = role === 'alumno'
    ? [
        { id: 'inicio', label: 'Inicio', icon: '🏠' },
        { id: 'explorar', label: 'Explorar', icon: '🔍' },
        { id: 'publicar', label: 'Publicar', icon: '➕' },
        { id: 'notificaciones', label: 'Alertas', icon: '🔔' },
        { id: 'perfil', label: 'Perfil', icon: '👤' },
      ]
    : [
        { id: 'inicio', label: 'Inicio', icon: '🏠' },
        { id: 'marketplace', label: 'Market', icon: '💼' },
        { id: 'respuestas', label: 'Respuestas', icon: '🎓' },
        { id: 'notificaciones', label: 'Alertas', icon: '🔔' },
        { id: 'perfil', label: 'Perfil', icon: '👤' },
      ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colorPalette.backgroundElement,
          borderTopColor: colorPalette.border,
        }
      ]}
    >
      {tabs.map((tab) => {
        const isSelected = activeTab === tab.id;
        const tintColor = isSelected ? colorPalette.accent : colorPalette.textSecondary; // Fucsia for active accent!
        const labelFont = isSelected ? Typography.fontFamily.semiBold : Typography.fontFamily.regular;

        return (
          <Pressable
            key={tab.id}
            style={styles.tabButton}
            onPress={() => onTabChange(tab.id)}
          >
            <ThemedText style={[styles.icon, { color: tintColor }]}>
              {tab.icon}
            </ThemedText>
            <ThemedText
              style={[
                styles.label,
                {
                  color: tintColor,
                  fontFamily: labelFont,
                }
              ]}
            >
              {tab.label}
            </ThemedText>
            {isSelected && (
              <View style={[styles.activeIndicator, { backgroundColor: colorPalette.accent }]} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 64,
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: Spacing.four,
    elevation: 8,
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
    paddingTop: Spacing.four,
  },
  icon: {
    fontSize: 18,
    lineHeight: 22,
  },
  label: {
    fontSize: Typography.sizes.small,
    marginTop: 2,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 3,
    borderBottomLeftRadius: Radius.r4,
    borderBottomRightRadius: Radius.r4,
  },
});
