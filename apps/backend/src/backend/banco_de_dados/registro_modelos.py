from importlib import import_module


_MODULOS_COM_MODELOS = (
    "backend.modulos.dominio.modelos",
    "backend.modulos.evidencias.modulos",
    "backend.modulos.usuarios.modelos",
)


def registrar_modelos() -> None:
    """Importa todos os modelos que compartilham o registry do SQLAlchemy.

    Relacionamentos declarados por nome só podem ser resolvidos depois que a
    classe de destino foi importada. Scripts e migrations devem chamar esta
    função antes de configurar mappers ou instanciar entidades.
    """

    for nome_modulo in _MODULOS_COM_MODELOS:
        import_module(nome_modulo)
