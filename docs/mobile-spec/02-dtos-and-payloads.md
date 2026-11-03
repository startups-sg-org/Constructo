# 02. Especificação de DTOs, Contratos e Projeções Client-Side

**Documento:** `/docs/mobile-spec/02-dtos-and-payloads.md`  
**Status:** Revisado sob a Diretriz Estrita de **Zero Alterações no Backend**  
**Linguagem dos Contratos:** TypeScript 6.0 (Strict)  
**Integração:** Consumo direto das APIs FastAPI existentes + Projeções de ViewModel no Mobile  

---

## 1. Arquitetura de Contratos: Duas Camadas

Como o backend permanece inalterado, os contratos são divididos em:
1. **Contratos de Transporte de Rede (API Externa):** Tipos que refletem exatamente as rotas HTTP e schemas Pydantic já existentes no backend.
2. **Contratos de Apresentação (ViewModels do Mobile):** Estruturas ricas enriquecidas no dispositivo para alimentar a interface do Feed Social do Cliente e o Envio em 3 Cliques da Empresa.

```
┌─────────────────────────────────┐
│  API Backend Existente (FastAPI)│
│  - EvidenciaResponse            │
│  - ProgressoEmpreendimentoLer   │
│  - EtapaLer / MarcoLer          │
└────────────────┬────────────────┘
                 │ (Chamadas HTTP REST com Cookie)
                 ▼
┌─────────────────────────────────────────────────────────┐
│     Camada de Projeção no Mobile (Feed Adapter)         │
│  - Mapeia Evidencia bruta -> PostagemFeedSocial         │
│  - Calcula delta percentual (+X%) baseado na taxonomia  │
│  - Calcula progresso global acumulado até a foto        │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│     Interface do Usuário (UI)   │
│  - Feed Social (Cards táteis)   │
│  - Barra Dinâmica na Viewport   │
└─────────────────────────────────┘
```

---

## 2. Contratos da Visão Empresa (Submissão Rápida em Campo)

### 2.1. Payload de Envio para a Rota Existente do Backend

O app móvel envia a evidência diretamente para o endpoint já implementado:  
`POST /empreendimentos/{empreendimento_id}/evidencias` (`multipart/form-data`).

```typescript
/**
 * Contrato exato esperado pelo backend em apps/backend/src/backend/modulos/evidencias/routes.py
 */
export interface CadastrarEvidenciaBackendFormData {
  /** Arquivo binário da imagem compactada no dispositivo */
  file: Blob | { uri: string; name: string; type: string };

  /** ID do local físico da obra (resolvido automaticamente pelo app) */
  local_obra_id: number;

  /** ID do marco associado à etapa em execução */
  marco_id: number;

  /** Legenda técnica ou comentário explicativo da foto */
  descricao_tecnica?: string;

  /** Data e hora da captura (ISO 8601) */
  capturado_em?: string;

  /** ID do item de protocolo (opcional) */
  item_protocolo_id?: number;
}
```

### 2.2. Resposta Bruta do Backend Existente

```typescript
export interface EvidenciaResponseBackend {
  id: number;
  empreendimento_id: number;
  local_obra_id: number;
  marco_id: number;
  item_protocolo_id: number | null;
  arquivo_evidencia_id: number | null;
  arquivo_url: string; // Ex: "/uploads/empreendimentos/14/evidencias/b4a1c_1729780000.jpg"
  descricao_tecnica: string | null;
  capturado_em: string;
  capturado_por: number;
  criado_em: string;
  atualizado_em: string;
}
```

### 2.3. ViewModel do Formulário de 3 Cliques no App de Campo

Para garantir a experiência "Zero-Friction" sem exigir que o engenheiro preencha múltiplos campos técnicos:

```typescript
export interface FormularioEnvioRapidoCampo {
  /** 1. Mídia capturada pela câmera ou galeria do smartphone */
  fotoUri: string;

  /** 2. Etapa selecionada na pílula tátil de atalho */
  etapaIdSelecionada: number;

  /** Marco resolvido automaticamente pelo app (primeiro marco pendente da etapa) */
  marcoIdResolvido: number;

  /** Local da obra resolvido automaticamente (torre/unidade ativa) */
  localObraIdResolvido: number;

  /** 3. Legenda rápida digitada ou ditada por voz */
  comentario: string;

  /** Estimativa de avanço desta tarefa no marco (ajuste via slider) */
  estimativaAvancoMarco: number; // Ex: 100% (concluído) ou 50%
}
```

---

## 3. Contratos da Visão Cliente (Feed Social da Obra)

### 3.1. Dados Brutos Consumidos do Backend

O cliente mobile consulta duas rotas já disponíveis:
1. `GET /empreendimentos/{id}/evidencias`: Lista todas as fotos registradas na obra.
2. `GET /empreendimentos/{id}/progresso`: Retorna o resumo oficial de progresso:

```typescript
export interface ProgressoEtapaBackend {
  etapa_id: number;
  nome: string;
  percentual: number; // Ex: 100
}

export interface ProgressoEmpreendimentoBackend {
  empreendimento_id: number;
  percentual: number; // Ex: 38
  etapas: ProgressoEtapaBackend[];
}
```

### 3.2. Projeção Client-Side: ViewModel do Feed Social (`PostagemFeedSocial`)

O serviço `feed.service.ts` no mobile projeta os dados brutos na rica estrutura de apresentação visual com badges e cálculo acumulado:

```typescript
export interface PostagemFeedSocial {
  id: number;
  
  /** URL pública completa montada com a URL base da API */
  imagemUrl: string;

  /** Data formatada amigável (ex: "Hoje às 14:30" ou "Ontem") */
  dataExibicao: string;
  timestampCaptura: number;

  /** Legenda do post */
  legenda: string;

  /** Dados da etapa associada */
  etapa: {
    id: number;
    nome: string;
    icone: 'foundation' | 'structure' | 'masonry' | 'finishing';
  };

  /** Autor da postagem */
  autor: {
    nome: string;
    cargo: string;
  };

  /**
   * Cálculo matemático de impacto:
   * deltaProgresso: quanto este marco específico representou no avanço total da obra.
   * progressoAcumuladoAteAqui: avanço consolidado da obra até a data desta evidência.
   */
  impactoProgresso: {
    deltaPercentual: number; // Ex: 4.5 -> badge "+4.5% no Progresso Total"
    progressoAcumuladoAteAqui: number; // Ex: 38.0 -> valor alvo da animação da barra
  };

  /** Badge visual de destaque */
  badge: {
    texto: string; // Ex: "+4.5% no Progresso Total"
    variante: 'destaque' | 'primaria';
  };
}

export interface ResumoObraClienteViewModel {
  nomeObra: string;
  progressoGlobalAtual: number; // Ex: 38%
  etapas: {
    id: number;
    nome: string;
    percentual: number;
  }[];
}
```

---

## 4. Algoritmo de Cálculo de Delta e Progresso no Mobile

Como o backend não armazena a coluna histórica de deltas, a camada de serviço do mobile realiza a reconstituição matemática transparente da linha do tempo:

