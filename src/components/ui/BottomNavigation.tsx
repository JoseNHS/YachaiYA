import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Home, Compass, PlusCircle, Bell, User, Briefcase, GraduationCap } from 'lucide-react-native';
import { ThemedText } from '../themed-text';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Typography, Radius } from '@/constants/theme';

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

  const role = user?.role || 'alumno';

  const tabs = role === 'alumno'
    ? [
        { id: 'inicio', label: 'Inicio', icon: Home },
        { id: 'explorar', label: 'Explorar', icon: Compass },
        { id: 'publicar', label: 'Publicar', icon: PlusCircle },
        { id: 'notificaciones', label: 'Alertas', icon: Bell },
        { id: 'perfil', label: 'Perfil', icon: User },
      ]
    : [
        { id: 'inicio', label: 'Inicio', icon: Home },
        { id: 'marketplace', label: 'Market', icon: Briefcase },
        { id: 'respuestas', label: 'Respuestas', icon: GraduationCap },
        { id: 'notificaciones', label: 'Alertas', icon: Bell },
        { id: 'perfil', label: 'Perfil', icon: User },
      ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundElement,
          borderTopColor: theme.border,
        }
      ]}
    >
      {tabs.map((tab) => {
        const isSelected = activeTab === tab.id;
        const tintColor = isSelected ? theme.primary : theme.textSecondary;
        const labelFont = isSelected ? Typography.fontFamily.semiBold : Typography.fontFamily.regular;
        const IconComponent = tab.icon;

        return (
          <Pressable
            key={tab.id}
            style={styles.tabButton}
            onPress={() => onTabChange(tab.id)}
          >
            {isSelected && (
              <View style={[styles.activeIndicator, { backgroundColor: theme.primary }]} />
            )}
            <IconComponent size={20} color={tintColor} />
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
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 56,
    borderTopWidth: 1,
    borderTopLeftRadius: Radius.r16,
    borderTopRightRadius: Radius.r16,
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 4,
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.03,
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
  label: {
    fontSize: Typography.sizes.small,
    marginTop: 3,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 20,
    height: 3,
    borderBottomLeftRadius: Radius.r4,
    borderBottomRightRadius: Radius.r4,
  },
});
