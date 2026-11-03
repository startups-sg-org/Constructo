---
name: ui-craft
description: Diretrizes de design system, micro-interações táteis e componentes primitivos para o mobile (Expo/React Native) do Constructo sem vícios visuais de IA.
---

# UI Craft: High-Craft Mobile UI (Constructo Mobile)

Use esta skill para criar ou refatorar telas e componentes no aplicativo mobile Expo/React Native do Constructo.

## 1. Anti-Padrões Proibidos (Anti-AI Slop)
- 🚫 **PROIBIDO gradientes lineares genéricos:** Nada de degradês roxo/azul/magenta ou fundos cósmicos/neon de IA.
- 🚫 **PROIBIDO sombras esfumaçadas excessivas:** Evite `shadowRadius > 10` sem nitidez.
- 🚫 **PROIBIDO centralizar textos longos:** Formulários, cartões informativos e relatórios de obra devem ter alinhamento à esquerda.
- 🚫 **PROIBIDO botões estáticos:** Não use `TouchableOpacity` sem escala física.
- 🚫 **PROIBIDO cores desconectadas:** Não invente tons de cinza ou azuis padrão. Use estritamente a paleta do Constructo.

## 2. Paleta Oficial do Constructo (Alinhada ao @theme)
- **Fundo da Tela (`constructo-fundo-painel`):** `#F5F7F6` (off-white mineral)
- **Superfície dos Cards (`constructo-superficie`):** `#FFFFFF` (branco puro elevado)
- **Superfície Secundária (`constructo-superficie-sutil`):** `#F8FAF9`
- **Primária / Ação Principal (`constructo-primaria`):** `#236557` (Verde Floresta Industrial)
- **Primária Pressionada (`constructo-primaria-hover`):** `#194F45`
- **Destaque/Acento (`constructo-destaque`):** `#B97200` (Âmbar / Ocre de obra)
- **Borda Padrão (`constructo-borda`):** `#DFE5E3` (1px sólido)
- **Borda de Foco (`constructo-borda-forte`):** `#B9CDC7`
- **Texto Principal (`constructo-texto`):** `#263B37`
- **Texto Forte (`constructo-texto-forte`):** `#153B36`
- **Texto Secundário / Rótulos (`constructo-texto-suave`):** `#62706D`
- **Raios Padrão:** `radiusField: 10px` (inputs e botões), `radiusCard: 16px` (cartões)

## 3. Física de Micro-interações
- **Botões e Cards Clicáveis:** Sempre usar `Pressable` com `react-native-reanimated`.
  - `onPressIn`: `scale.value = withSpring(0.96, { damping: 15, stiffness: 300 })`
  - `onPressOut`: `scale.value = withSpring(1, { damping: 15, stiffness: 300 })`
- **Listas e Grids:** Usar entrada em cascata com `FadeInDown.delay(index * 45).springify().damping(16)`.
- **Haptics:** Integrar com `expo-haptics` (`Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`) em ações principais.

## 4. Componentes Primitivos Trancados
Nas telas em `apps/mobile/src/`:
- **NUNCA** crie botões ou cards manuais soltos com `<TouchableOpacity>` ou `<View>` customizados.
- **SEMPRE** importe de `@/components/ui/`: `Button`, `Card`, `Typography`, `Input`, `Badge`.

## 5. Tradução Web -> Mobile
- Modais viram **Bottom Sheets** deslizantes.
- Tabelas viram **Cards Verticais** enriquecidos com status badge e hierarquia clara.
- Hover vira toque com resposta de escala e haptic feedback.
