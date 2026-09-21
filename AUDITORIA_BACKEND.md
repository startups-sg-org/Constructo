# Auditoria breve do backend

**Resultado:** os imports de `main.py` estão corretos, mas as rotas ainda têm erros de funcionamento.

1. **A conexão com o SQLite é usada em outra thread.** Em `main.py`, `db` é criado ao carregar o módulo. As rotas síncronas podem executar em outra thread, e o SQLite não permite usar nela a conexão e o cursor criados na primeira. Na verificação, o cadastro resultou em erro 400 e a listagem levantou `ProgrammingError`. **Como corrigir:** criar e usar a conexão e o cursor na mesma thread de cada operação, em vez de compartilhar os objetos criados na importação.

2. **A resposta de sucesso do cadastro tem o formato errado.** Em `main.py`, o `return` da linha 18 usa chaves com um único texto, formando um *set* em Python. Isso produz uma lista JSON, e não um objeto com a mensagem. **Como corrigir:** retornar a mensagem como texto ou como um dicionário com chave e valor.

3. **A senha é gravada em texto puro.** `conexao.py` insere `usuario.senha` diretamente no banco. Se o banco for acessado, as senhas ficam legíveis. **Como corrigir:** guardar um hash da senha em vez da senha original.

**Verificação:** li os arquivos do backend e reproduzi o erro de threads com um banco temporário. Nenhum arquivo Python foi alterado.
