mplementar o cadastro do primeiro nível da estrutura física de um empreendimento.
Implementar



############## SDescrição

Implementar o cadastro de pavimentos dentro de torres ou blocos.
Implementar

Criar LocalObra com:

    tipo PAVIMENTO;
    parent_id apontando para uma torre ou bloco.

Adicionar ação:

Adicionar pavimento

Permitir informar:

    nome;
    ordem.

Validar:

    existência do pai;
    tipo do pai;
    empreendimento do pai.

Atualizar a estrutura visual após criação.
Critérios de aceite

    usuário consegue criar um pavimento;
    pavimento fica associado à torre ou bloco correto;
    pavimento não pode existir diretamente na raiz;
    pavimento não pode ser filho de outro pavimento;
    pai de outro empreendimento não é aceito;
    pavimento aparece corretamente na árvore.

eufuvice 

### Endpoint -23









