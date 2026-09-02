<div align="center">

<img src="public/assets/img/logo-uft.png" width="120" alt="Logo da Universidade Federal do Tocantins" />

<h1>Constructo</h1>

<p><strong>Gestão e acompanhamento inteligente de obras com dados geoespaciais</strong></p>

</div>

---

## 👥 Equipe

- [José Carlos da Silva Neto](https://github.com/jcarlos721)
- [Eduardo Lopes de Oliveira Torres](https://github.com/EduLps1)
- [Pedro Ryan Oliveira de Almeida](https://github.com/PdroRyan)
- [Samuel Andrade Luz Carneiro](https://github.com/Samuel1-salc)

---

## 📚 Documentação

Este repositório divide sua documentação em três partes:

1. **README.md** — visão do produto e entregáveis da disciplina;
2. **[EVOLUCAO_FUTURA.md](docs/EVOLUCAO_FUTURA.md)** — recursos planejados para depois da entrega acadêmica;
3. **[STACK_TECNOLOGICA.md](docs/STACK_TECNOLOGICA.md)** — arquitetura, tecnologias adotadas e papel de cada componente.

---

## 🎓 Informações acadêmicas

<div align="center">

<table align="center">
  <tbody>
    <tr>
      <th align="left">Instituição</th>
      <td align="left">Universidade Federal do Tocantins (UFT)</td>
    </tr>
    <tr>
      <th align="left">Curso</th>
      <td align="left">Bacharelado em Ciência da Computação</td>
    </tr>
    <tr>
      <th align="left">Disciplina</th>
      <td align="left">Desenvolvimento Webmobile</td>
    </tr>
    <tr>
      <th align="left">Professor</th>
      <td align="left">Jackson Gomes de Souza</td>
    </tr>
    <tr>
      <th align="left">Semestre</th>
      <td align="left">2026.2</td>
    </tr>
  </tbody>
</table>

</div>

---

# 🏗️ Sobre o produto

O **Constructo** é uma plataforma de gestão e acompanhamento de obras projetada para reunir, em uma única aplicação, informações operacionais, documentos, evidências, indicadores e dados geoespaciais relacionados à execução de empreendimentos.

A proposta é reduzir a fragmentação de informações que normalmente ficam distribuídas entre planilhas, relatórios, arquivos, mensagens e sistemas distintos.

O produto organiza essas informações em uma experiência integrada, permitindo que gestores, equipes responsáveis e clientes acompanhem a evolução de uma obra a partir de diferentes níveis de detalhe.

Um dos elementos centrais da solução é o uso de **GeoJSON** para representar geograficamente obras e áreas de interesse. Ao selecionar uma obra no mapa, o usuário poderá visualizar sua situação, indicadores de execução e, quando necessário, acessar os documentos que sustentam cada informação apresentada.

---

## 🎯 Problema

O acompanhamento de uma obra costuma envolver diferentes fontes de informação:

- cronogramas;
- planilhas de medição;
- relatórios;
- documentos técnicos;
- registros fotográficos;
- informações financeiras;
- comunicados;
- dados de segurança e qualidade.

Quando esses dados permanecem separados, torna-se mais difícil responder rapidamente perguntas como:

- Onde está a obra?
- Qual é seu estágio atual?
- Está dentro do prazo?
- Está dentro do orçamento?
- Existem problemas de qualidade?
- Existem pendências críticas?
- Qual documento originou determinado indicador?

O **Constructo** busca transformar essas informações em uma visão integrada e rastreável.

---

# 💡 Solução proposta

A aplicação será estruturada em módulos complementares.

O fluxo de acompanhamento pode ser resumido da seguinte forma:

<p align="center">
<strong>Obra → território → situação → indicador → causa → evidência</strong>
</p>

A plataforma deverá permitir que o usuário navegue desde uma visão resumida da obra até os dados e documentos que sustentam cada informação apresentada.

---

# 📦 Escopo da entrega da disciplina

Para a disciplina de **Desenvolvimento Webmobile**, a equipe pretende entregar a plataforma funcional contemplando os módulos descritos abaixo.

> [!IMPORTANT]
> A principal funcionalidade da visão completa do produto que **não fará parte da entrega da disciplina** é a **visualização tridimensional do imóvel/empreendimento**, incluindo o processamento e a renderização de modelos GLB, glTF, BIM ou IFC.

---

## 1. Autenticação, autorização e usuários

A aplicação deverá possuir mecanismos para:

- autenticação de usuários;
- autorização de acesso;
- gestão de perfis e permissões;
- controle das funcionalidades disponíveis conforme o tipo de usuário.

---

## 2. Gestão da estrutura dos empreendimentos

A plataforma deverá permitir organizar informações relacionadas a:

- construtoras;
- empreendimentos;
- obras;
- torres;
- pavimentos;
- unidades.

Essa estrutura será utilizada pelos demais módulos da aplicação.

---

## 3. Gestão administrativa das obras

Usuários autorizados poderão cadastrar, editar e acompanhar informações das obras por meio de interfaces administrativas.

O módulo deverá permitir manter atualizados dados relevantes para o acompanhamento dos empreendimentos.

---

## 4. Atualizações, aprovação e publicação

A plataforma deverá suportar um fluxo de atualização das informações da obra, permitindo separar o processo de:

1. registro da atualização;
2. validação pelo responsável;
3. aprovação;
4. publicação das informações.

O objetivo é evitar que dados ainda não validados sejam apresentados como informações oficiais.

---

## 5. Fotos, documentos e evidências

As obras poderão possuir arquivos vinculados às suas atualizações, como:

- fotografias;
- plantas;
- relatórios;
- planilhas;
- documentos técnicos;
- outras evidências de execução.

Esses arquivos poderão servir tanto para consulta quanto para comprovar informações apresentadas nos módulos de acompanhamento.

---

## 6. Timeline, comunicados e notificações

O Constructo deverá reunir as principais atualizações da obra em uma linha do tempo.

A plataforma poderá utilizar essa estrutura para apresentar:

- avanço da obra;
- novas evidências;
- alterações importantes;
- comunicados oficiais;
- notificações destinadas aos usuários relacionados ao empreendimento.

---

## 7. Módulo Meu Apê

Clientes poderão ser vinculados às respectivas unidades para acessar uma visão direcionada ao seu imóvel.

O módulo deverá permitir consultar informações publicadas sobre o empreendimento e sua evolução.

A **visualização tridimensional do imóvel**, entretanto, ficará fora da entrega acadêmica atual.

---

## 8. Auditoria e histórico

As principais alterações realizadas no sistema deverão possuir rastreabilidade.

A aplicação deverá manter informações suficientes para identificar:

- o que foi alterado;
- quando a alteração ocorreu;
- quem realizou a alteração;
- qual era o estado anterior, quando aplicável.

---

## 9. Isolamento entre construtoras

A aplicação será organizada para impedir que dados pertencentes a uma construtora sejam acessados indevidamente por usuários de outra organização.
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
│ Python        +      FastAPI │
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
Esse isolamento é parte importante da proposta de evolução do Constructo como plataforma SaaS.

---

# 🗺️ 10. Acompanhamento geoespacial com GeoJSON

O **GeoJSON** será utilizado para representar obras e áreas de interesse no mapa.

Cada `Feature` poderá representar uma obra, região ou elemento geográfico relevante.

No contexto do Constructo:

- `geometry` define onde o elemento será representado;
- `properties` armazena informações associadas à obra;
- pontos, linhas e polígonos poderão ser utilizados conforme o conjunto de dados.

Exemplo conceitual:

```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [-48.3336, -10.184]
  },
  "properties": {
    "nome": "Obra Exemplo",
    "status": "em_execucao",
    "progresso": 58,
    "ultimaAtualizacao": "2026-09-02"
  }
}
```

A interface deverá permitir:

- carregar dados geográficos;
- representar as obras no mapa;
- selecionar uma obra;
- destacar visualmente seu estado;
- abrir as informações relacionadas ao empreendimento.

---

# 📊 11. Acompanhamento inteligente da saúde da obra

Ao selecionar uma obra no mapa, o Constructo deverá apresentar um painel resumido de acompanhamento.

A ideia é permitir que o usuário compreenda rapidamente se a obra apresenta problemas relacionados a:

- avanço físico;
- prazo;
- custo;
- qualidade;
- segurança;
- previsão de conclusão.

O painel não substitui os documentos técnicos. Ele funciona como uma camada de resumo e navegação até as informações originais.

---

## Indicadores principais

| Indicador | Objetivo |
| --- | --- |
| **Avanço físico** | Comparar o percentual planejado com o percentual realizado |
| **SPI — desempenho de prazo** | Avaliar se a obra está avançando no ritmo planejado |
| **CPI — desempenho de custo** | Avaliar a eficiência do custo em relação ao valor entregue |
| **Desvio financeiro** | Mostrar quanto o gasto real se afastou do previsto |
| **Previsão de conclusão** | Estimar quando a obra tende a terminar nas condições atuais |
| **EAC — custo ao término** | Projetar o custo provável da obra ao final |
| **Qualidade** | Identificar não conformidades, criticidade e retrabalho |
| **Segurança** | Acompanhar acidentes, incidentes e pendências críticas |

---

## Status por dimensão

Os indicadores deverão ser apresentados de forma compreensível, priorizando a leitura por dimensão.

Exemplo:

| Dimensão | Exemplo de leitura |
| --- | --- |
| Execução física | 58% realizado / 65% planejado |
| Prazo | SPI 0,89 / atraso projetado de 28 dias |
| Custo | CPI 0,96 / EAC calculado |
| Qualidade | não conformidades abertas e críticas |
| Segurança | dias sem acidentes e pendências existentes |

Os estados poderão ser classificados visualmente, por exemplo, como:

- normal;
- atenção;
- crítico.

As regras e tolerâncias deverão permanecer transparentes e poderão variar conforme empresa, contrato ou tipo de obra.

---

## Rastreabilidade dos indicadores

Cada indicador apresentado no painel deverá possuir vínculo com sua origem.

Ao acessar um indicador, o usuário deverá conseguir consultar, quando disponível:

- fórmula utilizada;
- valores considerados no cálculo;
- histórico do indicador;
- causas principais;
- documento ou evidência de origem.

Exemplo conceitual:

<p align="center">
<strong>GeoJSON → Status → Indicador → Causa → Documento</strong>
</p>

Um SPI abaixo do esperado, por exemplo, poderá conduzir o usuário até a atividade responsável pelo atraso e, depois, até o cronograma, planilha de medição ou relatório que originou o dado.

---

# 🔄 Jornada principal do produto

Uma jornada típica poderá seguir o fluxo:

1. o usuário entra na plataforma;
2. acessa uma obra ou empreendimento;
3. consulta sua localização no mapa;
4. seleciona a área representada pelo GeoJSON;
5. visualiza o painel resumido de saúde da obra;
6. identifica um indicador em estado de atenção ou crítico;
7. consulta as causas e o histórico;
8. acessa o documento que originou aquela informação;
9. acompanha fotos, atualizações e comunicados relacionados;
10. usuários autorizados registram novas informações;
11. as atualizações passam pelo fluxo de validação e publicação;
12. as alterações permanecem registradas no histórico de auditoria.

---

# ✅ Critérios gerais de conclusão da entrega

A entrega acadêmica será considerada funcional quando os módulos implementados permitirem demonstrar o fluxo principal do Constructo, incluindo:

- autenticação e controle de acesso;
- gestão das entidades necessárias ao empreendimento;
- cadastro e atualização de obras;
- armazenamento e consulta de evidências;
- acompanhamento por timeline;
- vinculação de clientes às unidades;
- representação geográfica das obras;
- seleção da obra por meio do mapa;
- apresentação dos indicadores principais;
- rastreabilidade dos indicadores até suas fontes;
- histórico e auditoria das principais operações;
- tratamento adequado de erros;
- interface adaptada ao uso em dispositivos móveis.

A visualização tridimensional do imóvel não faz parte desses critérios.

---

# 🚀 Continuidade do produto

Os recursos planejados para depois da disciplina estão documentados separadamente em:

**[docs/EVOLUCAO_FUTURA.md](docs/EVOLUCAO_FUTURA.md)**

A arquitetura e a função de cada tecnologia estão documentadas em:

**[docs/STACK_TECNOLOGICA.md](docs/STACK_TECNOLOGICA.md)**
