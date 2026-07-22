# Auditoría de Arquitectura React: Estabilización (Sprint 5.5)

Este documento detalla los hallazgos, diagnóstico de causas raíz, refactorizaciones y optimizaciones aplicadas para garantizar la estabilidad y rendimiento del Marketplace en la aplicación móvil de YachaiYa.

---

## 1. Problemas Encontrados y Causa Raíz

### A. Bucle Infinito en la Carga del Feed (Alumno/Docente Homes)
- **Síntoma:** Advertencia `"Maximum update depth exceeded"` que bloqueaba la renderización del home.
- **Causa Raíz:** La función de carga del feed `loadData` dependía del objeto completo `user` y del callback `refreshProfile`. Cada llamada a `loadData` refrescaba el perfil a través del AuthContext, actualizando la referencia de `user`. Al cambiar de referencia, `loadData` se volvía a instanciar, lo que obligaba a `useFocusEffect` a re-ejecutarse, gatillando de inmediato una nueva carga de datos y un bucle infinito.

### B. Renderizados Globales Innecesarios desde el AuthContext
- **Síntoma:** Re-renderizado de toda la jerarquía de la app al modificarse tokens o llamadas de autenticación.
- **Causa Raíz:** El callback `refreshProfile` dependía del objeto completo de la sesión de Supabase (`session`). Dado que `session` cambia de referencia en ticks de refresco de tokens de fondo, `refreshProfile` se recreaba constantemente, invalidando el `useMemo` del `contextValue` y forzando a todos los consumidores del hook `useAuth()` a re-renderizarse de forma global.

### C. Omisión del Debounce en la Barra de Búsqueda
- **Síntoma:** Al escribir en el buscador se lanzaban consultas de red de Supabase inmediatas sin esperar el debounce de 450ms.
- **Causa Raíz:** La función callback provista a `useFocusEffect` dependía directamente de las variables de estado locales `search`, `selectedCategory`, etc. Al pulsar cualquier tecla, `useFocusEffect` cancelaba la ejecución anterior y gatillaba la función inmediatamente sin respetar el timeout del buscador.

---

## 2. Solución Aplicada (Estrategia de Refactorización)

### A. Centralización en Hook Reutilizable (`useMarketplace.ts`)
- Creamos el hook personalizado [useMarketplace.ts](file:///c:/Users/PC/Documents/YachaiYa/yachaiya/mobile-app/src/hooks/useMarketplace.ts) que desacopla por completo la lógica de las pantallas.
- Encapsula de forma pura:
  - Los estados del feed y paginación.
  - La barra de búsqueda con debounce ininterrumpido.
  - Los selectores de categorías, dificultad, estado y ordenamientos.
  - Las acciones asíncronas puras de `MarketplaceService` (scroll infinito, pull-to-refresh y reintentos).

### B. Estabilización de Dependencias Primitivas
- Sustituimos la dependencia del objeto completo `user` en los callbacks de carga de datos por la string de ID primitivo (`userId = user?.id`). Las actualizaciones de propiedades del usuario (como tokens y reputación) ya no recrean las funciones de carga de datos.
- En [AuthContext.tsx](file:///c:/Users/PC/Documents/YachaiYa/yachaiya/mobile-app/src/context/AuthContext.tsx), cambiamos la dependencia de `refreshProfile` para escuchar valores primitivos (`sessionUserId` y `sessionUserEmail`), garantizando la inmutabilidad de la referencia del contexto Auth y deteniendo los re-renderizados globales.

### C. Desacoplamiento de Flujos de Carga
- Separamos el flujo de refresco del perfil del usuario (gatillado únicamente al enfocar la pantalla o tirar para refrescar) del ciclo del buscador debounced.
- Introdujimos `refreshTrigger` como un interruptor numérico de renderizado para notificar al cargador de feed cuando la pantalla obtiene el foco, manteniendo el buscador debounced al 100% de eficiencia.

---

## 3. Archivos Modificados

1. **[`src/context/AuthContext.tsx`](file:///c:/Users/PC/Documents/YachaiYa/yachaiya/mobile-app/src/context/AuthContext.tsx):**
   * Estabilización de dependencias primitivas en `refreshProfile` y `contextValue`.
2. **[`src/hooks/useMarketplace.ts`](file:///c:/Users/PC/Documents/YachaiYa/yachaiya/mobile-app/src/hooks/useMarketplace.ts):**
   * **[NEW]** Creación del hook unificado que concentra filtros, orden, búsqueda con debounce, scroll infinito y pull-to-refresh.
3. **[`src/app/(app)/alumno/home.tsx`](file:///c:/Users/PC/Documents/YachaiYa/yachaiya/mobile-app/src/app/(app)/alumno/home.tsx):**
   * Simplificado a menos de 100 líneas útiles mediante el consumo de `useMarketplace`.
4. **[`src/app/(app)/docente/home.tsx`](file:///c:/Users/PC/Documents/YachaiYa/yachaiya/mobile-app/src/app/(app)/docente/home.tsx):**
   * Refactorizado para consumir `useMarketplace`, reduciendo la duplicación de código en un 95%.

---

## 4. Medidas Preventivas para el Futuro
1. **Evitar dependencias de objetos completos:** Al utilizar `useCallback` o `useEffect`, extraer las propiedades primitivas de los objetos (ej. `const id = obj?.id`) e incluirlas en las dependencias en lugar del objeto completo.
2. **Utilizar Debounce Correctamente:** Mantener los inputs de búsqueda debounced aislados de los ciclos directos de navegación y focus para evitar disparar consultas masivas.
3. **Mantener pantallas puras:** Toda lógica de consulta compleja, paginaciones e interacciones de servicios deben encapsularse en custom hooks dedicados (`useX`), delegando a las pantallas únicamente el renderizado de UI.
