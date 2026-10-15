from dataclasses import dataclass
from time import time_ns
from uuid import uuid4

from fastapi import UploadFile

from .storage import Storage

TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024
TIPOS_PERMITIDOS = frozenset({"image/jpeg", "image/png", "image/webp"})
_EXTENSAO_POR_TIPO = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


class ErroValidacaoUpload(ValueError):
    def __init__(self, mensagem: str, status_code: int) -> None:
        super().__init__(mensagem)
        self.status_code = status_code


@dataclass(frozen=True, slots=True)
class EvidenciaSalva:
    nome: str
    caminho: str
    url: str
    tamanho: int
    tipo_mime: str


def _detectar_tipo_mime(conteudo: bytes) -> str | None:
    if conteudo.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if conteudo.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if len(conteudo) >= 12 and conteudo[:4] == b"RIFF" and conteudo[8:12] == b"WEBP":
        return "image/webp"
    return None


async def _ler_e_validar(arquivo: UploadFile) -> tuple[bytes, str]:
    if arquivo.content_type not in TIPOS_PERMITIDOS:
        raise ErroValidacaoUpload(
            "Formato inválido. Envie uma imagem JPEG, PNG ou WEBP.", 415
        )

    conteudo = await arquivo.read(TAMANHO_MAXIMO_BYTES + 1)
    if not conteudo:
        raise ErroValidacaoUpload("O arquivo enviado está vazio.", 400)
    if len(conteudo) > TAMANHO_MAXIMO_BYTES:
        raise ErroValidacaoUpload("A imagem deve ter no máximo 5 MB.", 413)

    tipo_detectado = _detectar_tipo_mime(conteudo)
    if tipo_detectado is None or tipo_detectado != arquivo.content_type:
        raise ErroValidacaoUpload(
            "O conteúdo do arquivo não corresponde a uma imagem JPEG, PNG ou WEBP válida.",
            415,
        )
    return conteudo, tipo_detectado


async def salvar_evidencia(
    storage: Storage,
    arquivo: UploadFile,
    empreendimento_id: int,
) -> EvidenciaSalva:
    conteudo, tipo_mime = await _ler_e_validar(arquivo)
    extensao = _EXTENSAO_POR_TIPO[tipo_mime]
    nome = f"{uuid4().hex}_{time_ns()}{extensao}"
    caminho = f"empreendimentos/{empreendimento_id}/evidencias/{nome}"
    armazenado = await storage.salvar(caminho, conteudo)
    return EvidenciaSalva(
        nome=nome,
        caminho=armazenado.caminho,
        url=armazenado.url,
        tamanho=len(conteudo),
        tipo_mime=tipo_mime,
    )
