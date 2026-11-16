# Especificação de DTOs, Payloads e Plano de Implementação: Gestão de Evidências

Este documento detalha os contratos de dados (DTOs), esquemas Pydantic/TypeScript, rotas HTTP, payloads de requisição/resposta e o plano de implementação passo a passo para as seguintes issues:

- **Issue #226**: [Remover evidência](https://github.com/startups-sg-org/Constructo/issues/226)
- **Issue #227**: [Implementar validação de evidência](https://github.com/startups-sg-org/Constructo/issues/227)
- **Issue #228**: [Implementar visualizador de evidência](https://github.com/startups-sg-org/Constructo/issues/228)

---

## 1. Visão Geral da Arquitetura e Ciclo de Vida da Evidência

A gestão de evidências cobre o ciclo completo de auditoria e qualidade das fotos da obra:

```
                  ┌───────────────────────────────┐
                  │ Evidência Criada/Capturada    │
                  │   status = PENDENTE           │
                  └──────────────┬────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
                 ▼ (Gestor aprova)               ▼ (Gestor rejeita)
      ┌────────────────────┐          ┌───────────────────────┐
      │  status = VALIDA   │          │  status = INVALIDA    │
      │  - Conta p/ mínimo │          │  - Não conta p/ mínimo│
      │  - Atende item     │          │  - Exige motivo       │
      └──────────┬─────────┘          └───────────┬───────────┘
                 │                                │
                 └───────────────┬────────────────┘
                                 │
                                 ▼ (Gestor remove se incorreta)
                    ┌─────────────────────────┐
                    │    Evidência Removida   │
                    │ - Exclui do banco       │
                    │ - Limpa arquivo físico  │
                    │ - Atualiza checklist    │
                    └─────────────────────────┘
```

---

## 2. Modelagem de Dados e Banco de Dados (Backend - SQLAlchemy)

### 2.1. Enum de Status de Validação
```python
import enum

class StatusValidacaoEvidencia(str, enum.Enum):
    PENDENTE = "PENDENTE"
    VALIDA = "VALIDA"
    INVALIDA = "INVALIDA"
```

### 2.2. Campos Adicionais no Modelo `Evidencia` (`evidencias`)
Na tabela `evidencias` (`apps/backend/src/backend/modulos/dominio/modelos.py`):

| Coluna | Tipo | Nullable | Descrição / Restrição |
| :--- | :--- | :--- | :--- |
| `status_validacao` | `String(20)` / Enum | `False` | Padrão: `'PENDENTE'`. Valores: `PENDENTE`, `VALIDA`, `INVALIDA`. |
| `validado_por` | `Integer` (FK `usuarios.id`) | `True` | Usuário (Gestor/Admin) que realizou a validação. |
| `validado_em` | `DateTime(timezone=True)` | `True` | Data/hora UTC em que foi validada ou invalidada. |
| `motivo_invalidacao` | `Text` | `True` | Justificativa obrigatória caso o status seja `INVALIDA`. |

---

## 3. Contratos de API (FastAPI / Pydantic v2)

### 3.1. Schemas de Requisição e Resposta (`schemas.py`)

```python
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict

class StatusValidacaoEnum(str, Enum):
    PENDENTE = "PENDENTE"
    VALIDA = "VALIDA"
    INVALIDA = "INVALIDA"

# --- Payloads para Validação de Evidência (#227) ---

class ValidarEvidencia_Payload_Schema(BaseModel):
    """Payload para aprovação de evidência (opcionalmente pode incluir observação)."""
    observacao: str | None = Field(default=None, max_length=500, description="Observação opcional de validação")

class InvalidarEvidencia_Payload_Schema(BaseModel):
    """Payload obrigatório para rejeição de evidência."""
    motivo: str = Field(..., min_length=3, max_length=1000, description="Motivo pelo qual a evidência foi invalidada")

class ValidacaoEvidencia_Response_Schema(BaseModel):
    id: int
    status_validacao: StatusValidacaoEnum
    validado_por: int
    validado_em: datetime
    motivo_invalidacao: str | None = None

    model_config = ConfigDict(from_attributes=True)

# --- Schemas de Resposta da Evidência Atualizados (#227 / #228) ---

class EvidenciaDetalhe_Response_Schema(BaseModel):
    """Contrato completo para o Visualizador de Evidências (EvidenceViewer)."""
    id: int
    empreendimento_id: int
    arquivo_url: str
    descricao_tecnica: str | None = None
    capturado_em: datetime
    capturado_por: int
    nome_capturador: str | None = None
    
    # Contexto Estrutural e de Taxonomia
    local_obra_id: int
    nome_local: str | None = None
    tipo_local: str | None = None
    marco_id: int
    nome_marco: str | None = None
    etapa_id: int | None = None
    nome_etapa: str | None = None
    subetapa_id: int | None = None
    nome_subetapa: str | None = None
    item_protocolo_id: int | None = None
    nome_item_protocolo: str | None = None
    
    # Dados de Validação (#227)
    status_validacao: StatusValidacaoEnum = StatusValidacaoEnum.PENDENTE
    validado_por: int | None = None
    nome_validador: str | None = None
    validado_em: datetime | None = None
    motivo_invalidacao: str | None = None

    criado_em: datetime
    atualizado_em: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Resposta de Remoção (#226) ---

class RemocaoEvidencia_Response_Schema(BaseModel):
    sucesso: bool = True
    mensagem: str = "Evidência removida com sucesso"
    evidencia_id: int
```

