import sqlite3

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
                email VARCHAR(200) NOT NULL,
                senha VARCHAR(200) NOT NULL,
                telefone VARCHAR(20) NOT NULL,
                canal_preferido VARCHAR(20) NOT NULL DEFAULT 'email',
                receber_atualizacoes BOOLEAN NOT NULL DEFAULT TRUE,
                empreendimento VARCHAR(200) NOT NULL,
                unidade VARCHAR(50) NOT NULL
            )
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
        unidade
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
                unidade
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            unidade
        ))

        self.conexao.commit()

        id_usuario = self.cursor.lastrowid

        self.cursor.execute("SELECT * FROM usuarios WHERE id = ?", (id_usuario, ))

        usuario = self.cursor.fetchone()

        return dict(usuario)

    def listar_usuarios(self):
        self.cursor.execute("SELECT * FROM usuarios ORDER BY id")
        usuarios = self.cursor.fetchall()

        return [dict(usuario) for usuario in usuarios]

    def buscar_usuario(self, id_usuario):
        self.cursor.execute(
            "SELECT * FROM usuarios WHERE id = ?",
            (id_usuario, )
        )
        usuario = self.cursor.fetchone()

        return dict(usuario) if usuario else None

    def atualizar_usuario(self, id_usuario, dados):
        campos_permitidos = {
            "cpf",
            "nome",
            "sobrenome",
            "email",
            "senha",
            "telefone",
            "canal_preferido",
            "receber_atualizacoes",
            "empreendimento",
            "unidade"
        }
        dados_validos = {
            campo: valor
            for campo, valor in dados.items()
            if campo in campos_permitidos
        }

        if not dados_validos:
            return self.buscar_usuario(id_usuario)

        campos_sql = ", ".join(f"{campo} = ?" for campo in dados_validos)
        valores = list(dados_validos.values())
        valores.append(id_usuario)

        self.cursor.execute(
            f"UPDATE usuarios SET {campos_sql} WHERE id = ?",
            valores
        )
        self.conexao.commit()

        return self.buscar_usuario(id_usuario)

    def excluir_usuario(self, id_usuario):
        self.cursor.execute(
            "DELETE FROM usuarios WHERE id = ?",
            (id_usuario, )
        )
        self.conexao.commit()

        return self.cursor.rowcount > 0

    def fechar(self):
        self.conexao.close()


def get_gerenciador():

    db = GerenciadorDeUsuarios()

    try:
        yield db

    finally:
        db.fechar()
