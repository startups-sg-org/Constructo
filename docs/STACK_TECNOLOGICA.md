# 🧰 Constructo — Stack tecnológica

[← Voltar ao README principal](../README.md)

---

## Objetivo deste documento

Este documento descreve a arquitetura tecnológica prevista para o Constructo e o papel de cada tecnologia dentro do produto.

A stack principal é formada por:

- **Mobile / Frontend:** React Native + Expo;
- **Backend / API:** Python + Django REST Framework;
- **Banco de dados:** PostgreSQL;
- **Arquivos:** S3 ou Cloudflare R2;
- **Cache e processamento assíncrono:** Redis + Workers;
- **Notificações:** Firebase Cloud Messaging;
- **Observabilidade:** OpenTelemetry;
- **Visualização 3D futura:** React Three Fiber + Three.js.

> [!IMPORTANT]
> React Three Fiber e Three.js estão associados à futura visualização 3D e não são necessários para concluir a entrega acadêmica atual.

---

# 🧩 Visão geral da arquitetura

O fluxo básico da aplicação pode ser representado assim:

```text
┌──────────────────────────────┐
│      React Native + Expo     │
│          Aplicativo          │
└──────────────┬───────────────┘
               │ HTTP / API
               ▼
┌──────────────────────────────┐
│ Python + Django REST Framework│
│            Backend           │
└───────┬──────────┬───────────┘
        │          │
        │          ├──────────────► S3 / Cloudflare R2
        │          │                 Arquivos e evidências
        │
        ├─────────────────────────► Redis / Workers
        │                            tarefas assíncronas
        │
        ▼
┌──────────────────────────────┐
│          PostgreSQL          │
│       Dados estruturados     │
└──────────────────────────────┘
```

Serviços complementares:

```text
Firebase Cloud Messaging → notificações push

OpenTelemetry → métricas, traces e observabilidade
```

---

# 📱 1. React Native

O **React Native** será responsável pela interface principal utilizada pelos usuários.

Responsabilidades:

- autenticação;
- navegação;
- telas administrativas;
- cadastro e edição de informações;
- timeline;
- módulo Meu Apê;
- mapa;
- visualização dos indicadores;
- consulta de documentos e evidências;
- interação com a API.

---

# ⚡ 2. Expo

O **Expo** será utilizado para simplificar o desenvolvimento e a execução do aplicativo React Native.

Ele poderá auxiliar em tarefas como:

- ambiente de desenvolvimento;
- execução em dispositivos;
- builds;
- acesso a recursos do dispositivo;
- integração com notificações;
- gerenciamento do projeto mobile.

---

# 🐍 3. Python

O **Python** será utilizado no backend da plataforma.

Sua função será concentrar a lógica de negócio que não deve permanecer no cliente.

Exemplos:

- regras de acesso;
- processamento de indicadores;
- validações;
- auditoria;
- integração entre serviços;
- tratamento de arquivos;
- execução de tarefas em background.

---

# 🌐 4. Django REST Framework

O **Django REST Framework (DRF)** será utilizado para disponibilizar a API consumida pelo aplicativo.

Responsabilidades previstas:

- autenticação da API;
- endpoints REST;
- serialização dos dados;
- validações;
- permissões;
- organização das regras de acesso;
- comunicação com o PostgreSQL.

Exemplo conceitual de recursos da API:

```text
/auth
/users
/companies
/projects
/works
/units
/updates
/evidences
/indicators
/geojson
```

Os nomes finais das rotas deverão acompanhar a implementação efetiva do projeto.

---

# 🐘 5. PostgreSQL

O **PostgreSQL** será responsável pelos dados estruturados da aplicação.

Exemplos:

- usuários;
- construtoras;
- empreendimentos;
- obras;
- torres;
- pavimentos;
- unidades;
- permissões;
- atualizações;
- indicadores;
- histórico;
- auditoria;
- metadados dos documentos.

Arquivos grandes não deverão ser armazenados diretamente no banco quando houver uma solução de object storage disponível.

---

# 🗂️ 6. S3 / Cloudflare R2

O armazenamento de objetos será utilizado para arquivos como:

- imagens;
- relatórios;
- planilhas;
- plantas;
- documentos;
- evidências;
- arquivos exportados.

O PostgreSQL poderá armazenar os metadados e referências desses arquivos, enquanto o conteúdo permanecerá no serviço de armazenamento.

Fluxo conceitual:

```text
Usuário envia arquivo
        ↓
Backend valida
        ↓
Arquivo → S3 / R2
        ↓
Metadados → PostgreSQL
```

---

# ⚙️ 7. Redis

O **Redis** poderá ser utilizado como camada de apoio para:

- cache;
- filas;
- dados temporários;
- controle de tarefas;
- operações que não precisam ser executadas de forma síncrona.

---

# 👷 8. Workers

Workers poderão processar tarefas que não precisam bloquear uma requisição da API.

Exemplos possíveis:

- processamento de arquivos;
- geração de notificações;
- atualização de indicadores;
- integrações;
- tarefas periódicas;
- operações demoradas.

Fluxo conceitual:

```text
API recebe solicitação
        ↓
Registra tarefa
        ↓
Redis / fila
        ↓
Worker processa
        ↓
Resultado é salvo
```

---

# 🔔 9. Firebase Cloud Messaging

O **Firebase Cloud Messaging (FCM)** poderá ser utilizado para notificações push.

