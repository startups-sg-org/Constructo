## Descrição

Permitir que etapas, subetapas e marcos possuam uma descrição específica para o comprador.

O objetivo é traduzir informações técnicas da obra para uma linguagem simples e compreensível.

## Implementar

Adicionar ou utilizar o campo:

`descricao_cliente`

Permitir preenchimento em:

- etapa;
- subetapa;
- marco.

Exemplo técnico:

Execução das redes hidráulicas embutidas.

Exemplo para o comprador:

As tubulações que levarão água aos ambientes do seu apartamento estão sendo instaladas antes do fechamento das paredes.

Separar claramente:

- descrição técnica;
- descrição para o comprador.

Preparar a API da área do cliente para utilizar somente a descrição amigável quando apropriado.

## Critérios de aceite

- [x] etapa possui descrição para comprador;
- [x] subetapa possui descrição para comprador;
- [x] marco possui descrição para comprador;
- [x] descrição é persistida corretamente;
- [x] descrição pode ser editada;
- [ ] frontend administrativo permite preencher ambos os textos;
- [ ] área do comprador pode consumir a descrição amigável sem depender da descrição técnica.