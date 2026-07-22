import React, { useState } from 'react';
import { View, StyleSheet, Pressable, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Answer } from '../types/auth';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { MathText } from './MathText';
import { answerService } from '../services/answerService';
import { Spacing, Colors, Typography, Radius } from '../constants/theme';
import { useTheme } from '../hooks/use-theme';

interface AnswerCardProps {
  answer: Answer;
  currentUserId: string | null;
  onRefresh: () => void;
  canAccept: boolean;
  onAccept: (answerId: string) => void;
  isAcceptedAnswer: boolean;
}

export const AnswerCard = React.memo(({
  answer,
  currentUserId,
  onRefresh,
  canAccept,
  onAccept,
  isAcceptedAnswer
}: AnswerCardProps) => {
  const theme = useTheme();
  const isDark = theme.text === '#FFFFFF';
  const colorPalette = isDark ? Colors.dark : Colors.light;

  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(answer.content);
  const [imageUrl, setImageUrl] = useState<string | null>(answer.image_url || null);
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isOwner = currentUserId !== null && answer.user_id === currentUserId && !isAcceptedAnswer;

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert('Se requieren permisos de galería para adjuntar una imagen.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLocalImageUri(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('Error picking image:', e);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    setLocalImageUri(null);
  };

  const handleSaveEdit = async () => {
    if (!content.trim()) {
      setErrorMsg('La explicación no puede estar vacía.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      let finalImageUrl = imageUrl;

      // Upload new image if selected
      if (localImageUri) {
        finalImageUrl = await answerService.uploadAnswerImage(localImageUri, answer.user_id);
      }

      await answerService.updateAnswer(answer.id, content, finalImageUrl);
      setIsEditing(false);
      setLocalImageUri(null);
      onRefresh();
    } catch (e: any) {
      console.error('Error updating answer:', e);
      setErrorMsg(e.message || 'Error al actualizar la respuesta.');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setContent(answer.content);
    setImageUrl(answer.image_url || null);
    setLocalImageUri(null);
    setIsEditing(false);
    setErrorMsg(null);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await answerService.deleteAnswer(answer.id);
      onRefresh();
    } catch (e: any) {
      console.error('Error deleting answer:', e);
      alert(e.message || 'Error al eliminar la respuesta.');
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    const title = '¿Eliminar solución?';
    const message = '¿Estás seguro de que deseas eliminar esta solución de forma permanente?';

    if (Platform.OS === 'web') {
      const yes = confirm(message);
      if (yes) handleDelete();
    } else {
      Alert.alert(title, message, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: handleDelete }
      ]);
    }
  };

  const handleConfirmAccept = () => {
    onAccept(answer.id);
  };

  const formattedDate = new Date(answer.created_at).toLocaleDateString();
  const formattedUpdateDate = answer.updated_at ? new Date(answer.updated_at).toLocaleDateString() : null;

  return (
    <ThemedView
      type="backgroundElement"
      style={[
        styles.card,
        { borderColor: theme.backgroundSelected },
        isAcceptedAnswer && { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.04)', borderWidth: 1.5 }
      ]}
    >
      
      {/* Header Info */}
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.eight, flexWrap: 'wrap' }}>
            <ThemedText type="smallBold" style={[styles.authorName, { color: colorPalette.primary }]}>
              👨‍🏫 {answer.user_name || 'Docente Experto'}
            </ThemedText>
            {isAcceptedAnswer && (
              <View style={styles.acceptedBadge}>
                <ThemedText style={{ color: '#10B981', fontSize: 9, fontFamily: Typography.fontFamily.semiBold }}>
                  ✓ Respuesta Aceptada
                </ThemedText>
              </View>
            )}
          </View>
          <View style={styles.dateRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Publicado el {formattedDate}
            </ThemedText>
            {answer.is_edited && (
              <ThemedText type="small" style={styles.editedIndicator}>
                • Editado ({formattedUpdateDate || formattedDate})
              </ThemedText>
            )}
          </View>
        </View>

        {isOwner && !isEditing && (
          <View style={styles.ownerActions}>
            <Pressable onPress={() => setIsEditing(true)} disabled={loading} style={styles.actionBtn}>
              <ThemedText style={styles.editBtnText}>Editar</ThemedText>
            </Pressable>
            <Pressable onPress={confirmDelete} disabled={loading} style={styles.actionBtn}>
              <ThemedText style={styles.deleteBtnText}>Eliminar</ThemedText>
            </Pressable>
          </View>
        )}
      </View>

      {/* Body: View vs Edit Mode */}
      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            multiline
            value={content}
            onChangeText={setContent}
            placeholder="Escribe tu explicación... Usa LaTeX como: $$ \int x dx $$"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.text }]}
            editable={!loading}
          />

          {/* Attachment Preview in Edit Mode */}
          {(localImageUri || imageUrl) && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: localImageUri || imageUrl! }} style={styles.previewImage} />
              <Pressable style={styles.removeImageBtn} onPress={handleRemoveImage}>
                <ThemedText style={styles.removeImageText}>✕ Quitar Imagen</ThemedText>
              </Pressable>
            </View>
          )}

          {errorMsg && (
            <ThemedText style={styles.errorText}>
              ⚠️ {errorMsg}
            </ThemedText>
          )}

          <View style={styles.editActionRow}>
            <Pressable style={[styles.imagePickBtn, { borderColor: theme.backgroundSelected }]} onPress={handlePickImage} disabled={loading}>
              <ThemedText style={styles.imagePickText}>🖼️ Cambiar Imagen</ThemedText>
            </Pressable>

            <View style={styles.rightActionGroup}>
              <Pressable style={[styles.cancelBtn, { borderColor: theme.backgroundSelected }]} onPress={cancelEdit} disabled={loading}>
                <ThemedText style={styles.cancelText}>Cancelar</ThemedText>
              </Pressable>

              <Pressable style={[styles.saveBtn, { backgroundColor: theme.text }]} onPress={handleSaveEdit} disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" color={theme.background} />
                ) : (
                  <ThemedText style={[styles.saveText, { color: theme.background }]}>Guardar</ThemedText>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.body}>
          <MathText text={answer.content} style={styles.mathText} />
          
          {answer.image_url && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: answer.image_url }}
                style={styles.answerImage}
                contentFit="contain"
              />
            </View>
          )}

          {loading && (
            <View style={styles.overlayLoading}>
              <ActivityIndicator size="small" color="#6366F1" />
            </View>
          )}
        </View>
      )}

      {/* Botón para Aceptar Solución Oficial */}
      {canAccept && (
        <Pressable
          style={({ pressed }) => [
            styles.acceptSolutionBtn,
            { backgroundColor: '#10B981', opacity: pressed ? 0.8 : 1 }
          ]}
          onPress={handleConfirmAccept}
          disabled={loading}
        >
          <ThemedText style={styles.acceptSolutionText}>
            ✓ Aceptar Solución Oficial
          </ThemedText>
        </Pressable>
      )}

    </ThemedView>
  );
});

