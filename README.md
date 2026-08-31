<div align="center">

<img src="public/assets/img/logo-uft.png" width="120" alt="Logo da UFT"/>

<h2>Universidade Federal do Tocantins (UFT)</h2>

</div>

**Curso:** Bacharelado em Ciência da Computação
**Professor:** Jackson Gomes de Souza
**Disciplina:** Desenvolvimento Webmobile
**Semestre:** 2026.2

## 👥 Equipe

* [**José Carlos da Silva Neto**](https://github.com/bibimoura)
* [**Eduardo Lopes de Oliveira Torres**](https://github.com/EduLps1)
* [**Pedro Ryan Oliveira de Almeida**](https://github.com/PdroRyan)
* [**Samuel Andrade Luz Carneiro**](https://github.com/Samuel1-salc)

# 🏗️ WorkSite 3D-View

O **WorkSite 3D-View** é uma plataforma digital multiempreendimento voltada para a construção civil, criada para transformar o acompanhamento do avanço físico de obras em uma experiência **visual, interativa, rastreável e transparente**.

A proposta é conectar os dados de progresso registrados pela engenharia em campo à representação tridimensional do empreendimento, permitindo que clientes e construtoras acompanhem a evolução da obra de forma centralizada e compreensível.

Em vez de apresentar apenas percentuais e relatórios técnicos, a plataforma busca representar visualmente o estágio da construção por meio de um modelo 3D dinâmico.

---

# 🎯 Problema

O acompanhamento tradicional de obras apresenta desafios de comunicação e gestão, entre eles:

* **Falta de transparência:** percentuais e relatórios técnicos podem ser difíceis de interpretar pelo comprador;
* **Alto volume de chamados:** clientes recorrem frequentemente ao atendimento para saber o estágio de suas unidades;
* **Dados fragmentados:** informações de progresso, fotos, comunicados e cronogramas ficam distribuídos entre diferentes canais;
* **Ausência de histórico auditável:** dificuldade em identificar quem realizou determinada atualização e quando ela ocorreu;
* **Desconexão visual:** um percentual como “65% da estrutura concluída” não demonstra claramente ao cliente o que já foi construído.

---

# 💡 Proposta

O **WorkSite 3D-View** busca estabelecer um fluxo integrado entre engenharia, sistema e cliente:

**Engenharia registra avanço → Responsável valida → Atualização é publicada → Modelo 3D reflete o progresso → Cliente acompanha a evolução**

A plataforma procura responder continuamente à principal pergunta do comprador:

> **Em qual estágio está a construção do meu imóvel hoje?**

Seu principal diferencial está no vínculo entre o **dado real de progresso da obra** e sua **representação visual no modelo 3D**.

Por exemplo, em vez de apenas informar que determinada etapa está 60% concluída, o sistema poderá representar os pavimentos concluídos, destacar aqueles em execução e diferenciar visualmente as etapas ainda não iniciadas.

---

# 👥 Perfis de Usuário

A plataforma considera a seguinte estrutura hierárquica:

**Construtora → Empreendimento → Torre/Bloco → Pavimento → Unidade → Cliente**

## 🏠 Cliente / Comprador

* Acesso aos empreendimentos e unidades aos quais estiver vinculado;
* Consulta ao progresso da construção;
* Visualização interativa do modelo 3D;
* Acesso ao módulo **Meu Apê**;
* Consulta à timeline, galeria de fotos e comunicados oficiais.

## 👷 Engenharia / Obra

* Registro e atualização das etapas construtivas;
* Informações de percentuais, datas e observações;
* Anexo de evidências fotográficas;
* Envio de atualizações para validação antes da publicação.

## 🏢 Administrador da Construtora

* Gestão de empreendimentos, torres, pavimentos e unidades;
* Gestão de usuários e permissões;
* Vinculação entre clientes e unidades;
* Validação e publicação das atualizações;
* Consulta ao histórico de auditoria.

---

# ✅ Requisitos Funcionais

Os requisitos funcionais estão organizados entre funcionalidades previstas para o MVP da disciplina e funcionalidades destinadas à evolução posterior da plataforma.

## 🧩 Escopo da Disciplina

**RF01 — Gestão de usuários e acesso**
O sistema deverá permitir cadastro, autenticação, gerenciamento de perfis e controle de permissões.

**RF02 — Gestão dos empreendimentos**
O sistema deverá permitir o cadastro e gerenciamento da estrutura de construtoras, empreendimentos, torres, pavimentos e unidades.

**RF03 — Gestão do progresso da obra**
O sistema deverá permitir o registro e a consulta das etapas construtivas, seus percentuais de avanço e o fluxo de atualização, validação e publicação.

**RF04 — Gestão de evidências**
O sistema deverá permitir o envio, armazenamento e consulta de fotografias e arquivos relacionados ao progresso da obra.

**RF05 — Comunicação e acompanhamento**
O sistema deverá disponibilizar timeline de atualizações, galeria de fotografias, comunicados e notificações aos usuários.

**RF06 — Auditoria**
O sistema deverá registrar o histórico das alterações relevantes, identificando a operação realizada, o usuário responsável e o momento da alteração.

**RF07 — Visualização 3D do progresso**
O sistema deverá carregar modelos GLB/glTF previamente preparados e representar visualmente os estados das etapas da construção com base nos dados de progresso registrados.

## 🚀 Evolução Futura

**RF08 — Processamento avançado de modelos 3D**
O sistema poderá evoluir para realizar ingestão, análise e processamento automatizado de modelos tridimensionais mais complexos.

**RF09 — Analytics**
O sistema poderá disponibilizar métricas de utilização da plataforma, incluindo acessos, telas visualizadas e interações com o modelo 3D.

---

# ⚙️ Requisitos Não Funcionais

## 🚀 Desempenho 3D

**RNF01 — Performance do visualizador**
O visualizador 3D deverá proporcionar navegação fluida nos dispositivos móveis suportados, permitindo rotação, zoom, seleção de elementos e movimentação de câmera.

**RNF02 — Limites dos modelos**
Os modelos GLB/glTF deverão respeitar critérios de tamanho e complexidade compatíveis com os dispositivos suportados. Os limites serão definidos por meio de testes durante o desenvolvimento.

**RNF03 — Carregamento**
O sistema deverá minimizar o tempo de carregamento dos modelos e apresentar feedback visual enquanto recursos mais pesados estiverem sendo carregados.

## 🔐 Segurança e Isolamento

**RNF04 — Autenticação e autorização**
Recursos protegidos deverão exigir autenticação válida e respeitar as permissões atribuídas a cada usuário.

**RNF05 — Proteção dos dados**
Dados sensíveis e informações de autenticação deverão ser protegidos durante armazenamento e transmissão.

**RNF06 — Isolamento multi-tenant**
Dados de diferentes construtoras deverão permanecer logicamente isolados, impedindo acesso indevido entre organizações.

## 📱 Compatibilidade

**RNF07 — Compatibilidade mobile**
O aplicativo deverá ser compatível com dispositivos Android e iOS dentro das versões suportadas pelo projeto.

**RNF08 — Responsividade e usabilidade**
A interface deverá adaptar-se aos diferentes tamanhos de tela e considerar interação por toque, legibilidade e facilidade de navegação.

## 🌐 Resiliência

**RNF09 — Tratamento de falhas**
Falhas de comunicação, carregamento ou indisponibilidade temporária de serviços deverão ser tratadas de forma controlada e comunicadas ao usuário.

**RNF10 — Integridade dos dados**
Operações críticas deverão preservar a consistência das informações mesmo diante de falhas ou interrupções.

## 📊 Observabilidade

**RNF11 — Logs e monitoramento**
A aplicação deverá registrar informações relevantes para diagnóstico de erros e permitir o acompanhamento da saúde e do desempenho dos serviços.

---

# 🔄 Jornadas Principais

## 👷 Jornada 1 — Atualização do Progresso

**Ator principal:** Engenharia / Obra

1. O profissional acessa o empreendimento;
2. Seleciona a etapa que deseja atualizar;
3. Informa o progresso, observações e evidências;
4. Salva a atualização como rascunho;
5. O sistema mantém a atualização aguardando validação.

**Resultado esperado:** uma atualização de progresso fica registrada e pronta para análise.

---

## ✅ Jornada 2 — Validação e Publicação

**Ator principal:** Administrador / Responsável pela validação

1. O responsável consulta as atualizações pendentes;
2. Analisa os dados e evidências;
3. Aprova ou rejeita a atualização;
4. Caso aprovada, a informação é publicada;
5. O sistema registra a operação na auditoria;
6. O progresso atualizado fica disponível para os usuários autorizados.

**Resultado esperado:** apenas informações validadas passam a representar oficialmente o estado da obra.

---

## 🏠 Jornada 3 — Acompanhamento pelo Cliente

**Ator principal:** Cliente / Comprador

1. O cliente realiza sua autenticação;
2. Seleciona seu empreendimento ou unidade;
3. Acessa o módulo **Meu Apê**;
4. Consulta o progresso atual;
5. Visualiza a timeline, fotografias e comunicados;
6. Acessa o modelo 3D para visualizar o estágio da construção.

**Resultado esperado:** o cliente consegue compreender e acompanhar a evolução do seu imóvel em um único ambiente.

---

## 🏢 Jornada 4 — Gestão do Empreendimento

**Ator principal:** Administrador da Construtora

1. O administrador gerencia empreendimentos, torres, pavimentos e unidades;
2. Vincula clientes às respectivas unidades;
3. Gerencia usuários e permissões;
4. Consulta o andamento dos empreendimentos;
5. Consulta o histórico das operações realizadas.

**Resultado esperado:** a construtora mantém centralizada a administração das informações e dos acessos à plataforma.

---

# 🎨 Mapeamento 3D e Progresso

Um dos principais elementos do **WorkSite 3D-View** é a associação entre os dados de progresso da obra e os elementos identificáveis do modelo GLB/glTF.

Conforme o estado da construção é atualizado, o visualizador poderá alterar a representação dos elementos correspondentes:

| Status           | Representação no Modelo 3D                         |
| :--------------- | :------------------------------------------------- |
| **Não iniciada** | Oculto ou transparente                             |
| **Em execução**  | Destacado ou semitransparente                      |
| **Concluída**    | Visível com acabamento final                       |
| **Selecionado**  | Destaque, foco da câmera e informações contextuais |

No MVP, serão utilizados modelos previamente preparados e organizados para permitir essa associação, evitando a necessidade de processamento automatizado de modelos BIM complexos.

---

# 💻 Stack Tecnológica

| Camada              | Tecnologia                     | Função                                  |
| :------------------ | :----------------------------- | :-------------------------------------- |
| **Mobile**          | React Native + Expo            | Aplicativo para Android e iOS           |
| **Renderização 3D** | React Three Fiber + Three.js   | Visualização e interação com modelos 3D |
| **Backend / API**   | Python + Django REST Framework | Regras de negócio, API e autorização    |
| **Banco de Dados**  | PostgreSQL                     | Persistência dos dados                  |
| **Armazenamento**   | S3 / Cloudflare R2             | Fotografias, arquivos e modelos 3D      |
| **Filas e Cache**   | Redis + Workers                | Processamento assíncrono e cache        |
| **Observabilidade** | OpenTelemetry                  | Logs, métricas e traces                 |
| **Notificações**    | Firebase Cloud Messaging       | Notificações push                       |

---

# 🚀 MVP

A primeira versão do **WorkSite 3D-View** tem como objetivo validar o fluxo principal da plataforma com baixa complexidade operacional.

O MVP contempla:

* Autenticação e controle de usuários;
* Isolamento multi-tenant;
* Cadastro de empreendimentos, torres, pavimentos e unidades;
* Registro manual do progresso da obra;
* Workflow de rascunho, validação e publicação;
* Evidências fotográficas;
* Timeline de evolução;
* Galeria de fotos;
* Módulo **Meu Apê**;
* Registro de auditoria;
* Visualizador 3D utilizando modelos GLB/glTF previamente preparados;
* Representação visual do progresso da construção no modelo 3D.

O MVP não pretende realizar processamento automático de modelos BIM. A prioridade é validar o fluxo:

**Engenharia atualiza → Sistema registra → Responsável valida → Modelo reage → Cliente entende**

---

# 🛣️ Roadmap

## Fase 0 — Descoberta Técnica

* Testes de performance dos modelos 3D em dispositivos móveis;
* Definição dos limites de geometria e texturas;
* Definição das convenções de identificação dos elementos dos modelos;
* Prototipação da comunicação entre API e visualizador 3D.

## Fase 1 — MVP Operacional

* Desenvolvimento de autenticação, domínio, progresso, evidências, auditoria e visualização 3D;
* Implementação do módulo **Meu Apê**;
* Validação da jornada completa entre engenharia e cliente.

## Fase 2 — Piloto Controlado

* Testes com um empreendimento;
* Ajustes de performance e usabilidade;
* Implementação e validação das notificações;
* Monitoramento de erros e utilização.

## Fase 3 — Evolução da Plataforma

* Painel web especializado para engenharia;
* Processamento assíncrono de modelos e arquivos;
* CDN para distribuição de assets;
* Relatórios de planejado x realizado;
* Expansão dos recursos de analytics.

## Fase 4 — Recursos Avançados

* Ingestão automatizada de BIM/IFC;
* Integrações com sistemas externos e ERPs;
* Tour virtual 360°;
* Realidade Aumentada e Realidade Virtual.
