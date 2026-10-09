def quantidade_minima_atendida(evidencias_registradas: int, quantidade_minima: int) -> bool:
    """Indica se os registros disponíveis atendem ao mínimo do protocolo."""
    return evidencias_registradas >= quantidade_minima