---

## 4. Endpoints HTTP (REST)

### 4.1. Remover Evidência (#226)
* **Rota:** `DELETE /empreendimentos/{empreendimento_id}/evidencias/{evidencia_id}`
* **Permissões:** `GESTOR` vinculado à obra ou `ADMIN`.
* **Respostas:**
  * `200 OK`: `{ "sucesso": true, "mensagem": "Evidência removida com sucesso", "evidencia_id": 123 }`
  * `403 FORBIDDEN`: Usuário não tem permissão para gerenciar evidências deste empreendimento.
  * `404 NOT_FOUND`: Evidência não encontrada para o empreendimento especificado.
  * `409 CONFLICT`: Evidência já está vinculada a uma publicação pública consolidada.

### 4.2. Validar Evidência (#227)
* **Rota:** `POST /empreendimentos/{empreendimento_id}/evidencias/{evidencia_id}/validar`
* **Permissões:** `GESTOR` ou `ADMIN`.
* **Payload (JSON):**
  ```json
  {
    "observacao": "Registro fotográfico nítido e em conformidade."
  }
  ```
* **Respostas:**
  * `200 OK`: Retorna `ValidacaoEvidencia_Response_Schema`.
  * `404 NOT_FOUND`: Evidência inexistente.

### 4.3. Invalidar Evidência (#227)
* **Rota:** `POST /empreendimentos/{empreendimento_id}/evidencias/{evidencia_id}/invalidar`
* **Permissões:** `GESTOR` ou `ADMIN`.
* **Payload (JSON):**
  ```json
  {
    "motivo": "Ângulo da foto não cobre o piso impermeabilizado solicitado no protocolo."
  }
  ```
* **Respostas:**
  * `200 OK`: Retorna `ValidacaoEvidencia_Response_Schema` com status `INVALIDA`.
  * `422 UNPROCESSABLE_ENTITY`: Motivo não informado ou em branco.

### 4.4. Detalhes Completos para o Visualizador (#228)
* **Rota:** `GET /empreendimentos/{empreendimento_id}/evidencias/{evidencia_id}`
* **Respostas:**
  * `200 OK`: Retorna `EvidenciaDetalhe_Response_Schema`.

---

## 5. Tipos e Contratos no Frontend (TypeScript - `apps/web`)

### 5.1. Definição de Tipos (`types.ts`)
```typescript
export type StatusValidacaoEvidencia = 'PENDENTE' | 'VALIDA' | 'INVALIDA';

export interface EvidenciaContexto {
  id: number;
  empreendimentoId: number;
  arquivoUrl: string;
  descricaoTecnica?: string | null;
  capturadoEm: string;
  capturadoPor: number;
  nomeCapturador?: string | null;

  // Contexto
  localObraId: number;
  nomeLocal?: string;
  tipoLocal?: string;
  marcoId: number;
  nomeMarco?: string;
  etapaId?: number;
  nomeEtapa?: string;
  subetapaId?: number;
  nomeSubetapa?: string;
  itemProtocoloId?: number | null;
  nomeItemProtocolo?: string | null;

  // Validação (#227)
  statusValidacao: StatusValidacaoEvidencia;
  validadoPor?: number | null;
  nomeValidador?: string | null;
  validadoEm?: string | null;
  motivoInvalidacao?: string | null;
}

export interface PayloadInvalidacao {
  motivo: string;
}

export interface PayloadValidacao {
  observacao?: string;
}
```

### 5.2. Métodos do Serviço (`evidencias.service.ts`)
```typescript
// #226
async removerEvidencia(empreendimentoId: number, evidenciaId: number): Promise<void>;

// #227
async validarEvidencia(empreendimentoId: number, evidenciaId: number, observacao?: string): Promise<EvidenciaContexto>;
async invalidarEvidencia(empreendimentoId: number, evidenciaId: number, motivo: string): Promise<EvidenciaContexto>;

// #228
async obterEvidencia(empreendimentoId: number, evidenciaId: number): Promise<EvidenciaContexto>;
```