AnswerCard.displayName = 'AnswerCard';

const styles = StyleSheet.create({
  card: {
    padding: Spacing.sixteen,
    borderRadius: Radius.r16,
    borderWidth: 1,
    marginBottom: Spacing.twelve,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.twelve,
  },
  authorName: {
    fontSize: 14,
  },
  acceptedBadge: {
    paddingHorizontal: Spacing.eight,
    paddingVertical: 2,
    borderRadius: Radius.r8,
    borderWidth: 1,
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.half,
  },
  editedIndicator: {
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: Spacing.one,
    fontStyle: 'italic',
  },
  ownerActions: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  actionBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  body: {
    position: 'relative',
  },
  mathText: {
    fontSize: 14,
    lineHeight: 20,
  },
  imageContainer: {
    marginTop: Spacing.three,
    borderRadius: Spacing.two,
    overflow: 'hidden',
    backgroundColor: 'rgba(150, 150, 150, 0.05)',
  },
  answerImage: {
    width: '100%',
    height: 200,
  },
  editContainer: {
    gap: Spacing.three,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    padding: Spacing.three,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: Spacing.one,
  },
  removeImageBtn: {
    paddingVertical: Spacing.one,
  },
  removeImageText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
  },
  editActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imagePickBtn: {
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  imagePickText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  rightActionGroup: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  cancelBtn: {
    borderWidth: 1,
    paddingHorizontal: Spacing.sixteen,
    paddingVertical: Spacing.eight,
    borderRadius: Radius.r16,
  },
  cancelText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  saveBtn: {
    paddingHorizontal: Spacing.sixteen,
    paddingVertical: Spacing.eight,
    borderRadius: Radius.r16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  saveText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  overlayLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptSolutionBtn: {
    marginTop: Spacing.sixteen,
    paddingVertical: Spacing.twelve,
    borderRadius: Radius.r16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptSolutionText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
