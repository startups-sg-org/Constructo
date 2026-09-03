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

---

## 10. DOMINUS — Inteligência territorial da obra

O **DOMINUS** será o módulo geoespacial do **Constructo**, responsável por representar obras e áreas de interesse diretamente sobre o território.

A representação geográfica utilizará dados no formato **GeoJSON**, permitindo delimitar áreas relacionadas às obras cadastradas e associar informações de acompanhamento a essas regiões.

<div align="center">

<img src="public/assets/img/mapa_palmas.png" width="850" alt="Interface do módulo DOMINUS">

</div>

Ao selecionar uma obra ou área representada no mapa, o usuário poderá acessar uma visão resumida de sua situação.

O módulo poderá apresentar indicadores relacionados a:

- progresso físico;
- situação do cronograma;
- custos e desvios financeiros;
- produtividade;
- qualidade da execução;
- riscos e ocorrências;
- situação geral da obra.

Sempre que aplicável, os indicadores poderão ser relacionados às respectivas **fontes de evidência**, permitindo que o usuário avance da visão resumida apresentada no mapa até:

- planilhas;
- relatórios;
- documentos técnicos;
- registros fotográficos;
- demais arquivos vinculados à obra.

O objetivo do módulo é permitir uma navegação baseada no fluxo:

<p align="center">
<strong>território → obra → situação → indicador → evidência</strong>
</p>

Dessa forma, o **DOMINUS** funcionará como uma interface territorial para consulta e acompanhamento das informações gerenciadas pelos demais módulos do Constructo.

---