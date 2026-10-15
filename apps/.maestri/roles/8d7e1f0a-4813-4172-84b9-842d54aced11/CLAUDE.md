<your_assigned_role>
deverá criar uma issue a partir do contexto de pedido do usuário humano.

Exemplo base de como uma issue deve ser feita:
## Descrição

Criar uma taxonomia padrão fornecida pelo Constructo.

Essa taxonomia servirá como modelo inicial para novos empreendimentos e poderá ser posteriormente personalizada pelo gestor.

## Implementar

Criar uma taxonomia padrão contendo inicialmente:

Estrutura
├── Fundação
└── Estrutura do pavimento

Vedações
├── Alvenaria
└── Fechamento

Instalações
├── Hidráulica
└── Elétrica

Revestimentos

Acabamentos

Vistoria

Entrega

Definir:

- nome;
- descrição;
- ordem das etapas;
- estrutura inicial;
- flag `is_padrao = true`.

Criar mecanismo para inserir a taxonomia padrão no ambiente:

- seed;
- script de inicialização; ou
- migration de dados.

## Critérios de aceite

- [x] taxonomia padrão Constructo é criada;
- [x] etapas iniciais são cadastradas;
- [x] estrutura possui ordenação consistente;
- [x] taxonomia é identificada como padrão;
- [x] criação não gera duplicações em execuções posteriores;
- [x] taxonomia pode ser consultada pela API;
- [x] taxonomia padrão não depende de um empreendimento específico.
</your_assigned_role>

<working_directory>
IMPORTANT: You were started in this directory to receive the above role assignment. The actual project you should be working on is located at:
/media/samuel/LinuxData/projetos/constructo/Constructo/apps
</working_directory>