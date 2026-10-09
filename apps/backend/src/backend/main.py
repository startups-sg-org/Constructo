from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.modulos.contracts.routes import (
    contratos_router,
    empresas_router,
    itens_contratuais_router,
)
from backend.modulos.dominio.rotas import router as dominio_router
from backend.modulos.evidencias.routes import router as evidencias_router
from backend.modulos.usuarios.rotas import router as usuarios_router

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",

]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(usuarios_router)
app.include_router(dominio_router)
app.include_router(evidencias_router)

#--------------------------------------
# Rotas do módulo contracts
#--------------------------------------
app.include_router(empresas_router)
app.include_router(contratos_router)
app.include_router(itens_contratuais_router)


@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
