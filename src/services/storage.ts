import { supabase } from './supabase';
import { Platform } from 'react-native';

const BUCKET_NAME = 'math-attachments';

/**
 * Servicio para gestionar la carga de fotos de ejercicios matemáticos
 * y diagramas en las respuestas utilizando Supabase Storage.
 * 
 * Bucket Requerido en Supabase: "math-attachments"
 * Configuración recomendada del Bucket:
 * - Public: Habilitado (Lectura libre de imágenes).
 * - Políticas de RLS de Storage:
 *   1. "Permitir lectura pública a cualquiera": select -> true
 *   2. "Permitir inserción solo a usuarios autenticados": insert -> auth.role() = 'authenticated'
 *   3. "Permitir borrado al dueño del archivo": delete -> auth.uid() = owner
 */
export const StorageService = {
  /**
   * Sube una imagen desde el dispositivo móvil al bucket de Supabase.
   * @param localUri Ruta local del archivo (de expo-image-picker, por ejemplo).
   * @param userId ID del usuario que sube el archivo (para organizar carpetas).
   * @returns URL pública del archivo subido o error.
   */
  uploadMathAttachment: async (localUri: string, userId: string): Promise<{ url: string | null; error: any }> => {
    try {
      const fileName = `${userId}/${Date.now()}_${localUri.split('/').pop()}`;

      let fileBody: any;

      if (Platform.OS === 'web') {
        // En entorno web, podemos subir directamente el blob o file
        const response = await fetch(localUri);
        fileBody = await response.blob();
      } else {
        // En entorno móvil nativo (iOS/Android), convertimos la imagen a un formato compatible
        const response = await fetch(localUri);
        const blob = await response.blob();
        fileBody = blob;
      }

      // Detectar content type según la extensión del archivo para soportar PDFs, SVG y múltiples formatos
      let contentType = 'image/jpeg';
      const extension = localUri.split('.').pop()?.toLowerCase();
      if (extension === 'pdf') {
        contentType = 'application/pdf';
      } else if (extension === 'png') {
        contentType = 'image/png';
      } else if (extension === 'svg') {
        contentType = 'image/svg+xml';
      } else if (extension === 'gif') {
        contentType = 'image/gif';
      }

      // 1. Subir el archivo al bucket
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, fileBody, {
          cacheControl: '3600',
          upsert: false,
          contentType: contentType
        });

      if (error) {
        throw error;
      }

      // 2. Generar y retornar la URL pública del archivo
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

      return { url: publicUrl, error: null };

    } catch (error: any) {
      console.error('Error al subir imagen a Supabase Storage:', error);
      return { url: null, error: error.message || error };
    }
  },

  /**
   * Elimina un archivo del bucket
   * @param filePath Ruta del archivo dentro del bucket (ej. "userId/filename.jpg")
   */
  deleteMathAttachment: async (filePath: string): Promise<{ success: boolean; error: any }> => {
    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error al borrar imagen de Supabase Storage:', error);
      return { success: false, error: error.message || error };
    }
  }
};
