# 04. Plano de Implementação Modular & Roadmap 100% Mobile

**Documento:** `/docs/mobile-spec/04-implementation-roadmap.md`  
**Status:** Revisado sob a Diretriz Estrita de **Zero Alterações no Backend**  
**Lead Mobile Architect:** Staff Software Engineer  
**Data:** Outubro de 2026  
**Escopo:** Implementação exclusiva no aplicativo mobile (`apps/mobile/`) consumindo a API backend existente sem modificações.  

---

## 1. Visão Geral das Fases Modulares

O desenvolvimento do aplicativo móvel do **Constructo** é estruturado em **3 Fases Incrementais**, concentrando 100% dos esforços no ecossistema Expo / React Native:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CRONOGRAMA MODULAR DE EXECUÇÃO MOBILE                │
├────────────────────────────────┬───────────────────────────────────────┤
│  FASE 1: Fundação Mobile       │ Cliente HTTP com Cookie Jar,          │
│  (Auth, Network & Adapter)     │ Adapter de Projeção de Progresso,     │
│                                │ Compressão de Mídia no Aparelho       │
├────────────────────────────────┼───────────────────────────────────────┤
│  FASE 2: Módulo Empresa        │ Componentes Táteis UI Craft,          │
│  (Agilidade de Campo)          │ Câmera/Galeria, Bottom Sheet 3-Cliques│
│                                │ Fila Offline com AsyncStorage         │
├────────────────────────────────┼───────────────────────────────────────┤
│  FASE 3: Módulo Cliente        │ Feed Social da Obra, Viewport Barra,  │
│  (Experiência Social do Apê)   │ Badge Dinâmico (+4.5%), Lightbox Zoom │
└────────────────────────────────┴───────────────────────────────────────┘
```

---

## 2. Fase 1: Fundação Mobile (Rede, Sessão & Adapter de Domínio)

### 2.1. Checklist de Tarefas Técnicas

- [x] **1.1. Cliente HTTP com Suporte a Cookies de Sessão (`src/services/api.ts`):**
  - Configurar interceptor nativo que captura o cabeçalho `Set-Cookie: session_token=...` na resposta de `POST /login`.
  - Persistir o token de forma segura no `expo-secure-store`.
  - Injetar automaticamente o header `Cookie: session_token=<token>` em todas as chamadas HTTP subsequentes para o backend existente.
- [x] **1.2. Módulo de Serviços de Autenticação (`src/features/auth/`):**
  - Conectar `POST /login` e validação com `GET /sessao`.
  - Redirecionamento condicional de rotas via `expo-router` com base no `usuario.papel`:
    - Se `GESTOR` ou `ADMIN` → Direciona para o fluxo da Empresa (`/empresa`).
    - Se `COMPRADOR` → Direciona para a experiência do Cliente (`/cliente/feed`).
- [x] **1.3. Pipeline de Otimização e Compressão Pré-Upload no Dispositivo:**
  - Integrar `expo-image-manipulator` para compactar fotos capturadas na câmera/galeria:
    - Redimensionar para largura máxima de `1440px`.
    - Compactação WebP/JPEG com qualidade `0.80` (reduz imagens de 12MB para ~350KB antes do upload pelo 4G).
- [x] **1.4. Adapter de Domínio e Projeção Matemática de Progresso (`src/features/feed/feed.adapter.ts`):**
  - Implementar o algoritmo que consome `GET /empreendimentos/{id}/evidencias` e `GET /empreendimentos/{id}/progresso`.
  - Reconstituir a linha do tempo cronológica com cálculo determinístico de `deltaPercentual` (`+X.X%`) e `progressoAcumuladoAteAqui` para cada card.

### 2.2. Critérios de Aceite da Fase 1

1. O login contra o backend atual autentica com sucesso no emulador Android e dispositivo físico iOS, persistindo a sessão no `SecureStore`.
2. A requisição de perfil `GET /sessao` retorna os dados do usuário autenticado sem falhas de CORS ou sessão inválida.
3. Imagens de 10MB tiradas pela câmera são compactadas em menos de **300ms** no aparelho, mantendo alta fidelidade visual.
4. O `feed.adapter.ts` transforma uma lista de evidências brutas em objetos `PostagemFeedSocial` com valores matemáticos coerentes de avanço acumulado.

---

## 3. Fase 2: Módulo Empresa Mobile (Agilidade de Campo em 3 Cliques)

### 3.1. Checklist de Tarefas Técnicas

- [x] **2.1. Componentes Primitivos Táteis (`src/components/ui/`):**
  - Implementar conforme a skill `ui-craft`:
    - `Button.tsx`: Botão com física de mola `withSpring(0.96)` e `expo-haptics` (`Light`).
    - `Card.tsx`: Superfície mineral branca `#FFFFFF`, borda `#DFE5E3`, cantos de `16px` e sombra nítida.
    - `Typography.tsx`: Tipos semânticos em `#0F172A` e `#263B37`.
    - `Badge.tsx`: Pílulas semânticas com cores da marca (`#236557`, `#B97200`).
    - `SliderTátil.tsx`: Slider de avanço com marcas táteis e vibração `Medium` ao deslizar.