---

## 6. Componentes e UI: Visualizador de Evidência (#228)

O componente `EvidenceViewer` é implementado como um modal de sobreposição (Lightbox) de alta resolução:

```
┌────────────────────────────────────────────────────────────────────────┐
│ EvidenceViewer                                                     [X] │
├────────────────────────────────────────┬───────────────────────────────┤
│                                        │  Informações da Evidência     │
│                                        │                               │
│                                        │  Status: [ VALIDA ]           │
│                                        │                               │
│               [IMAGEM]                 │  Local: Torre A > Pav. 3      │
│                                        │  Marco: Impermeabilização     │
│                                        │  Item: Visão geral do piso    │
│                                        │  Capturado por: Carlos (Eng)  │
│                                        │  Data: 14/10/2026 às 14:32    │
│                                        │                               │
│                                        │  Descrição Técnica:           │
│                                        │  "Aplicação da 2ª demão..."   │
│                                        ├───────────────────────────────┤
│                                        │  Ações de Gestão:             │
│   [ < Anterior ]      [ Próxima > ]    │  [ Aprovar ] [ Rejeitar ]     │
│                                        │  [ 🗑️ Excluir Evidência ]     │
└────────────────────────────────────────┴───────────────────────────────┘
```

### Recursos do Visualizador:
1. **Navegação rápida**: Botões Anterior/Próxima e atalhos de teclado:
   - `Seta Esquerda`: Evidência anterior.
   - `Seta Direita`: Próxima evidência.
   - `Escape`: Fechar visualizador.
2. **Confirmação de Exclusão (#226)**: Ao clicar no botão de lixeira/excluir, abre-se modal de diálogo:
   > *"Tem certeza que deseja remover esta evidência? Esta ação excluirá o arquivo e poderá tornar o protocolo de comprovação do marco incompleto."*
   > `[Cancelar]` `[Confirmar Exclusão]`
3. **Modal de Rejeição (#227)**: Ao clicar em "Rejeitar", solicita um campo de texto obrigatório para `motivo`.

---

## 7. Plano de Implementação Passo a Passo

### Fase 1: Backend — Modelagem e Serviços de Validação e Remoção (#226 e #227)
1. **Migration / Modelo**:
   - Adicionar colunas `status_validacao`, `validado_por`, `validado_em`, `motivo_invalidacao` na tabela `evidencias`.
2. **Repositório (`repository.py`)**:
   - Adicionar método `remover(evidencia_id)`.
   - Adicionar método `atualizar_status_validacao(evidencia_id, status, usuario_id, motivo)`.
3. **Camada de Serviço (`servicos.py`)**:
   - Regra de negócio: Atualizar cálculo do protocolo para contabilizar somente evidências com `status_validacao == 'VALIDA'`.
   - Remoção segura com exclusão do arquivo em disco/storage.
4. **Rotas e Schemas (`routes.py`, `schemas.py`)**:
   - `DELETE .../evidencias/{id}`
   - `POST .../evidencias/{id}/validar`
   - `POST .../evidencias/{id}/invalidar`
5. **Testes Unitários e de Integração**:
   - Testar ciclo de aprovação, rejeição (com e sem motivo) e exclusão.

### Fase 2: Frontend — Serviços e Tipos
1. Adicionar endpoints em `apps/web/src/features/evidencias/evidencias.service.ts`.
2. Atualizar interfaces em `types.ts`.

### Fase 3: Frontend — Componente `EvidenceViewer` (#228) e Integrações (#226, #227)
1. **Criar `EvidenceViewer.tsx` e `EvidenceViewer.css`**:
   - Visualização da foto ampliada com fallback de erro.
   - Barra lateral retrátil com todos os metadados.
   - Navegação circular anterior/próxima e suporte a teclado (`ArrowLeft`, `ArrowRight`, `Escape`).
2. **Integrar Ação de Exclusão (#226)**:
   - Diálogo nativo/acessível de confirmação.
   - Atualização automática da lista da galeria sem recarregar a página.
3. **Integrar Ação de Validação (#227)**:
   - Botões de "Aprovar" e "Reprovar".
   - Exibição de badge (`PENDENTE`: amarelo, `VALIDA`: verde, `INVALIDA`: vermelho).
   - Modal com textarea para justificativa ao invalidar.
4. **Testes no Frontend (`EvidenceViewer.test.tsx`)**:
   - Testar navegação entre itens, fechamento por `Escape`, chamada de aprovação, reprovação e confirmação de exclusão.
