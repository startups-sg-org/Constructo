import sqlite3

class GerenciadorDeUsuarios:
    def __init__(self, nome_do_banco="constructo.db"):
        self.conexao = sqlite3.connect(nome_do_banco, check_same_thread=False)
        self.cursor = self.conexao.cursor()
        self.conexao.row_factory = sqlite3.Row # Transforma as linhas do banco em dicionários
        self.criar_tabela()

    def criar_tabela(self):
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS usuarios(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cpf VARCHAR(11) NOT NULL,
                nome VARCHAR(200) NOT NULL,
                sobrenome VARCHAR(200) NOT NULL,
                email VARCHAR(200) NOT NULL,
                senha VARCHAR(200) NOT NULL
            )
        """)
        self.conexao.commit()

    def inserir_usuario(self, cpf, nome, sobrenome, email, senha):

        self.cursor.execute("""

            INSERT INTO usuarios (cpf, nome, sobrenome, email, senha) 
            VALUES (?, ?, ?, ?, ?)
        """, (cpf, nome, sobrenome, email, senha))

        self.conexao.commit()

        id_gerado = self.cursor.lastrowid

        self.cursor.execute("SELECT * FROM usuarios WHERE id = ?", (id_gerado))

    def fechar(self):
        self.conexao.close()


def get_gerenciador():

    db = GerenciadorDeUsuarios()
    
    try:
        yield db

    finally:
        db.fechar()