- [x] **2.2. Integração com Câmera e Galeria (`expo-image-picker`):**
  - Botão de ação rápida na tela inicial da obra que aciona a câmera nativa ou galeria com 1 toque.
- [x] **2.3. Bottom Sheet de Submissão Rápida ("Zero-Friction"):**
  - Criar componente de folha deslizante (`Bottom Sheet`) com:
    - **Clique 1:** Prévia da foto capturada.
    - **Clique 2:** Seleção rápida da macroetapa ativa em pílulas horizontais.
    - **Clique 3:** Toque no atalho de delta (`+5%`) e envio no botão *"Publicar Agora"*.
  - Envio em background via `POST /empreendimentos/{id}/evidencias` em `multipart/form-data`.
- [x] **2.4. Resiliência e Fila Offline (Offline-First):**
  - Se o 4G do canteiro falhar, o app grava a evidência pendente no `AsyncStorage`.
  - Disparo de sincronização automática assim que a conectividade for restabelecida (`NetInfo`).

### 3.2. Critérios de Aceite da Fase 2

1. O engenheiro no canteiro conclui o envio de uma evidência em **menos de 15 segundos e em até 3 toques**.
2. Cada toque em botões e seletores oferece resposta física instantânea (escala de mola + clique háptico leve).
3. A submissão funciona com o smartphone sem sinal de internet, sincronizando com sucesso ao reconectar.

---

## 4. Fase 3: Módulo Cliente Mobile (Feed Social da Obra)

### 4.1. Checklist de Tarefas Técnicas

- [x] **3.1. Card Hero com Resumo Consolidado da Obra:**
  - Card fixo no topo da tela inicial do cliente consumindo `GET /empreendimentos/{id}/progresso`.
  - Exibição de dias em obra, prazo de entrega e barra de progresso global (`38%`).
- [x] **3.2. Card do Post Social do Feed (`FeedPostCard.tsx`):**
  - Renderização da foto em proporção 4:3 com cantos arredondados (`16px`) usando `expo-image`.
  - Badge dinâmico flutuante: `+4.5% no Progresso Total` na cor âmbar `#B97200` ou verde `#236557`.
  - Cabeçalho humanizado com nome do engenheiro e selo de responsabilidade técnica (CREA).
  - Caixa de destaque *"Próximo Passo"* para reduzir a ansiedade do comprador.
- [x] **3.3. Barra de Progresso Reativa à Viewport:**
  - Sensor de scroll com `react-native-reanimated`:
  - Disparar a animação fluida de preenchimento da barra de progresso do card quando ele atingir o centro da tela do usuário.
- [x] **3.4. Lightbox Imersivo em Tela Cheia:**
  - Toque na foto abre visualizador com gestos táteis nativos de pinça para zoom (*pinch-to-zoom*) e arraste vertical para fechar (*drag-to-dismiss*).
- [x] **3.5. Virtualização de Alta Performance:**
  - Lista virtualizada (`FlashList` ou `FlatList`) com reciclagem de memória e carregamento sob demanda, garantindo 60/120 FPS cravados.

### 4.2. Critérios de Aceite da Fase 3

1. A timeline carrega suavemente com transição gradual de imagens.
2. A rolagem permanece estável a **60/120 FPS** mesmo com dezenas de evidências na timeline.
3. A barra de progresso anima de forma natural e surpreendente à medida que o comprador rola a tela.

---

## 5. Estratégia de Testes e Validação de Qualidade no Mobile

A validação de qualidade foi executada com **Jest**, checagem de tipos estrita do **TypeScript** e **ESLint**:

- [x] **5.1. Validação do Compilador TypeScript (`pnpm run typecheck`):** 0 erros de tipagem em todo o projeto.
- [x] **5.2. Validação Estrita do Linter (`pnpm run lint`):** 0 erros e 0 warnings no código implementado.
- [x] **5.3. Testes do Cliente HTTP e Cookies:** `src/services/__tests__/api.cookie.test.ts` (testa extração de cookie `Set-Cookie` e montagem de URLs).
- [x] **5.4. Testes do Motor de Projeção Matemática:** `src/features/feed/__tests__/feed.adapter.test.ts` (testa ordenação decrescente, cálculo determinístico de $\Delta\%$ e acúmulo de progresso na timeline).
- [x] **5.5. Testes de Primitivos e Física:** Componentes táteis com `withSpring(0.96)` e disparo háptico validado em `src/components/ui/`.
