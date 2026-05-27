import React, { useState, useEffect } from 'react';
import { View, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../hooks/use-theme';

// Cargar WebView de forma condicional para evitar crashes en Web
let WebView: any = null;
if (Platform.OS !== 'web') {
  try {
    WebView = require('react-native-webview').WebView;
  } catch (e) {
    console.warn('react-native-webview no se pudo cargar en esta plataforma.');
  }
}

interface MathTextProps {
  text: string;
  fontSize?: number;
  color?: string;
  style?: any;
}

export function MathText({ text, fontSize = 15, color, style }: MathTextProps) {
  const theme = useTheme();
  const [height, setHeight] = useState(40);
  const [loading, setLoading] = useState(true);

  const activeColor = color || theme.text;

  // Escapar caracteres especiales para inyección HTML segura
  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // Convertir saltos de línea de texto a formato HTML
  const formatTextToHtml = (rawText: string) => {
    // No escapamos todo si contiene LaTeX, pero reemplazamos saltos de línea por <br/>
    return rawText.replace(/\n/g, '<br/>');
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
      <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: ${fontSize}px;
          color: ${activeColor};
          background-color: transparent;
          margin: 0;
          padding: 0;
          word-wrap: break-word;
          overflow: hidden;
        }
        .math-container {
          padding: 4px 2px;
          line-height: 1.5;
        }
        /* Ajuste de fórmulas matemáticas */
        .katex-display {
          margin: 0.5em 0;
          overflow-x: auto;
          overflow-y: hidden;
        }
      </style>
    </head>
    <body>
      <div class="math-container" id="content">${formatTextToHtml(text)}</div>
      <script>
        function triggerMathRender() {
          try {
            renderMathInElement(document.getElementById("content"), {
              delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false},
                {left: "\\\\(", right: "\\\\)", display: false},
                {left: "\\\\[", right: "\\\\]", display: true}
              ],
              throwOnError: false
            });
          } catch (e) {
            console.error(e);
          }
          
          // Calcular la altura real ocupada por el contenido y notificar
          setTimeout(function() {
            var contentDiv = document.getElementById("content");
            var height = contentDiv.offsetHeight || contentDiv.scrollHeight;
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ height: height }));
            } else {
              // Web Iframe fallback
              parent.postMessage(JSON.stringify({ height: height, id: 'math-iframe' }), "*");
            }
          }, 150);
        }

        if (document.readyState === 'complete') {
          triggerMathRender();
        } else {
          document.addEventListener("DOMContentLoaded", triggerMathRender);
        }
      </script>
    </body>
    </html>
  `;

  // Listener de altura en Web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleWebMessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.id === 'math-iframe' && data.height) {
            setHeight(data.height + 15);
            setLoading(false);
          }
        } catch (e) { }
      };
      window.addEventListener('message', handleWebMessage);
      return () => window.removeEventListener('message', handleWebMessage);
    }
  }, []);

  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.height) {
        setHeight(data.height + 15);
        setLoading(false);
      }
    } catch (e) { }
  };

  if (Platform.OS === 'web') {
    // Fallback de Iframe nativo en entorno web para máxima fidelidad
    return (
      <View style={[styles.container, style, { height: height }]}>
        <iframe
          srcDoc={htmlContent}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            overflow: 'hidden',
            backgroundColor: 'transparent',
          }}
          scrolling="no"
        />
      </View>
    );
  }

  if (!WebView) {
    // Fallback si no está disponible la librería (ej. compilación fallida)
    return null;
  }

  return (
    <View style={[styles.container, style, { height: height }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webView}
        scrollEnabled={false}
        onMessage={onMessage}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onLoadEnd={() => setLoading(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
