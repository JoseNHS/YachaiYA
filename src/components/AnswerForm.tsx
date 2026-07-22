import React, { useState, useRef } from 'react';
import { View, StyleSheet, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { answerService } from '../services/answerService';
import { Spacing } from '../constants/theme';
import { useTheme } from '../hooks/use-theme';

interface AnswerFormProps {
  questionId: string;
  userId: string;
  onSuccess: () => void;
}

export function AnswerForm({ questionId, userId, onSuccess }: AnswerFormProps) {
  const theme = useTheme();

  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Keep track of the last submitted answer content to prevent duplicates consecutively
  const lastSubmittedContent = useRef<string>('');

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
        setImageUri(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('Error selecting image:', e);
    }
  };

  const handleRemoveImage = () => {
    setImageUri(null);
  };

  const handleSubmit = async () => {
    setErrorMsg(null);

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      setErrorMsg('La explicación no puede estar vacía.');
      return;
    }

    if (trimmedContent.length < 30) {
      setErrorMsg('La explicación debe contener al menos 30 caracteres.');
      return;
    }

    if (trimmedContent === lastSubmittedContent.current) {
      setErrorMsg('No puedes enviar múltiples respuestas idénticas consecutivas.');
      return;
    }

    setLoading(true);
    try {
      let imageUrl: string | null = null;

      // 1. Upload image to Storage if selected
      if (imageUri) {
        imageUrl = await answerService.uploadAnswerImage(imageUri, userId);
      }

      // 2. Submit answer via answerService
      await answerService.createAnswer(questionId, trimmedContent, imageUrl);

      // Save to ref to avoid consecutive duplicates
      lastSubmittedContent.current = trimmedContent;

      // Clean up form states
      setContent('');
      setImageUri(null);
      onSuccess();
    } catch (e: any) {
      console.error('Error submitting answer:', e);
      setErrorMsg(e.message || 'Error al enviar la respuesta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView type="backgroundElement" style={[styles.container, { borderColor: theme.backgroundSelected }]}>
      <ThemedText type="smallBold" style={styles.title}>
        🎓 Proponer una Solución
      </ThemedText>

      <TextInput
        multiline
        value={content}
        onChangeText={setContent}
        placeholder="Explica el desarrollo detalladamente... Puedes usar notación LaTeX: $$ \lim_{x \to 0} \frac{\sin(x)}{x} = 1 $$"
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.text }]}
        editable={!loading}
      />

      {imageUri && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <Pressable style={styles.removeImageBtn} onPress={handleRemoveImage} disabled={loading}>
            <ThemedText style={styles.removeImageText}>✕ Quitar Imagen</ThemedText>
          </Pressable>
        </View>
      )}

      {errorMsg && (
        <ThemedText style={styles.errorText}>
          ⚠️ {errorMsg}
        </ThemedText>
      )}

      <View style={styles.actionRow}>
        <Pressable
          style={({ pressed }) => [
            styles.pickBtn,
            { borderColor: theme.backgroundSelected, opacity: pressed ? 0.7 : 1 }
          ]}
          onPress={handlePickImage}
          disabled={loading}
        >
          <ThemedText style={styles.pickText}>📸 Adjuntar Imagen</ThemedText>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.submitBtn,
            { backgroundColor: theme.text, opacity: (pressed || loading) ? 0.75 : 1 }
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.background} />
          ) : (
            <ThemedText style={[styles.submitText, { color: theme.background }]}>
              Enviar Solución
            </ThemedText>
          )}
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    borderWidth: 1,
    marginTop: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    padding: Spacing.three,
    fontSize: 14,
    minHeight: 120,
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
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickBtn: {
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  pickText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  submitBtn: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 110,
    height: 38,
  },
  submitText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
