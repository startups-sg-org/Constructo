# 🚀 Constructo — Evolução futura

[← Voltar ao README principal](../README.md)

---

## Objetivo deste documento

Este documento registra funcionalidades e linhas de evolução que **não constituem compromisso da entrega atual da disciplina**.

A entrega acadêmica contempla a plataforma de gestão, acompanhamento, GeoJSON, indicadores e rastreabilidade descritos no `README.md`.

A principal frente funcional deixada para uma etapa posterior é a **visualização avançada do imóvel/empreendimento**.

---

# 🏢 1. Visualização tridimensional do imóvel

A evolução mais importante prevista para o Constructo é permitir a visualização interativa de empreendimentos e unidades por meio de modelos tridimensionais.

A proposta é permitir que o usuário explore visualmente o imóvel e relacione o modelo 3D às informações já existentes na plataforma.

Possíveis recursos:

- visualização de modelos 3D do empreendimento;
- navegação por torres, pavimentos e unidades;
- destaque de elementos conforme estado da obra;
- associação entre elementos visuais e dados do sistema;
- abertura de informações da unidade diretamente a partir do modelo.

---

# 🧱 2. GLB e glTF

Uma futura versão poderá utilizar modelos nos formatos **GLB** e **glTF** para representar os empreendimentos.

A camada de visualização poderá ser desenvolvida com:

- React Three Fiber;
- Three.js.

Essa frente exigirá decisões adicionais relacionadas a:

- tamanho máximo dos modelos;
- carregamento progressivo;
- otimização de geometria e texturas;
- desempenho em dispositivos móveis;
- armazenamento dos arquivos;
- versionamento dos modelos.

---

# 🏗️ 3. Integração futura com BIM e IFC

Em uma etapa posterior, o Constructo poderá investigar formas de receber modelos originados de fluxos BIM.

Possibilidades:

- ingestão de arquivos IFC;
- conversão para formatos adequados à visualização web/mobile;
- associação entre entidades BIM e registros do sistema;
- vinculação entre elementos físicos e etapas executivas;
- atualização semiautomática do estado visual da obra.

Essa funcionalidade depende de estudo técnico específico e não faz parte da entrega acadêmica atual.

---

# 🌐 4. Experiências imersivas

A camada 3D poderá evoluir para experiências mais avançadas, como:

- tours virtuais;
- visualizações 360°;
- navegação imersiva;
- realidade aumentada;
- sobreposição de informações do empreendimento no ambiente físico.

---

# 📈 5. Inteligência e análises avançadas

Após a consolidação dos indicadores principais, o sistema poderá incorporar indicadores de segunda camada, como:

- produtividade por serviço;
- atividades críticas atrasadas;
- aditivos financeiros;
- aditivos de prazo;
- taxa de retrabalho;
- desempenho de fornecedores;
- acompanhamento de medições;
- situação de suprimentos;
- riscos;
- pendências de campo.

Também poderão ser estudados:

- previsões baseadas no histórico;
- detecção de tendências de atraso;
- comparação entre empreendimentos;
- painéis executivos;
- análises agregadas entre obras.

---

# 🔌 6. Integrações mais profundas

O Constructo poderá evoluir para integrações automatizadas com sistemas externos utilizados pelas construtoras.

Exemplos de possibilidades:

- ERPs;
- sistemas financeiros;
- ferramentas de planejamento;
- sistemas de medição;
- plataformas documentais;
- ferramentas BIM.

O objetivo será reduzir lançamentos duplicados e aumentar a rastreabilidade entre a fonte operacional e os indicadores apresentados pelo Constructo.

---

# 🎯 Visão de longo prazo

A visão de longo prazo é transformar o Constructo em uma plataforma em que diferentes representações da obra estejam conectadas:

<p align="center">
<strong>Gestão → território → indicadores → documentos → modelo 3D</strong>
</p>

O mapa e os indicadores funcionam como a camada de acompanhamento da execução.

A futura visualização tridimensional adicionará uma nova camada de navegação, sem substituir os dados técnicos, documentos e registros que sustentam o acompanhamento da obra.