import asyncio
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol


@dataclass(frozen=True, slots=True)
class ArquivoArmazenado:
    """Resultado independente do provedor usado para armazenar um arquivo."""

    caminho: str
    url: str


class Storage(Protocol):
    """Contrato dos provedores de armazenamento de evidências."""

    async def salvar(self, caminho: str, conteudo: bytes) -> ArquivoArmazenado: ...

    async def remover(self, caminho: str) -> None: ...


class LocalStorage:
    """Storage local; pode ser substituído por S3/Blob sem alterar o serviço."""

    def __init__(self, diretorio_raiz: Path, prefixo_publico: str = "/uploads") -> None:
        self.diretorio_raiz = diretorio_raiz.resolve()
        self.prefixo_publico = "/" + prefixo_publico.strip("/")
        self.diretorio_raiz.mkdir(parents=True, exist_ok=True)

    def _resolver_destino(self, caminho: str) -> Path:
        destino = (self.diretorio_raiz / caminho).resolve()
        if not destino.is_relative_to(self.diretorio_raiz):
            raise ValueError("Caminho de armazenamento inválido")
        return destino

    async def salvar(self, caminho: str, conteudo: bytes) -> ArquivoArmazenado:
        destino = self._resolver_destino(caminho)

        def escrever() -> None:
            destino.parent.mkdir(parents=True, exist_ok=True)
            destino.write_bytes(conteudo)

        await asyncio.to_thread(escrever)
        caminho_normalizado = Path(caminho).as_posix()
        return ArquivoArmazenado(
            caminho=caminho_normalizado,
            url=f"{self.prefixo_publico}/{caminho_normalizado}",
        )

    async def remover(self, caminho: str) -> None:
        destino = self._resolver_destino(caminho)
        await asyncio.to_thread(destino.unlink, missing_ok=True)


_RAIZ_PROJETO = Path(__file__).resolve().parents[4]
DIRETORIO_UPLOADS = Path(
    os.getenv("EVIDENCE_STORAGE_PATH", str(_RAIZ_PROJETO / "uploads"))
).resolve()

_storage: Storage = LocalStorage(DIRETORIO_UPLOADS)


def obter_storage() -> Storage:
    return _storage
