# Especificação de DTOs e Payloads: Filtros de Evidências

Este documento especifica os DTOs (Data Transfer Objects), schemas de validação, payloads de requisição/resposta e regras de integração para atender conjuntamente às issues:

- **Issue #223**: [Filtrar evidências por local](https://github.com/startups-sg-org/Constructo/issues/223)
- **Issue #224**: [Filtrar evidências por etapa](https://github.com/startups-sg-org/Constructo/issues/224)
- **Issue #225**: [Filtrar evidências por período](https://github.com/startups-sg-org/Constructo/issues/225)

---

## 1. Visão Geral da Arquitetura

O sistema é um monorepo composto por:
- **Backend**: FastAPI + Pydantic v2 + SQLAlchemy (Async) + PostgreSQL (`apps/backend` nas branches de evidências / PRs #230 e #231).
- **Frontend**: React 19 + TypeScript + Vite (`apps/web`).
- **Pacotes Compartilhados**: TypeScript + Zod (`packages/shared`).

As evidências fotográficas e documentais de obra estão vinculadas simultaneamente à **estrutura física** (`LocalObra`), à **taxonomia construtiva** (`Marco` -> `Etapa`) e a um **instante temporal** (`capturado_em`).

```
                    ┌─────────────────────────┐
                    │     Empreendimento      │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
┌──────────────────┐                           ┌──────────────────┐
│    LocalObra     │ (Estrutura física)        │    Taxonomia     │
│ - TORRE / BLOCO  │                           │   - Etapas       │
│ - PAVIMENTO      │                           │   - Subetapas    │
│ - UNIDADE        │                           │   - Marcos       │
└────────┬─────────┘                           └────────┬─────────┘
         │                                              │
         │                  ┌─────────────┐             │
         └─────────────────►│  Evidência  │◄────────────┘
                            │ capturado_em│
                            └─────────────┘
```

---

## 2. Contratos da API (Backend - FastAPI / Pydantic)

### 2.1. Endpoint Principal de Consulta

- **Rota**: `GET /empreendimentos/{empreendimento_id}/evidencias`
- **Autenticação**: Requer usuário autenticado com acesso ao empreendimento (`get_admin_ou_gestor` ou `get_usuario_autenticado`).

---

### 2.2. DTO de Entrada (Query Parameters / Request Schema)

#### Pydantic Schema (`apps/backend/src/backend/modulos/evidencias/schemas.py`)

```python
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, model_validator
from backend.modulos.dominio.regras import TipoLocal


class FiltrosEvidencia_Query_Schema(BaseModel):
    """Parâmetros de consulta para listagem e filtragem de evidências.
    
    Atende às issues #223 (Local), #224 (Etapa/Marco) e #225 (Período).
    """

    model_config = ConfigDict(extra="forbid")

    # ─── Issue #223: Filtro por Local ─────────────────────────────────────────
    local_obra_id: int | None = Field(
        default=None,
        gt=0,
        description="ID do local na estrutura física (Torre, Bloco, Pavimento ou Unidade).",
    )
    tipo_local: TipoLocal | None = Field(
        default=None,
        description="Filtro opcional pelo tipo de estrutura (TORRE, BLOCO, PAVIMENTO, UNIDADE).",
    )
    incluir_descendentes_local: bool = Field(
        default=True,
        description="Quando True, inclui evidências do local selecionado e de todos os seus filhos (ex.: Torre A + seus pavimentos e unidades).",
    )

    # ─── Issue #224: Filtro por Etapa / Marco ─────────────────────────────────
    etapa_id: int | None = Field(
        default=None,
        gt=0,
        description="ID da etapa ou subetapa da taxonomia construtiva.",
    )
    incluir_subetapas: bool = Field(
        default=True,
        description="Quando True, inclui evidências dos marcos da etapa informada e de todas as suas subetapas descendentes.",
    )
    marco_id: int | None = Field(
        default=None,
        gt=0,
        description="ID de um marco construtivo específico.",
    )

    # ─── Issue #225: Filtro por Período de Captura ────────────────────────────
    data_captura_inicio: datetime | None = Field(
        default=None,
        description="Data/hora inicial do período de captura (ISO 8601 UTC).",
    )
    data_captura_fim: datetime | None = Field(
        default=None,
        description="Data/hora final do período de captura (ISO 8601 UTC).",
    )

    @model_validator(mode="after")
    def validar_intervalo_datas(self) -> "FiltrosEvidencia_Query_Schema":
        """Garante que a data inicial não seja posterior à data final."""
        if (
            self.data_captura_inicio is not None
            and self.data_captura_fim is not None
            and self.data_captura_inicio > self.data_captura_fim
        ):
            raise ValueError(
                "data_captura_inicio não pode ser posterior a data_captura_fim"
            )
        return self
```

---

### 2.3. Parâmetros de Query na Rota FastAPI (`routes.py`)

```python
@router.get(
    "/{empreendimento_id}/evidencias",
    response_model=list[EvidenciaResponse],
    summary="Listar evidências com filtros combinados",
)
async def consultar_evidencias(
    empreendimento_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
    # Issue #223 - Local
    local_obra_id: Annotated[int | None, Query(gt=0, description="ID do local da obra")] = None,
    tipo_local: Annotated[TipoLocal | None, Query(description="Tipo de estrutura física")] = None,
    incluir_descendentes_local: Annotated[bool, Query(description="Incluir locais filhos")] = True,
    # Issue #224 - Etapa / Taxonomia
    etapa_id: Annotated[int | None, Query(gt=0, description="ID da etapa ou subetapa")] = None,
    incluir_subetapas: Annotated[bool, Query(description="Incluir subetapas da etapa")] = True,
    marco_id: Annotated[int | None, Query(gt=0, description="ID do marco específico")] = None,
    # Issue #225 - Período
    data_captura_inicio: Annotated[datetime | None, Query(description="Data inicial de captura (ISO 8601)")] = None,
    data_captura_fim: Annotated[datetime | None, Query(description="Data final de captura (ISO 8601)")] = None,
):
    ...
```

---

### 2.4. DTO de Resposta da API (`EvidenciaResponse`)

Retorna a lista de evidências correspondentes aos filtros aplicados, ordenadas por data de captura decrescente (`capturado_em DESC, id DESC`).

#### Formato JSON de Retorno (200 OK)

```json
[
  {
    "id": 105,
    "local_obra_id": 42,
    "marco_id": 18,
    "item_protocolo_id": 3,
    "descricao_tecnica": "Verificação das tubulações hidráulicas embutidas na laje.",
    "capturado_em": "2026-03-15T14:30:00Z",
    "capturado_por": 7,
    "criado_em": "2026-03-15T14:35:12Z",
    "atualizado_em": "2026-03-15T14:35:12Z",
    "arquivo_url": "https://storage.constructo.app/evidencias/obra-12/ev-105.webp",
    "local_obra": {
      "id": 42,
      "nome": "Apartamento 101",
      "tipo": "UNIDADE",
      "parent_id": 15
    },
    "marco": {
      "id": 18,
      "nome": "Instalação de Tubulações Hidráulicas",
      "descricao_tecnica": "Tubulação de água fria e esgoto instaladas conforme projeto executivo."
    },
    "responsavel": {
      "id": 7,
      "nome": "Eng. Carlos Silva",
      "email": "carlos.silva@empresa.com",
      "papel": "GESTOR"
    }
  }
]
```

---

### 2.5. Respostas de Erro

#### Erro 422 - Período Inválido (`data_captura_inicio > data_captura_fim`)
```json
{
  "detail": "data_captura_inicio não pode ser posterior a data_captura_fim"
}
```

#### Erro 404 - Empreendimento, Local ou Etapa Inexistente
```json
{
  "detail": "Local de obra 999 não encontrado no empreendimento informado."
}
```

---

## 3. Contratos do Frontend (TypeScript / React)

### 3.1. Tipos e Interfaces (`apps/web/src/modulos/evidencias/types.ts`)

```typescript
import type { TipoLocalObra } from "@constructo/shared";

export type LocalObraResumo = {
    id: number;
    nome: string;
    tipo: TipoLocalObra;
    parent_id: number | null;
};

export type MarcoResumo = {
    id: number;
    nome: string;
    descricao_tecnica: string | null;
};

export type UsuarioResumo = {
    id: number;
    nome: string;
    email: string;
    papel: string;
};

export type StatusValidacaoEvidencia = "PENDENTE" | "APROVADA" | "REJEITADA";

export type Evidencia = {
    id: number;
    arquivo_url: string;
    descricao_tecnica: string | null;
    local_obra_id: number;
    marco_id: number;
    item_protocolo_id: number | null;
    capturado_por: number;
    capturado_em: string;
    criado_em: string;
    atualizado_em: string;
    local_obra: LocalObraResumo;
    marco: MarcoResumo;
    responsavel: UsuarioResumo;
    status_validacao?: StatusValidacaoEvidencia;
};

/**
 * Payload de Filtros para consulta de evidências na API.
 */
export type FiltrosEvidencia = {
    // Issue #223 - Local
    localObraId?: number;
    tipoLocal?: TipoLocalObra;
    incluirDescendentesLocal?: boolean;

    // Issue #224 - Etapa / Marco
    etapaId?: number;
    incluirSubetapas?: boolean;
    marcoId?: number;

    // Issue #225 - Período
    dataCapturaInicio?: string; // ISO 8601 (ex.: 2026-03-01T00:00:00.000Z)
    dataCapturaFim?: string;    // ISO 8601 (ex.: 2026-03-31T23:59:59.999Z)
};

/**
 * Estado dos campos de formulário na interface do usuário (Gallery / Drawer).
 */
export type FormularioFiltrosEvidencia = {
    localObraId: string;
    tipoLocal: string;
    incluirDescendentesLocal: boolean;
    etapaId: string;
    incluirSubetapas: boolean;
    marcoId: string;
    dataInicio: string; // formato YYYY-MM-DD para input date
    dataFim: string;    // formato YYYY-MM-DD para input date
};
```

---

### 3.2. Service Frontend (`apps/web/src/features/evidencias/evidencias.service.ts`)

```typescript
export function listarEvidencias(
    empreendimentoId: number,
    filtros: FiltrosEvidencia = {},
    options?: ServiceRequestOptions,
): Promise<Evidencia[]> {
    const parametros = new URLSearchParams();

    // Filtros de Local (#223)
    if (filtros.localObraId) {
        parametros.set("local_obra_id", String(filtros.localObraId));
    }
    if (filtros.tipoLocal) {
        parametros.set("tipo_local", filtros.tipoLocal);
    }
    if (filtros.incluirDescendentesLocal !== undefined) {
        parametros.set("incluir_descendentes_local", String(filtros.incluirDescendentesLocal));
    }

    // Filtros de Etapa / Marco (#224)
    if (filtros.etapaId) {
        parametros.set("etapa_id", String(filtros.etapaId));
    }
    if (filtros.incluirSubetapas !== undefined) {
        parametros.set("incluir_subetapas", String(filtros.incluirSubetapas));
    }
    if (filtros.marcoId) {
        parametros.set("marco_id", String(filtros.marcoId));
    }

    // Filtros de Período (#225)
    if (filtros.dataCapturaInicio) {
        parametros.set("data_captura_inicio", filtros.dataCapturaInicio);
    }
    if (filtros.dataCapturaFim) {
        parametros.set("data_captura_fim", filtros.dataCapturaFim);
    }

    const query = parametros.toString();
    return apiRequest<Evidencia[]>(
        `/empreendimentos/${empreendimentoId}/evidencias${query ? `?${query}` : ""}`,
        { signal: options?.signal },
    );
}
```

---

## 4. Regras de Negócio e Implementação no Service / Repository

### 4.1. Regra de Descendentes de Local (Issue #223)
- Se `local_obra_id` for informado e `incluir_descendentes_local = True`:
  - O service busca recursivamente todos os IDs da árvore de `LocalObra` cujo nó raiz ou pai seja `local_obra_id` (via CTE recursiva no PostgreSQL ou travessia de árvore em memória).
  - O filtro na query SQL utiliza `Evidencia.local_obra_id.in_(ids_locais)`.
- Se `incluir_descendentes_local = False`:
  - O filtro utiliza correspondência exata: `Evidencia.local_obra_id == local_obra_id`.
- Se `tipo_local` for fornecido:
  - Adiciona o filtro `LocalObra.tipo == tipo_local`.

### 4.2. Regra de Etapas, Subetapas e Marcos (Issue #224)
- Se `marco_id` for informado:
  - Filtro direto: `Evidencia.marco_id == marco_id`.
- Se `etapa_id` for informado e `marco_id` não for informado:
  - O service resolve todas as subetapas filhas (se `incluir_subetapas = True`) e obtém todos os `marcos.id` associados a essas etapas.
  - O filtro na query SQL utiliza `Evidencia.marco_id.in_(marcos_ids)`.
  - Caso a etapa não possua marcos cadastrados, o retorno é uma lista vazia imediata `[]`.

### 4.3. Regra de Período de Captura (Issue #225)
- Comparação realizada contra `Evidencia.capturado_em`:
  - Apenas data inicial: `Evidencia.capturado_em >= data_captura_inicio`
  - Apenas data final: `Evidencia.capturado_em <= data_captura_fim`
  - Intervalo completo: `data_captura_inicio <= Evidencia.capturado_em <= data_captura_fim`
- As datas são normalizadas para UTC no service (`_normalizar_data_utc`).
- Se `data_captura_inicio > data_captura_fim`, dispara `EvidenciaInvalidaError` retornando HTTP 422.

### 4.4. Combinação dos Filtros
Todos os filtros são cumulativos (operador lógico `AND`):
`empreendimento_id AND [local_obra_id in (...)] AND [marco_id in (...)] AND [capturado_em no período]`.
Qualquer filtro pode ser adicionado ou removido individualmente sem impactar os demais.

---

## 5. Exemplos de Payloads de Requisição

### Cenário 1: Filtrar por Torre com descendentes (Issue #223)
```http
GET /empreendimentos/1/evidencias?local_obra_id=10&incluir_descendentes_local=true
```

### Cenário 2: Filtrar por Etapa de Instalações incluindo subetapas (Issue #224)
```http
GET /empreendimentos/1/evidencias?etapa_id=5&incluir_subetapas=true
```

### Cenário 3: Filtrar por Período específico de março/2026 (Issue #225)
```http
GET /empreendimentos/1/evidencias?data_captura_inicio=2026-03-01T00:00:00Z&data_captura_fim=2026-03-31T23:59:59Z
```

### Cenário 4: Filtros Combinados (Local + Etapa + Período)
```http
GET /empreendimentos/1/evidencias?local_obra_id=10&etapa_id=5&data_captura_inicio=2026-03-01T00:00:00Z&data_captura_fim=2026-03-31T23:59:59Z
```

---

## 6. Próximos Passos para Implementação do Código

Após validação deste documento:
1. **Backend**:
   - Atualizar `schemas.py` com `FiltrosEvidencia_Query_Schema`.
   - Implementar em `servicos.py` e `repository.py` a resolução de descendentes de locais e marcos por etapas.
   - Atualizar a rota `GET /{empreendimento_id}/evidencias` em `routes.py`.
   - Adicionar testes de unidade e integração cobrindo os cenários e critérios de aceite das issues #223, #224 e #225.
2. **Frontend**:
   - Atualizar `types.ts` e `evidencias.service.ts`.
   - Integrar os filtros na galeria `EvidenceGallery.tsx`, permitindo selecionar local (estrutura física), etapa/marco (taxonomia) e datas inicial/final com atualização dinâmica da galeria.
