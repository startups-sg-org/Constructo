def quantidade_minima_atendida(evidencias_registradas: int, quantidade_minima: int) -> bool:
    """Indica se os registros disponíveis atendem ao mínimo do protocolo."""
    return evidencias_registradas >= quantidade_minima


def itens_obrigatorios_atendidos(itens_pendentes: int) -> bool:
    """Indica se todos os itens obrigatórios receberam evidência."""
    return itens_pendentes == 0
