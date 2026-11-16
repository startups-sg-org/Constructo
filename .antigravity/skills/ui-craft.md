# Skill: High-Craft Mobile UI (Anti-AI Slop) - Constructo Mobile

Diretrizes estéticas obrigatórias, física de movimento e restrições de design para o desenvolvimento do app mobile Expo / React Native do **Constructo**.

---

## 1. Proibições Estéticas Estritas (Anti-Padrões de IA)

- 🚫 **PROIBIDO gradientes lineares genéricos:** Nada de degradês roxo/azul/magenta ou fundos holográficos clichês de IA.
- 🚫 **PROIBIDO sombras esfumaçadas flutuantes:** Evite `shadowRadius > 10` com opacidades baixas sem definição. Cartões não devem flutuar no éter como se fossem sites genéricos de SaaS.
- 🚫 **PROIBIDO centralizar textos longos:** Textos informativos, descrições de obra e formulários devem ter alinhamento à esquerda consistente.
- 🚫 **PROIBIDO botões estáticos:** Não use `TouchableOpacity` cru sem resposta de escala. Todo elemento tátil deve reagir fisicamente à pressão do usuário.
- 🚫 **PROIBIDO cores puras de sistema:** Não use `red`, `blue`, `#000000` puro em textos ou cinzas azulados desconexos. Use estritamente os tokens de cor do Constructo.

---

## 2. Design Tokens Oficiais do Constructo (Light Mode Tátil)

O app do Constructo reflete precisão, engenharia civil e gestão de obras. As cores, superfícies e raios estão 100% alinhados com o `@theme` do Constructo:

### Paleta de Cores e Tokens
```ts
export const CONSTRUCTO_COLORS = {
  // Fundos e Superfícies
  background: '#F5F7F6',          // constructo-fundo-painel (off-white mineral)
  surface: '#FFFFFF',             // constructo-superficie (cartões elevados)
  surfaceSubtle: '#F8FAF9',       // constructo-superficie-sutil (linhas/containers)
  
  // Marca e Ação
  primary: '#236557',             // constructo-primaria (Verde Floresta Industrial)
  primaryPressed: '#194F45',      // constructo-primaria-hover
  accent: '#B97200',              // constructo-destaque (Âmbar / Ocre de medições e alertas)
  
  // Bordas Estruturadas
  border: '#DFE5E3',              // constructo-borda (borda padrão sutil de 1px)
  borderStrong: '#B9CDC7',        // constructo-borda-forte (foco / divisores)
  
  // Tipografia
  textStrong: '#153B36',          // constructo-texto-forte (títulos, métricas)
  text: '#263B37',                // constructo-texto (corpo de texto)
  textMuted: '#62706D',           // constructo-texto-suave (legendas e metadados)
  
  // Estados Semânticos
  success: '#147A55',             // constructo-sucesso
  successBg: '#E8F7F0',           // constructo-sucesso-fundo
  warning: '#9A5B0A',             // constructo-alerta
  warningBg: '#FEF3C7',           // constructo-alerta-fundo
  error: '#A0443B',               // constructo-erro
  errorBg: '#FCECEA',             // constructo-erro-fundo
} as const;

export const CONSTRUCTO_METRICS = {
  radiusField: 10,                // radius-campo (inputs, botões secundários)
  radiusCard: 16,                 // radius-card (cartões e modais)
  radiusPill: 9999,               // badges e tags
} as const;
```

### Bordas e Elevação Tátil
- **Cartões e Containers:**
  - `borderWidth: 1`
  - `borderColor: CONSTRUCTO_COLORS.border` (`#DFE5E3`)
  - `borderRadius: CONSTRUCTO_METRICS.radiusCard` (`16`)
  - Sombra sutil e densa:
    ```ts
    shadowColor: '#0F2A27',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    ```
- **Inputs e Campos:**
  - `borderRadius: CONSTRUCTO_METRICS.radiusField` (`10`)
  - `borderWidth: 1`
  - `borderColor: CONSTRUCTO_COLORS.border` (`#DFE5E3`)
  - Foco: borda muda para `CONSTRUCTO_COLORS.primary` (`#236557`) ou `borderStrong` (`#B9CDC7`)

---

## 3. Física e Micro-interações (React Native Reanimated)

### Botões "Squishy" (Física de Mola Real)
Todo botão primário ou card clicável deve utilizar `Pressable` associado a animação de mola do `react-native-reanimated`:
```tsx
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

// Ao pressionar (onPressIn):
scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });

// Ao soltar (onPressOut):
scale.value = withSpring(1, { damping: 15, stiffness: 300 });
```

### Entrada em Cascata (Staggered Entrance)
Listas de evidências, obras e cartões de resumo nunca devem surgir estáticos:
```tsx
import { FadeInDown } from 'react-native-reanimated';

// No item de lista com índice:
<Animated.View entering={FadeInDown.delay(index * 45).springify().damping(16)}>
  {/* Conteúdo */}
</Animated.View>
```

### Feedback Tátil
- Utilize `expo-haptics` em ações confirmatórias, trocas de abas e exclusões:
  `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`.

---

## 4. Tipografia e Ritmo Espacial

- **Escala de Espaçamento:** Múltiplos estritos de 4 (`4, 8, 12, 16, 20, 24, 32`).
- **Padding de Cartão:** Nunca inferior a `16` (ideal: `16` ou `20`).
- **Hierarquia:**
  - **Títulos de Tela:** `fontSize: 24` a `28`, `fontWeight: '700'`, `letterSpacing: -0.6`, cor `#153B36`.
  - **Overline / Seções:** `fontSize: 11`, `fontWeight: '700'`, caixa alta (`uppercase`), `letterSpacing: 1.2`, cor `#62706D`.
  - **Valores Métricos / Numéricos:** `fontSize: 20` ou `24`, `fontWeight: '700'`, cor `#153B36`.

---

## 5. Regra dos "Componentes Primitivos Trancados"

Nas telas de funcionalidade (`src/app/` ou `src/features/`):
- ⚠️ **É PROIBIDO** criar botões, inputs ou cartões do zero com `<TouchableOpacity>` ou `<View>` estilizado manualmente.
- ✅ **OBRIGATÓRIO** importar exclusivamente de `@/components/ui/`:
  - `Button` (já encapsula a física squishy, loading e variações primária/secundária/ghost)
  - `Card` (já possui borda de 1px, raio 16, cor de fundo e sombra tátil)
  - `Typography` (Title, Text, Caption, Metric)
  - `Input` (estados de foco com borda verde floresta `#236557` e label limpo)
  - `Badge` (estados semânticos de evidência/obra: rascunho, pendente, aprovado)

---

## 6. Tradução UX: Web -> Mobile Nativo

Ao migrar qualquer tela ou fluxo da versão Web do Constructo:
1. **Modais Web viram Bottom Sheets:** Nunca use modais flutuantes centralizados no mobile; utilize Bottom Sheet deslizante com *snap points*.
2. **Hover vira Press + Scale:** Todo efeito de `:hover` do CSS deve ser traduzido em resposta tátil (`Pressable` + mola).
3. **Tabelas viram Lista de Cards Ricos:** Nunca use scroll horizontal para tabelas de medições ou evidências. Converta cada linha em um cartão compacto com cabeçalho (título e status badge) e rodapé com valores e datas.
4. **Filtros e Ações Secundárias:** Devem ficar em Chips horizontais no topo com scroll horizontal ou dentro de um Bottom Sheet de filtros.