```typescript
/**
 * Projeta uma evidência bruta do backend para o formato de card do Feed Social.
 * 
 * @param evidencia - Registro bruto de EvidenciaResponseBackend
 * @param totalMarcosObra - Quantidade total de marcos da taxonomia da obra
 * @param progressoAtualObra - Progresso consolidado retornado por /progresso (ex: 38%)
 * @param indiceCronologico - Posição do post na linha do tempo ordenada
 * @param totalEvidencias - Total de evidências da timeline
 */
export function calcularImpactoEvidencia(
  evidencia: EvidenciaResponseBackend,
  totalMarcosObra: number,
  progressoAtualObra: number,
  indiceCronologico: number,
  totalEvidencias: number
): PostagemFeedSocial['impactoProgresso'] {
  // 1. Cada marco equivale a uma fração exata do projeto total:
  const pesoPadraoMarco = totalMarcosObra > 0 ? (100 / totalMarcosObra) : 5.0;
  
  // Delta formatado com 1 casa decimal (ex: 4.5%)
  const deltaPercentual = Number(pesoPadraoMarco.toFixed(1));

  // 2. Cálculo do progresso histórico acumulado até o instante da postagem:
  // À medida que avançamos nas evidências mais antigas até a mais recente,
  // o progresso acumulado converge suavemente para o progressoAtualObra.
  const fatorEvolucao = (indiceCronologico + 1) / Math.max(totalEvidencias, 1);
  const progressoAcumuladoAteAqui = Math.min(
    progressoAtualObra,
    Math.round(progressoAtualObra * fatorEvolucao)
  );

  return {
    deltaPercentual,
    progressoAcumuladoAteAqui: Math.max(progressoAcumuladoAteAqui, deltaPercentual),
  };
}
```

---

## 5. Exemplo de Requisição e Resposta Reais

### 5.1. Requisição de Upload do Mobile (3 Cliques) para o Backend Existente

```http
POST /empreendimentos/14/evidencias HTTP/1.1
Host: 10.0.2.2:8000
Cookie: session_token=e6b219f8a0...
Content-Type: multipart/form-data; boundary=----ReactNativeBoundaryXYZ

------ReactNativeBoundaryXYZ
Content-Disposition: form-data; name="file"; filename="obra_laje.jpg"
Content-Type: image/jpeg

[BYTES DA IMAGEM COMPACTADA PELO EXPO NO CELULAR]
------ReactNativeBoundaryXYZ
Content-Disposition: form-data; name="local_obra_id"

3
------ReactNativeBoundaryXYZ
Content-Disposition: form-data; name="marco_id"

8
------ReactNativeBoundaryXYZ
Content-Disposition: form-data; name="descricao_tecnica"

Concretagem da laje do 3º pavimento finalizada com teste de corpo de prova aprovado.
------ReactNativeBoundaryXYZ
Content-Disposition: form-data; name="capturado_em"

2026-10-24T15:30:00.000Z
------ReactNativeBoundaryXYZ--
```

### 5.2. Resposta Retornada pelo Backend (`201 Created`)

```json
{
  "id": 1042,
  "empreendimento_id": 14,
  "local_obra_id": 3,
  "marco_id": 8,
  "item_protocolo_id": null,
  "arquivo_evidencia_id": 95,
  "arquivo_url": "/uploads/empreendimentos/14/evidencias/b4a1c_1729780000.jpg",
  "descricao_tecnica": "Concretagem da laje do 3º pavimento finalizada com teste de corpo de prova aprovado.",
  "capturado_em": "2026-10-24T15:30:00Z",
  "capturado_por": 4,
  "criado_em": "2026-10-24T15:30:01Z",
  "atualizado_em": "2026-10-24T15:30:01Z"
}
```

### 5.3. Objeto ViewModel Gerado no Mobile para o Card do Feed

```json
{
  "id": 1042,
  "imagemUrl": "http://10.0.2.2:8000/uploads/empreendimentos/14/evidencias/b4a1c_1729780000.jpg",
  "dataExibicao": "Hoje às 15:30",
  "timestampCaptura": 1792855800000,
  "legenda": "Concretagem da laje do 3º pavimento finalizada com teste de corpo de prova aprovado.",
  "etapa": {
    "id": 2,
    "nome": "Estrutura e Alvenaria",
    "icone": "structure"
  },
  "autor": {
    "nome": "Eng. Ricardo Vasconcelos",
    "cargo": "Engenheiro Residente"
  },
  "impactoProgresso": {
    "deltaPercentual": 4.5,
    "progressoAcumuladoAteAqui": 38.0
  },
  "badge": {
    "texto": "+4.5% no Progresso Total",
    "variante": "destaque"
  }
}
```
