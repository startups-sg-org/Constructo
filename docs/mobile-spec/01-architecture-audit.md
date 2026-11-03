# 01. Auditoria de Arquitetura: Integração Mobile com Backend Imutável

**Documento:** `/docs/mobile-spec/01-architecture-audit.md`  
**Status:** Revisado sob a Diretriz Estrita de **Zero Alterações no Backend**  
**Lead Mobile Architect:** Staff Software Engineer  
**Data:** Outubro de 2026  
**Stack de Destino:** Expo SDK 57 • React Native 0.86 • React 19 • Reanimated 4.5.1  
**Backend Existente (Imutável):** FastAPI (Python 3.12) • SQLAlchemy 2.0 • PostgreSQL • Local Storage  

---

## 1. Diretriz Soberana: Backend como Caixa-Preta Imutável

> ⚠️ **PREMISSA FUNDAMENTAL:**  
> O código do backend (`apps/backend/`), as migrações do banco de dados (Alembic) e os schemas existentes em Python **não serão modificados**.  
> Todas as funcionalidades do aplicativo mobile — tanto a **Visão da Empresa (3 cliques de campo)** quanto a **Visão do Cliente (Feed Social com impacto percentual)** — serão viabilizadas por meio de uma **Camada de Adaptação e Projeção no Aplicativo Mobile (Mobile Client Adapter / Orchestrator)** que consome estritamente as APIs REST existentes.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   APLICATIVO MOBILE (EXPO / REACT NATIVE)              │
├───────────────────────────────────┬────────────────────────────────────┤
│   Visão Empresa (3 Cliques)       │    Visão Cliente (Feed Social)     │
│   - Compressão de Mídia no Device │    - Feed com Badges de Impacto    │
│   - Resolução Automática de IDs   │    - Barra de Progresso na Viewport│
├───────────────────────────────────┴────────────────────────────────────┤
│        Camada de Orquestração & Projeção Client-Side (TypeScript)      │
│        - Gerenciador de Sessão (CookieJar nativo no SecureStore)       │
│        - Cálculo de Delta e Progresso Acumulado sobre a Taxonomia      │
│        - Virtualização de Timeline com Cache Local                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                  Chamadas HTTP com Cookie de Sessão
                  (Consumo 100% das rotas atuais)
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               BACKEND CONSTRUCTO EXISTENTE (SEM ALTERAÇÃO)             │
│  • POST /login (Cookie session_token)                                  │
│  • GET  /sessao                                                        │
│  • GET  /empreendimentos e /empreendimentos/{id}/progresso             │
│  • GET  /empreendimentos/{id}/taxonomia/etapas e /marcos               │
│  • POST /empreendimentos/{id}/evidencias (multipart/form-data)         │
│  • GET  /empreendimentos/{id}/evidencias                               │
│  • GET  /uploads/{arquivo_url} (arquivos estáticos)                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Mapeamento das Rotas Existentes Consumidas pelo Mobile

O backend existente disponibiliza um conjunto completo de operações que o mobile utilizará diretamente:

### 2.1. Autenticação e Sessão (`modulos/usuarios/rotas.py`)
- `POST /login`:
  - Recebe JSON: `{ "email": "...", "senha": "..." }`.
  - Retorna `200 OK` com `LoginReturn` e envia o cabeçalho `Set-Cookie: session_token=<token>; Max-Age=...`.
  - **Estratégia Mobile:** O cliente HTTP do mobile intercepta o header `Set-Cookie`, persiste o token no `Expo SecureStore` e injeta automaticamente `Cookie: session_token=<token>` em todas as requisições subsequentes.
