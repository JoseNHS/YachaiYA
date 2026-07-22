import React from 'react';
import { StyleSheet, Modal as RNModal, View, Pressable, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Colors } from '@/constants/theme';
import { Card } from './Card';
import { ThemedText } from '../themed-text';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  containerStyle,
}) => {
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.centeredView}>
          <Pressable style={{ width: '100%' }}>
            <Card
              style={[
                styles.modalView,
                {
                  backgroundColor: colorPalette.backgroundElement,
                  borderColor: colorPalette.border,
                },
                containerStyle
              ]}
            >
              {title && (
                <View style={styles.header}>
                  <ThemedText type="subtitle" style={styles.titleText}>
                    {title}
                  </ThemedText>
                  <Pressable onPress={onClose} style={styles.closeBtn}>
                    <ThemedText style={{ color: colorPalette.textSecondary, fontWeight: 'bold' }}>
                      ✕
                    </ThemedText>
                  </Pressable>
                </View>
              )}
              <View style={styles.content}>
                {children}
              </View>
            </Card>
          </Pressable>
        </View>
      </Pressable>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.twentyFour,
  },
  centeredView: {
    width: '100%',
    maxWidth: 480,
  },
  modalView: {
    borderRadius: Radius.r16,
    padding: Spacing.twenty,
    borderWidth: 1,
    elevation: 10,
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sixteen,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.08)',
    paddingBottom: Spacing.eight,
  },
  titleText: {
    fontSize: 16,
  },
  closeBtn: {
    padding: Spacing.four,
  },
  content: {
    width: '100%',
  },
});
