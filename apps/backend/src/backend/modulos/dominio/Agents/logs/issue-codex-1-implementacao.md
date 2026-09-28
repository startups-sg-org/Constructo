# Log de implementação — issue-codex-1

Data: 2026-09-27

## Objetivo

Implementar a interface visual para selecionar uma taxonomia padrão disponível,
configurá-la no empreendimento e abrir o editor após o vínculo.

## Alterações realizadas

### Backend

- Mantidos os endpoints de taxonomia da issue-175:
  - `GET /empreendimentos/taxonomias/disponiveis`;
  - `POST /empreendimentos/{empreendimento_id}/taxonomia/configurar`.
- A configuração reutiliza `personalizar_taxonomia`, criando uma cópia
  vinculada ao empreendimento e preservando a taxonomia padrão original.
- O fluxo continua protegido por `get_admin_ou_gestor` e pelo vínculo do gestor
  ao empreendimento.

### Frontend

- Criado `TaxonomyConfiguration.tsx`.
- Criado `TaxonomyConfiguration.css`.
- A página de detalhes do empreendimento passou a:
  - consultar a taxonomia vinculada;
  - exibir loading;
  - exibir estado sem taxonomia;
  - listar opções padrão;
  - permitir seleção e envio;
  - exibir erros;
  - liberar “Editar taxonomia” somente após vínculo.
- O tipo frontend `Taxonomia` foi atualizado com:

  ```ts
  origem_taxonomia_id?: number | null;
  ```

  Isso corrige o erro TypeScript ao identificar cópias personalizadas.

## Validação

- `git diff --check`: aprovado.
- `py_compile` dos arquivos backend de domínio: aprovado.
- Build completo do frontend não foi executado neste ambiente porque as
  dependências workspace não estavam resolvidas e havia restrição de escrita no
  cache do TypeScript.

## Limites conhecidos

- Ainda não há testes automatizados específicos do componente visual.
- A interface não implementa substituição de uma taxonomia já utilizada.
- A interface usa seleção por lista; drag-and-drop e edição de etapas ficam no
  editor de taxonomia existente.