Exemplos:

- nova atualização publicada;
- novo comunicado;
- mudança relevante no empreendimento;
- informação disponibilizada para o cliente.

---

# 🔭 10. OpenTelemetry

O **OpenTelemetry** será utilizado para observabilidade.

A ideia é permitir a instrumentação de:

- requisições;
- erros;
- traces;
- latência;
- execução de serviços;
- comportamento de componentes do backend.

A ferramenta não substitui uma plataforma de visualização. Ela fornece os dados de telemetria que poderão ser enviados posteriormente para ferramentas compatíveis.

---

# 🗺️ 11. GeoJSON

O **GeoJSON** funciona como formato de representação geoespacial dentro do Constructo.

Ele será utilizado para transportar ou armazenar geometrias relacionadas às obras.

Exemplos:

- pontos;
- linhas;
- polígonos;
- áreas delimitadas.

Cada elemento poderá carregar propriedades relacionadas ao empreendimento e ser associado aos dados persistidos pela API.

---

# 📊 12. Cálculo dos indicadores

Os indicadores de obra deverão ser calculados ou consolidados no backend sempre que a regra de negócio exigir consistência e rastreabilidade.

Exemplos:

- avanço físico;
- SPI;
- CPI;
- desvio financeiro;
- previsão de conclusão;
- EAC;
- qualidade;
- segurança.

O frontend deverá receber os valores necessários para apresentar o painel, enquanto o backend mantém a regra, os dados utilizados e a referência à origem da informação.

Fluxo recomendado:

```text
Planilha / relatório / medição
            ↓
        Backend
            ↓
     cálculo/consolidação
            ↓
       Indicador
            ↓
API → aplicativo → painel
            ↓
 usuário acessa a evidência de origem
```

---

# 🧱 13. React Three Fiber + Three.js

Essas tecnologias pertencem à **evolução futura** do Constructo.

Elas poderão ser utilizadas para:

- carregar modelos GLB/glTF;
- renderizar o empreendimento;
- criar interação 3D;
- selecionar elementos do modelo;
- relacionar informações da aplicação à representação tridimensional.

Essa camada não faz parte do escopo acadêmico atual.

Mais detalhes:

**[EVOLUCAO_FUTURA.md](EVOLUCAO_FUTURA.md)**

---

# 🛠️ Ambiente de desenvolvimento

Como os comandos definitivos dependem da estrutura final do repositório, este documento evita assumir nomes de pastas ou scripts que ainda não estejam implementados.

Em termos gerais, o ambiente deverá possuir:

### Frontend

- Node.js;
- npm, pnpm ou yarn;
- Expo CLI por meio das ferramentas oficiais do projeto;
- Android Studio ou dispositivo compatível, quando necessário.

### Backend

- Python;
- ambiente virtual;
- dependências do projeto;
- PostgreSQL;
- Redis, caso o módulo já dependa das tarefas assíncronas.

---

# ▶️ Execução do projeto

Os comandos abaixo devem ser substituídos pelos comandos reais assim que os diretórios e scripts do repositório forem estabilizados.

Estrutura esperada de documentação:

```text
/
├── README.md
├── docs/
│   ├── EVOLUCAO_FUTURA.md
│   └── STACK_TECNOLOGICA.md
├── ...
```

Quando a estrutura real estiver definida, esta seção deverá registrar no mínimo:

1. como instalar as dependências do frontend;
2. como configurar as variáveis de ambiente;
3. como executar o aplicativo;
4. como instalar as dependências do backend;
5. como configurar PostgreSQL e Redis;
6. como executar migrations;
7. como iniciar a API;
8. como executar workers;
9. como rodar testes;
10. como gerar uma build.

---

# 🔐 Variáveis de ambiente

Credenciais e segredos não deverão ser versionados diretamente no Git.

O repositório deverá utilizar um arquivo de exemplo, como:

```text
.env.example
```

Esse arquivo poderá documentar variáveis necessárias, por exemplo:

```text
DATABASE_URL=
REDIS_URL=
OBJECT_STORAGE_ENDPOINT=
OBJECT_STORAGE_BUCKET=
OBJECT_STORAGE_ACCESS_KEY=
OBJECT_STORAGE_SECRET_KEY=
FIREBASE_PROJECT_ID=
```

Os nomes definitivos deverão refletir a implementação real.

---

# ✅ Responsabilidade de cada camada

| Camada | Responsabilidade principal |
| --- | --- |
| React Native + Expo | interface e experiência do usuário |
| Django REST Framework | API e regras de negócio |
| PostgreSQL | persistência dos dados estruturados |
| S3 / Cloudflare R2 | armazenamento de arquivos e evidências |
| Redis + Workers | cache e processamento assíncrono |
| Firebase Cloud Messaging | notificações push |
| OpenTelemetry | telemetria e observabilidade |
| GeoJSON | representação dos dados geoespaciais |
| React Three Fiber + Three.js | visualização 3D futura |

---

# 📌 Regra arquitetural

A interface deve apresentar os dados, mas regras importantes não devem depender exclusivamente do aplicativo cliente.

Sempre que possível:

```text
Frontend → solicita
Backend → valida e processa
Banco/serviços → persistem
Backend → responde
Frontend → apresenta
```

Essa separação facilita manutenção, segurança, auditoria e evolução futura da plataforma.