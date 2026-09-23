import bcrypt

def gerar_senha_hash(senha_texto_puro: str) -> str:

    senha_bytes = senha_texto_puro.encode("UTF-8")

    salt = bcrypt.gensalt()

    hash_senha = bcrypt.hashpw(senha_bytes, salt)

    return hash_senha.decode("UTF-8")

def verificar_senha(senha_texto_puro: str, senha_hash_do_banco: str) -> bool:

    senha_bytes = senha_texto_puro.encode("UTF-8")

    hash_bytes = senha_hash_do_banco.encode("UTF-8")

    return bcrypt.checkpw(senha_bytes, hash_bytes)