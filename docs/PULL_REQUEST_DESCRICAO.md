# 🎯 Pull Request: Filtros de Evidências por Local, Etapa e Período

## 📌 Issues Relacionadas
* Closes #223 (Filtrar evidências por local)
* Closes #224 (Filtrar evidências por etapa)
* Closes #225 (Filtrar evidências por período)

---

## 📝 Descrição do PR
Este PR implementa os recursos completos de consulta e filtragem de evidências fotográficas e documentais no backend (FastAPI/SQLAlchemy) e frontend (React/Vite).

As evidências agora podem ser filtradas de forma combinada e cumulativa através da estrutura física da obra (`LocalObra`), da taxonomia executiva (`Etapa`/`Marco`) e de faixas temporais (`capturado_em`).

---

## 🚀 Principais Alterações

### ⚙️ Backend (`apps/backend`)
* **DTO e Validação (`schemas.py`)**:
  * Adicionado `FiltrosEvidencia_Query_Schema` com suporte a `local_obra_id`, `tipo_local`, `incluir_descendentes_local`, `etapa_id`, `incluir_subetapas`, `marco_id`, `data_captura_inicio` e `data_captura_fim`.
  * Validação com `@model_validator` para assegurar que `data_captura_inicio <= data_captura_fim` (disparando erro HTTP 422 em caso de datas invertidas).
* **Camada de Serviço (`servicos.py`)**:
  * Resolução de descendentes da estrutura física da obra quando `incluir_descendentes_local=True`.
  * Resolução de todos os marcos pertencentes a uma etapa (e suas subetapas quando `incluir_subetapas=True`).
  * Normalização de datas para UTC.
* **Repositório (`repository.py`)**:
  * `obter_ids_locais_descendentes`: travessia da hierarquia de locais da obra para busca em árvore.
  * `obter_ids_marcos_por_etapa`: resolução em árvore de etapas/subetapas e busca de marcos.
  * `listar`: consultas otimizadas com `joinedload`/`selectinload`, aplicando filtros com `IN` e intervalos de datas.
* **Rotas (`routes.py`)**:
  * Atualizado endpoint `GET /empreendimentos/{empreendimento_id}/evidencias` recebendo os novos query parameters tipados.

### 💻 Frontend (`apps/web`)
* **Tipagens (`types.ts`)**:
  * Atualizado tipo `FiltrosEvidencia` com suporte a `tipoLocal`, `incluirDescendentesLocal`, `etapaId` e `incluirSubetapas`.
* **Serviço de Evidências (`evidencias.service.ts`)**:
  * Montagem dinâmica dos parâmetros de busca (`URLSearchParams`) compatíveis com a API.
* **Galeria de Evidências (`EvidenceGallery.tsx` e `EvidenceGallery.css`)**:
  * Adicionados controles de formulário para seleção de:
    * ID do Local e checkbox "Incluir descendentes".
    * Tipo de Local (`TORRE`, `BLOCO`, `PAVIMENTO`, `UNIDADE`).
    * ID da Etapa e checkbox "Incluir subetapas".
    * ID do Marco.
    * Datas inicial e final (convertidas em ISO UTC para início e fim do dia).
  * Atualização dinâmica da galeria ao acionar os filtros.

### 📚 Documentação (`docs/`)
* Especificação formal de DTOs e contratos: `docs/dtos-filtros-evidencias.md`.

---

## ✅ Checklist de Critérios de Aceite

### Issue #223 - Local
- [x] Filtro por `local_obra_id` funcionando para qualquer nível hierárquico.
- [x] Filtro por `tipo_local` (`TORRE`, `BLOCO`, `PAVIMENTO`, `UNIDADE`).
- [x] Opção `incluir_descendentes_local` permitindo incluir ou isolar locais filhos.

### Issue #224 - Etapa
- [x] Filtro por `etapa_id` resolvendo todos os marcos da etapa.
- [x] Opção `incluir_subetapas` permitindo incluir ou isolar subetapas descendentes.
- [x] Filtro direto por `marco_id`.
- [x] Retorno imediato de lista vazia `[]` caso uma etapa não possua marcos.

### Issue #225 - Período
- [x] Filtro por período de captura (`data_captura_inicio` e `data_captura_fim`).
- [x] Validação de intervalo: retorna HTTP 422 caso a data inicial seja posterior à final.
- [x] Normalização de datas em UTC.

---

## 🧪 Testes Realizados

| Suíte | Escopo | Resultado |
| :--- | :--- | :--- |
| **Pytest Backend** | `apps/backend/tests/test_pi_evidencias.py` | ✅ **46/46 passaram** |
| **Pytest Backend Geral** | Todos os módulos do backend | ✅ **107/107 passaram** |
| **Vitest Frontend** | `apps/web` (inclusive galeria e serviço) | ✅ **76/76 passaram** |
| **TypeScript / Build** | `tsc -b && vite build` | ✅ **Sucesso** (sem erros) |
| **ESLint Frontend** | `eslint .` | ✅ **0 erros, 0 avisos** |

---

## 🔍 Como Testar Manualmente
1. **Listar evidências por local**:
   * Fazer requisição: `GET /empreendimentos/{id}/evidencias?local_obra_id=10&incluir_descendentes_local=true`.
2. **Listar evidências por etapa**:
   * Fazer requisição: `GET /empreendimentos/{id}/evidencias?etapa_id=5&incluir_subetapas=true`.
3. **Listar evidências por período**:
   * Fazer requisição: `GET /empreendimentos/{id}/evidencias?data_captura_inicio=2026-03-01T00:00:00Z&data_captura_fim=2026-03-31T23:59:59Z`.
4. **Validar erro 422**:
   * Fazer requisição com `data_captura_inicio` posterior a `data_captura_fim` e verificar status 422.
5. **No Frontend**:
   * Acessar a galeria de evidências do empreendimento e interagir com os seletores de filtros, verificando a listagem atualizada.
