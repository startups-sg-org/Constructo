import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.banco_de_dados.connections.database_postgres import get_db

from .services import EmpresaService, ContratoService, ItemContratualService

from .schema.empresas_schema import (
    TipoEmpresaEnum,
    Empresa_FromRequest_Schema,
    Empresa_UpdateRequest_Schema,
    Empresa_StatusRequest_Schema,
    Empresa_FromDB_Schema,
    EmpresaResumo_FromDB_Schema,
)

from .schema.contratos_schema import (
    Contrato_FromRequest_Schema,
    Contrato_UpdateRequest_Schema,
    Contrato_StatusRequest_Schema,
    Contrato_FromDB_Schema,
)

from .schema.itensContratuais_schemas import (
    ItemContratual_FromRequest_Schema,
    ItemContratual_UpdateRequest_Schema,
    ItemContratual_FromDB_Schema,
)

#endpoints:
#--------Itens contratuais ------------
# POST /contratos{contrato_id}/itens
# PUT /contratos{contrato_id}/itens/{id}
# PATCH /contratos{contrato_id}/itens/{id}/status
# GET /contratos/{contrato_id}/itens/{id}

#--------Contratos ------------
# POST /contratos
# PUT /contratos/{id}
# PATCH /contratos/{id}/status
# GET /contratos/{id}

#-------Empresa (contratante ou contratado) ----------
# POST /contratantes
# POST /contratadas
# PUT /contratantes/{id}
# PUT /contratadas/{id}
# PATCH /contratantes/{id}/status
# PATCH /contratadas/{id}/status
# GET /contratantes/{id}
# GET /contratadas/{id}



# Instanciando OBJETO de serviços
empresa_service = EmpresaService()
contrato_service = ContratoService()
item_contratual_service = ItemContratualService()

# -----------------------------------------------------------------------------
# Empresas
# -----------------------------------------------------------------------------
empresas_router = APIRouter(prefix="/empresas", tags=["Empresas"])

@empresas_router.post("/", response_model=Empresa_FromDB_Schema, status_code=status.HTTP_201_CREATED)
async def create_empresa(
    tipo: TipoEmpresaEnum, 
    payload: Empresa_FromRequest_Schema, 
    db: Annotated[AsyncSession, Depends(get_db)]
):
    return await empresa_service.create_empresa(db, payload, tipo)

@empresas_router.get("/{id}", response_model=Empresa_FromDB_Schema)
async def get_empresa(id: uuid.UUID, db: Annotated[AsyncSession, Depends(get_db)]):
    return await empresa_service.get_empresa_by_id(db, id)

@empresas_router.get("/", response_model=list[EmpresaResumo_FromDB_Schema])
async def list_empresas(db: Annotated[AsyncSession, Depends(get_db)]):
    return await empresa_service.get_all_empresas(db)

@empresas_router.put("/{id}", response_model=Empresa_FromDB_Schema)
async def update_empresa(id: uuid.UUID, payload: Empresa_UpdateRequest_Schema, db: Annotated[AsyncSession, Depends(get_db)]):
    return await empresa_service.update_empresa(db, id, payload)

@empresas_router.patch("/{id}/status", response_model=Empresa_FromDB_Schema)
async def desativar_empresa(id: uuid.UUID, payload: Empresa_StatusRequest_Schema, db: Annotated[AsyncSession, Depends(get_db)]):
    return await empresa_service.desativar_empresa(db, id, payload)



# -----------------------------------------------------------------------------
# Contratos
# -----------------------------------------------------------------------------
contratos_router = APIRouter(prefix="/contratos", tags=["Contratos"])

@contratos_router.post("/", response_model=Contrato_FromDB_Schema, status_code=status.HTTP_201_CREATED)
async def create_contrato(payload: Contrato_FromRequest_Schema, db: Annotated[AsyncSession, Depends(get_db)]):
    return await contrato_service.create_contrato(db, payload)

@contratos_router.get("/{id}", response_model=Contrato_FromDB_Schema)
async def get_contrato(id: uuid.UUID, db: Annotated[AsyncSession, Depends(get_db)]):
    return await contrato_service.get_contrato(db, id)

@contratos_router.patch("/{id}/status", response_model=Contrato_FromDB_Schema)
async def atualizar_status_contrato(id: uuid.UUID, payload: Contrato_StatusRequest_Schema, db: Annotated[AsyncSession, Depends(get_db)]):
    return await contrato_service.atualizar_status_contrato(db, id, payload)

@contratos_router.put("/{id}", response_model=Contrato_FromDB_Schema)
async def update_contrato(id: uuid.UUID, payload: Contrato_UpdateRequest_Schema, db: Annotated[AsyncSession, Depends(get_db)]):
    return await contrato_service.update_contrato(db, id, payload)




# -----------------------------------------------------------------------------
# Itens Contratuais
# -----------------------------------------------------------------------------
# Agrupado hierarquicamente abaixo do contrato
itens_contratuais_router = APIRouter(prefix="/contratos/{contrato_id}/itens", tags=["Itens Contratuais"])

@itens_contratuais_router.post("/", response_model=ItemContratual_FromDB_Schema, status_code=status.HTTP_201_CREATED)
async def create_item_contratual(contrato_id: uuid.UUID, payload: ItemContratual_FromRequest_Schema, db: Annotated[AsyncSession, Depends(get_db)]):
    return await item_contratual_service.create_item_contratual(db, contrato_id, payload)

@itens_contratuais_router.get("/{item_id}", response_model=ItemContratual_FromDB_Schema)
async def get_item_contratual(contrato_id: uuid.UUID, item_id: uuid.UUID, db: Annotated[AsyncSession, Depends(get_db)]):
    return await item_contratual_service.get_item_contratual(db, contrato_id, item_id)

@itens_contratuais_router.put("/{item_id}", response_model=ItemContratual_FromDB_Schema)
async def update_item_contratual(contrato_id: uuid.UUID, item_id: uuid.UUID, payload: ItemContratual_UpdateRequest_Schema, db: Annotated[AsyncSession, Depends(get_db)]):
    return await item_contratual_service.update_item_contratual(db, contrato_id, item_id, payload)