- `GET /sessao`:
  - Valida o cookie e retorna os dados do usuário autenticado ([`Usuario`](file:///c:/Users/srric/Documents/Constructo/apps/backend/src/backend/modulos/usuarios/modelos.py#L9)): `id`, `nome`, `email`, `papel` (`'GESTOR'` ou `'COMPRADOR'`).
  - Permite ao mobile direcionar imediatamente para o fluxo da Empresa ou do Cliente.

### 2.2. Gestão de Obras e Taxonomia (`modulos/dominio/rotas.py`)
- `GET /empreendimentos`:
  - Retorna as obras vinculadas ao gestor ou as obras do comprador.
- `GET /empreendimentos/{id}`:
  - Detalhes cadastrais da obra (nome, endereço, status).
- `GET /empreendimentos/{id}/taxonomia/etapas`:
  - Lista de etapas e subetapas cadastradas para a obra.
- `GET /empreendimentos/{id}/taxonomia/etapas/{etapa_id}/marcos`:
  - Marcos e entregáveis associados a cada etapa.
- `GET /empreendimentos/{id}/progresso`:
  - Retorna o percentual global consolidado da obra e o percentual de cada etapa:
    ```json
    {
      "empreendimento_id": 14,
      "percentual": 38,
      "etapas": [
        { "etapa_id": 1, "nome": "Fundação", "percentual": 100 },
        { "etapa_id": 2, "nome": "Estrutura", "percentual": 60 }
      ]
    }
    ```
- `GET /empreendimentos/{id}/locais`:
  - Árvore de locais físicos (`TORRE` → `BLOCO` → `PAVIMENTO` → `UNIDADE`).

### 2.3. Registro e Consulta de Evidências (`modulos/evidencias/routes.py`)
- `POST /empreendimentos/{empreendimento_id}/evidencias`:
  - Envia formulário `multipart/form-data`:
    - `file`: Arquivo de imagem.
    - `local_obra_id`: ID do local físico.
    - `marco_id`: ID do marco associado.
    - `descricao_tecnica`: Texto descritivo / legenda da evidência.
    - `capturado_em`: Data e hora da foto.
    - `item_protocolo_id`: (opcional).
- `GET /empreendimentos/{empreendimento_id}/evidencias`:
  - Lista as evidências cadastradas com filtros opcionais por data e marco.
  - Cada item contém: `id`, `arquivo_url`, `descricao_tecnica`, `capturado_em`, `capturado_por`, `marco_id`, `local_obra_id`.
- `GET /uploads/...`:
  - Servidor de arquivos estáticos montado em `apps/backend/uploads/`, servindo as fotos da obra.

---

## 3. Como o Mobile Resolve os Desafios sem Tocar no Backend

A tabela a seguir demonstra a resolução puramente client-side para cada requisito de negócio:

| Requisito de Negócio | Limitação do Backend Atual | Solução no Aplicativo Mobile (Zero Backend Changes) |
| :--- | :--- | :--- |
| **1. Autenticação Mobile** | Backend espera `Cookie: session_token=...` e não retorna token no corpo JSON. | **Cookie Interceptor no Mobile:** O cliente HTTP nativo (`services/api.ts`) extrai o token do `Set-Cookie` no login, armazena no `Expo SecureStore` e injeta o header `Cookie` em todas as requisições. |
| **2. Envio Rápido em 3 Cliques** | `POST /evidencias` exige `local_obra_id` e `marco_id` específicos. | **Auto-Resolução Contextual:** O app carrega em background a lista de etapas/marcos ativos da obra. Na tela de envio, o engenheiro apenas escolhe a etapa; o app infere o marco ativo e o local raiz da obra automaticamente. |
| **3. Badge de Impacto (`+4.5%`)** | O backend não armazena a coluna `delta_progresso`. | **Projeção Matemática de Taxonomia:** Sabendo que a obra possui $N$ marcos na taxonomia (`GET /taxonomia/...`), cada marco entregue representa exatamente $\Delta = \frac{100}{N}\%$. O mobile calcula e projeta o badge `+X% no Progresso Total` na renderização do post. |
| **4. Barra Acumulada no Feed** | O backend não armazena o progresso histórico por foto. | **Linha do Tempo Reconstitutiva:** O app ordena as evidências por `capturado_em` e calcula o progresso acumulado até o instante de cada foto, animando a barra suavemente quando o card entra na viewport. |
| **5. Otimização de Mídia** | O backend salva imagens brutas de até 5MB sem redimensionar. | **Compressão Pré-Upload no Device:** O app mobile utiliza `expo-image-manipulator` antes do envio, redimensionando a foto para `1440px` com qualidade 80% WebP/JPEG, enviando um arquivo de apenas ~350KB pelo 4G. |
| **6. Paginação do Feed** | O backend lista evidências sem paginação por cursor. | **Virtualização Otimizada (`FlashList`):** O app consome a listagem e executa paginação em memória no dispositivo com renderização sob demanda e reciclagem de células a 60 FPS estáveis. |

---

## 4. Conclusão da Auditoria

O backend existente em FastAPI é **robusto e autossuficiente** para suportar integralmente o aplicativo mobile. Toda a inteligência de apresentação (transformação de evidências técnicas brutas em uma timeline social com cards de impacto e microinterações de campo em 3 cliques) será encapsulada na camada de **Domínio e Serviços do Mobile**, preservando a integridade e estabilidade do backend em produção.
