import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Modal, FlatList } from 'react-native';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius, Typography, Colors } from '@/constants/theme';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: string | null;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Seleccionar opción...',
  error,
}) => {
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find(opt => opt.value === selectedValue);

  return (
    <View style={styles.container}>
      {label && (
        <ThemedText
          style={[
            styles.label,
            {
              fontFamily: Typography.fontFamily.medium,
              color: colorPalette.textSecondary,
            }
          ]}
        >
          {label}
        </ThemedText>
      )}

      <Pressable
        style={[
          styles.selectTrigger,
          {
            backgroundColor: colorPalette.backgroundElement,
            borderColor: error ? '#EF4444' : colorPalette.border,
            borderWidth: 1.5,
          }
        ]}
        onPress={() => setModalVisible(true)}
      >
        <ThemedText
          style={{
            fontFamily: Typography.fontFamily.regular,
            color: selectedOption ? colorPalette.text : colorPalette.textSecondary,
            fontSize: Typography.sizes.body,
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </ThemedText>
        <ThemedText style={{ color: colorPalette.textSecondary }}>▼</ThemedText>
      </Pressable>

      {error && (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colorPalette.background,
                borderColor: colorPalette.border,
                borderWidth: 1,
              }
            ]}
          >
            <ThemedText
              style={[
                styles.modalHeader,
                {
                  fontFamily: Typography.fontFamily.semiBold,
                  borderBottomColor: colorPalette.border,
                  color: colorPalette.text,
                }
              ]}
            >
              {label || 'Seleccionar'}
            </ThemedText>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = item.value === selectedValue;
                return (
                  <Pressable
                    style={[
                      styles.optionItem,
                      {
                        borderBottomColor: colorPalette.border,
                      },
                      isSelected && {
                        backgroundColor: colorPalette.backgroundElement,
                      }
                    ]}
                    onPress={() => {
                      onValueChange(item.value);
                      setModalVisible(false);
                    }}
                  >
                    <ThemedText
                      style={{
                        fontFamily: isSelected
                          ? Typography.fontFamily.semiBold
                          : Typography.fontFamily.regular,
                        color: isSelected ? colorPalette.primary : colorPalette.text,
                        fontSize: Typography.sizes.body,
                      }}
                    >
                      {item.label} {isSelected && '✓'}
                    </ThemedText>
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: Spacing.sixteen,
  },
  label: {
    fontSize: Typography.sizes.caption,
    marginBottom: Spacing.eight,
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.r12,
    paddingHorizontal: Spacing.twelve,
    height: 48,
  },
  errorText: {
    fontSize: Typography.sizes.caption - 1,
    color: '#EF4444',
    marginTop: Spacing.four,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.twentyFour,
  },
  modalContent: {
    width: '100%',
    maxHeight: 300,
    borderRadius: Radius.r16,
    padding: Spacing.eight,
  },
  modalHeader: {
    fontSize: Typography.sizes.h3,
    paddingVertical: Spacing.twelve,
    paddingHorizontal: Spacing.eight,
    borderBottomWidth: 1,
    textAlign: 'center',
  },
  optionItem: {
    paddingVertical: Spacing.sixteen,
    paddingHorizontal: Spacing.sixteen,
    borderBottomWidth: 0.5,
  },
});
