### FRONT-205 — Garantir responsividade e acessibilidade do shell

**Objetivo**

Manter a navegação utilizável em desktop, tablet e celular, sem perder a
identidade do empreendimento nem a descoberta das abas.

**Escopo**

- Cabeçalho em uma ou duas linhas conforme a largura disponível.
- Navbar horizontal em desktop e mecanismo controlado de quebra ou rolagem
  horizontal em telas estreitas, sem cortar rótulos.
- Conteúdo das abas com grids/cards responsivos e sem overflow horizontal não
  intencional.
- Foco visível, ordem de teclado, nomes acessíveis, `aria-current` e contraste
  suficiente para status e aba ativa.
- Respeito à preferência de redução de movimento.

**Critérios de aceite**

- [ ] Em desktop, cabeçalho, breadcrumb e as sete abas são legíveis sem
  sobreposição , Em desktop os grids devem estar no centro da tela .
- [ ] Em celular, todas as abas continuam alcançáveis e a aba ativa permanece
  identificável.
- [ ] Nenhum conteúdo essencial depende apenas de hover ou de um menu de três
  pontos.
- [ ] Navegação por teclado alcança breadcrumb, abas e ações autorizadas em
  ordem previsível.
- [ ] Não há rolagem horizontal involuntária no conteúdo principal.

**Etapas**

1 - fazer para a página de visualizar
2 - fazer para de editar
3 - fazer para de taxonomia
4 - fazer para de medições
5 - fazer para de documentos

**Dependências**

- `FRONT-201` e `FRONT-202`.
- Tokens de responsividade do tema Bootstrap.

Plano da `FRONT-205` — responsividade e acessibilidade do shell de empreendimentos.

A issue será feita por aba, como definido: visualizar → editar → taxonomia → medições → documentos. O shell será corrigido primeiro para beneficiar todas elas.

1. Base compartilhada: shell

Arquivos:

- [LayoutEmpreendimentos.tsx](/media/samuel/LinuxData/projetos/constructo/Constructo/apps/web/src/modulos/empreendimentos/componentes/LayoutEmpreendimentos.tsx)
- [LayoutEmpreendimentos.css](/media/samuel/LinuxData/projetos/constructo/Constructo/apps/web/src/modulos/empreendimentos/componentes/LayoutEmpreendimentos.css)

Ajustar:

- centralizar o shell em desktop com `max-width` e margem automática;
- manter título, status e metadados quebrando naturalmente em telas menores;
- manter as sete abas com rolagem horizontal intencional no celular;
- adicionar foco visível em breadcrumb e abas usando `:focus-visible`;
- confirmar que `NavLink` já fornece `aria-current="page"` para a aba ativa;
- usar `@media (prefers-reduced-motion: reduce)` para remover transições que forem adicionadas;
- garantir `min-width: 0` nos blocos que podem conter textos longos.

2. Etapa 1 — Visualizar

Arquivos:

- [DetalhesEmpreendimento.tsx](/media/samuel/LinuxData/projetos/constructo/Constructo/apps/web/src/modulos/empreendimentos/componentes/DetalhesEmpreendimento.tsx)
- [DetalhesEmpreendimento.css](/media/samuel/LinuxData/projetos/constructo/Constructo/apps/web/src/modulos/empreendimentos/componentes/DetalhesEmpreendimento.css)

Ajustar os cards para:

- desktop: cards centralizados e com largura máxima;
- tablet: duas colunas quando houver espaço;
- celular: uma coluna;
- lista de atividade: data abaixo do texto no celular, evitando corte;
- textos longos: quebrar linha sem gerar rolagem horizontal;
- leitura por teclado e leitor de tela: títulos e estados de carregamento continuarem identificáveis.

3. Etapa 2 — Editar

Arquivos principais:

- `FormularioEdicaoEmpreendimento.tsx`
- `FormularioEmpreendimento.css`

Ajustar campos, botões e ações para uma coluna no celular, com `label` associado a cada campo, foco visível e mensagens de erro anunciáveis.

4. Etapa 3 — Taxonomia

Arquivos principais:

- `TaxonomyEditor.tsx`
- `TaxonomyEditor.css`
- `TaxonomyConfiguration.css`
- componentes de `ProtocolEditor`

Ajustar árvore, formulários e protocolos para não estourarem horizontalmente. Em telas estreitas, ações devem quebrar em linhas e links de protocolo precisam continuar fáceis de alcançar pelo teclado.

5. Etapa 4 — Medições

A aba ainda usa `AbaIndisponivel`. Enquanto a tela real não existir:

- tornar o estado vazio responsivo;
- garantir título, descrição e futuras ações acessíveis;
- preservar a aba e sua identificação ativa no shell.

6. Etapa 5 — Documentos

Mesmo tratamento inicial de Medições:

- estado indisponível responsivo;
- sem conteúdo dependente de hover;
- estrutura preparada para futura lista de documentos/cards.

7. Validação

- testar larguras: 360 px, 768 px, 1024 px e desktop;
- navegar apenas com `Tab`, `Shift+Tab` e `Enter`;
- verificar aba ativa, foco, breadcrumb e links;
- garantir ausência de rolagem horizontal no conteúdo;
- rodar `pnpm --filter web lint` e testes de rota.

A primeira implementação recomendada é a etapa 1, porque a tela “Visualizar” já tem cards e é a melhor para aprender grids responsivos.