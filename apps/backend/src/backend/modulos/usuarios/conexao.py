import sqlite3
import secrets

class GerenciadorDeUsuarios:
    def __init__(self, nome_do_banco="constructo.db"):
        self.conexao = sqlite3.connect(nome_do_banco, check_same_thread=False)
        self.conexao.row_factory = sqlite3.Row
        self.cursor = self.conexao.cursor()
        self.criar_tabela()

    def criar_tabela(self):
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS usuarios(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cpf VARCHAR(11) NOT NULL,
                nome VARCHAR(200) NOT NULL,
                sobrenome VARCHAR(200) NOT NULL,
                email VARCHAR(200) NOT NULL UNIQUE,
                senha VARCHAR(200) NOT NULL,
                telefone VARCHAR(20) NOT NULL,
                canal_preferido VARCHAR(20) NOT NULL DEFAULT 'email',
                receber_atualizacoes BOOLEAN NOT NULL DEFAULT TRUE,
                empreendimento VARCHAR(200) NOT NULL,
                unidade VARCHAR(50) NOT NULL,
                ativo BOOLEAN NOT NULL DEFAULT TRUE
            )
        """)

        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS sessoes(
                token TEXT PRIMARY KEY,
                usuario_id INTEGER NOT NULL,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
            )
        """)

        self.cursor.execute("""
            DELETE FROM sessoes
            WHERE usuario_id NOT IN (SELECT id FROM usuarios)
        """)
        self.conexao.commit()

    def inserir_usuario(
        self,
        cpf,
        nome,
        sobrenome,
        email,
        senha,
        telefone,
        canal_preferido,
        receber_atualizacoes,
        empreendimento,
        unidade,
        ativo
    ):

        self.cursor.execute("""
            INSERT INTO usuarios (
                cpf,
                nome,
                sobrenome,
                email,
                senha,
                telefone,
                canal_preferido,
                receber_atualizacoes,
                empreendimento,
                unidade,
                ativo
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            cpf,
            nome,
            sobrenome,
            email,
            senha,
            telefone,
            canal_preferido,
            receber_atualizacoes,
            empreendimento,
            unidade,
            ativo
        ))

        self.conexao.commit()

        id_usuario = self.cursor.lastrowid

        self.cursor.execute("SELECT * FROM usuarios WHERE id = ?", (id_usuario, ))

        usuario = self.cursor.fetchone()

        return dict(usuario)

    def buscar_usuario_por_email(self, email):
        self.cursor.execute(
            "SELECT * FROM usuarios WHERE LOWER(email) = LOWER(?)",
            (email, )
        )
        usuario = self.cursor.fetchone()

        return dict(usuario) if usuario else None

    def criar_sessao(self, id_usuario):
        token = secrets.token_urlsafe(32)

        self.cursor.execute(
            "INSERT INTO sessoes (token, usuario_id) VALUES (?, ?)",
            (token, id_usuario)
        )
        self.conexao.commit()

        return token

    def buscar_usuario_por_sessao(self, token):
        self.cursor.execute("""
            SELECT usuarios.*
            FROM usuarios
            INNER JOIN sessoes ON sessoes.usuario_id = usuarios.id
            WHERE sessoes.token = ?
        """, (token, ))
        usuario = self.cursor.fetchone()

        return dict(usuario) if usuario else None

    def excluir_sessao(self, token):
        self.cursor.execute(
            "DELETE FROM sessoes WHERE token = ?",
            (token, )
        )
        self.conexao.commit()

    def fechar(self):
        self.conexao.close()


def get_gerenciador():

    db = GerenciadorDeUsuarios()

    try:
        yield db

    finally:
        db.fechar()
