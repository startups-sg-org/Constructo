## 🏗️ Arquitetura

O projeto utiliza uma arquitetura modular orientada a funcionalidades
(feature-based architecture).

Cada domínio da aplicação é organizado em um módulo independente,
responsável por seus componentes, hooks, tipos, serviços e regras
específicas.

Estrutura principal:

src/
├── app/
├── modules/
├── shared/
└── assets/

Exemplos de módulos:

- `modules/map` — visualização geoespacial e GeoJSON;
- `modules/dashboard` — indicadores e cards;
- `modules/construction` — informações e detalhes das obras;
- `modules/documents` — documentos associados às obras.

Código reutilizável entre módulos deve ser colocado em `shared`.

Para convenções completas da arquitetura, consulte
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).