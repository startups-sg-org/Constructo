<div align="center">
    <img src="public/assets/img/logo-uft.png width=120"/>
    <h2>Universidade Federal do Tocantins (UFT)</h2>
</div>

**Curso:** Bacharelado em Ciência da Computação  
**Professor:** Jackson Gomes de Souza  
**Disciplina:** Desenvolvimento Webmobile
**Semestre:** 2026.2

**👥 Equipe**
* [**José Carlos da Silva Neto**](https://github.com/bibimoura)
* [**Eduardo Lopes de Oliveira Torres**](https://github.com/EduLps1)
* [**Pedro Ryan Oliveira de Almeida**](https://github.com/PdroRyan)
* [**Samuel Andrade Luz Carneiro**](https://github.com/Samuel1-salc)

# 🏗️ WorkSite 3D-View

O **WorkSite 3DVIEW** é uma plataforma digital multiempreendimento voltada para a construção civil, desenvolvida para transformar o acompanhamento do avanço físico de obras em uma experiência **3D interativa, visual, rastreável e transparente**.

A proposta é conectar os dados de progresso informados pela engenharia em campo à representação tridimensional do projeto, permitindo que clientes e construtoras acompanhem a evolução do empreendimento em tempo real.

O objetivo da plataforma não é apenas exibir relatórios de status em texto, mas traduzir dados técnicos em um modelo 3D dinâmico que torna a evolução da obra compreensível para o comprador e auditável para a construtora.

---

# 🎯 Problema

Na construção civil tradicional, o acompanhamento do progresso de obras enfrenta diversos desafios de comunicação e gestão:

* **Falta de transparência:** O comprador muitas vezes não entende relatórios técnicos e percentuais abstratos.
* **Alto volume de chamados:** Dúvidas recorrentes no atendimento pós-venda sobre o status da unidade ("Como está o meu apê?").
* **Dados fragmentados:** Informações de progresso, fotos, comunicados e cronogramas dispersos em diferentes canais.
* **Ausência de histórico auditável:** Dificuldade em rastrear quem atualizou determinado percentual e quando a evidência foi registrada.
* **Desconexão visual:** Dificuldade em visualizar como um percentual (ex: "65% de estrutura") se traduz visualmente na edificação real.

---

# 💡 Proposta

O **WorkSite 3DVIEW** busca criar um fluxo contínuo e integrado de informação:

**Campo (Engenharia) → Atualização de Progresso → Mapeamento de Meshes → Atualização do Modelo 3D → Notificação ao Cliente → Transparência**

A plataforma acompanha o desenvolvimento físico do empreendimento para responder continuamente à pergunta central do cliente:

> **Em qual estágio exatamente está a construção do meu imóvel hoje?**

---

# 👥 Perfis de Usuário

A plataforma suporta uma estrutura hierárquica nativa (**Construtora → Empreendimento → Torre/Bloco → Pavimento → Unidade → Cliente**) com permissões e visibilidade segmentadas:

### 🏠 Cliente / Comprador
* Acesso restrito aos seus empreendimentos e unidades vinculadas.
* Visualização interativa do modelo 3D com destaque visual por status de construção.
* Acesso ao módulo **Meu Apê**, linha do tempo (*timeline*), galeria de fotos e comunicados oficiais.

### 👷 Engenharia / Obra
* Atualização das etapas construtivas, percentuais de avanço, datas e observações.
* Anexo de evidências fotográficas por etapa e pavimento.
* Submissão de atualizações em rascunho/validação antes da publicação final.

### 🏢 Administrador da Construtora
* Gestão completa de empreendimentos, torres, unidades, modelos 3D e usuários.
* Configuração de permissões de acesso e regras multi-tenant.
* Consulta a históricos de auditoria (*AuditLog*) e acompanhamento geral.

---

# 🎨 Mapeamento 3D e Progresso

Um dos principais diferenciais do WorkSite 3DVIEW é a associação entre as etapas da obra e os elementos do modelo 3D (*meshes* identificáveis do arquivo GLB/gLTF).

À medida que o progresso é atualizado, o visualizador 3D altera dinamicamente o estado visual dos elementos na cena:

| Status da Etapa | Estado Visual no Modelo 3D |
| :--- | :--- |
| **Não Iniciada** | Oculto / Transparente |
| **Em Execução** | Destacado / Semitransparente |
| **Concluída** | Visível com acabamento final |
| **Selecionado** | Foco de câmera + Painel contextual de dados |

---

# 🧩 Estrutura do Sistema

O WorkSite 3DVIEW é dividido nos seguintes domínios operacionais:

| Domínio | Responsabilidade |
| :--- | :--- |
| **Usuários & Auth** | Cadastro, autenticação, perfis e autorização por objeto |
| **Empreendimentos** | Hierarquia de torres, pavimentos, unidades e dados do imóvel |
| **Progresso & Etapas** | Etapas construtivas, percentuais ponderados e workflow de publicação |
| **Visualizador 3D** | Ingestão de GLB/gLTF, parsing de meshes e mapeamento de status |
| **Evidências & Mídia** | Gestão e armazenamento de fotos de obra, plantas e arquivos em S3/R2 |
| **Comunicação** | Timeline de atualizações, galeria de fotos, comunicados e notificações push |
| **Auditoria** | Registro imutável de alterações de progresso (*AuditLog*) |
| **Analytics** | Métricas de uso do app, abertura de telas e engajamento com o 3D |

---

# 💻 Stack Tecnológica

O projeto adota uma arquitetura escalável e moderna, voltada para performance em dispositivos móveis:

| Camada | Tecnologia | Função Principal |
| :--- | :--- | :--- |
| **Mobile App** | React Native + Expo | Aplicativo nativo para iOS e Android |
| **Renderização 3D** | React Three Fiber + Three.js | Motor de renderização 3D para runtime mobile |
| **Backend / API** | Python + Django REST Framework | Regras de negócio, API RESTful, autorização e Admin |
| **Banco de Dados** | PostgreSQL | Armazenamento relacional com suporte a metadados JSONB |
| **Armazenamento** | S3 / Cloudflare R2 | Storage de mídia (fotos, plantas) e modelos 3D |
| **Filas & Cache** | Redis + Workers Assíncronos | Processamento de imagens, compressão e envios |
| **Observabilidade** | OpenTelemetry | Traces, métricas e logs correlacionados |
| **Notificações** | Firebase Cloud Messaging (FCM) | Envio de push notifications segmentadas |

---

# 🚀 MVP (Produto Mínimo Viável)

A primeira versão do WorkSite 3DVIEW foca em validar a proposta central com baixo risco operacional:

* Autenticação e perfil de usuários com isolamento multi-tenant.
* Cadastro de empreendimento, torres e unidades no painel administrativo.
* Workflow de atualização da obra (rascunho → validação → publicação) com evidências fotográficas.
* Visualizador 3D funcional carregando arquivo GLB otimizado e reativo ao progresso.
* Módulo **Meu Apê** com timeline de evolução e galeria de fotos com filtros.
* Registro de auditoria (*AuditLog*) para todas as ações administrativas e de engenharia.

---

# ⭐ Diferencial

O principal diferencial do WorkSite 3DVIEW não é ser apenas um portal de notícias nem um visualizador 3D estático isolado.

A proposta é construir um:

> **Vínculo dinâmico entre o dado real de engenharia e a representação visual 3D do imóvel.**

Em vez de simplesmente informar ao cliente:

> *A etapa de Estrutura da Torre A está em 60%.*

A plataforma exibe a torre em 3D com os pavimentos concluídos renderizados, o andar em execução em destaque e as etapas futuras não iniciadas, permitindo que o comprador **visualize exatamente o avanço físico do seu futuro imóvel**.

---

# 🛣️ Roadmap

### Fase 0 — Descoberta Técnica (2-3 semanas)
* Definição do orçamento de geometria/texturas 3D e testes de fluidez em celulares.
* Estabelecimento das convenções de nomenclatura de meshes e prototipação do fluxo da API.

### Fase 1 — MVP Operacional (6-10 semanas)
* Desenvolvimento dos módulos base: Auth, Domínio, Progresso, Fotos, 3D básico e Painel Admin.
* Validação da jornada completa: *Engenharia atualiza → Sistema registra → Modelo reage → Cliente entende*.

### Fase 2 — Piloto Controlado (3-5 semanas)
* Operação em campo com um empreendimento real e clientes convidados.
* Ajustes de performance, envio de push notifications e monitoramento via logs/analytics.

### Fase 3 — Escala do Produto (6-10 semanas)
* Painel web especializado em Next.js para engenharia.
* Processamento assíncrono de modelos, CDN para assets e relatório comparativo *Planejado x Realizado*.

### Fase 4 — Plataforma Avançada
* Ingestão automatizada de arquivos BIM/IFC.
* Recursos imersivos: Tour virtual 360°, Realidade Aumentada (AR/VR) e integrações com ERPs da construção.

---

# 📌 Princípios do Produto

* **Conectividade Dado-3D:** O modelo tridimensional deve responder diretamente aos dados de campo.
* **Segurança e Múltiplos Inquilinos:** Isolamento estrito de dados entre construtoras, empreendimentos e clientes.
* **Operação Simplificada:** A engenharia precisa de um fluxo rápido e sem fricção para registrar avanços.
* **Clareza para o Comprador:** Traduzir termos técnicos e cronogramas em uma experiência visual simples.
* **Validação Gradual:** Consolidar convenções e performance mobile antes de evoluir para pipelines complexos de BIM.

---

# 🌐 Visão

O **WorkSite 3DVIEW** pretende se consolidar como a solução padrão para **transparência e acompanhamento visual de obras** no mercado imobiliário.

