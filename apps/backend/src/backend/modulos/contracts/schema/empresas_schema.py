import uuid
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, field_validator, EmailStr
import re



class TipoEmpresaEnum(str, Enum):
    CONTRATANTE = "contratante"
    CONTRATADA  = "contratada"


class Empresa_FromRequest_Schema(BaseModel):
    # ─── CRIAÇÃO — admin cadastra contratante ou contratada
    # type NÃO vem no payload — definido pela rota (/contratantes ou
    # /contratadas), nunca pelo usuário
    # valida e limpa CNPJ na entrada ────────────────────────────────
    # Usado em: POST /contratantes e POST /contratadas
    # Quem usa: admin do sistema
 
    nome_fantasia: str = Field(min_length=2, max_length=200)
    razao_social: str = Field(min_length=2, max_length=200)
    cnpj: str = Field(min_length=14, max_length=20)
    email: EmailStr
    telefone: str = Field(min_length=8, max_length=20)
 
    @field_validator("cnpj")
    @classmethod
    def validar_cnpj(cls, v: str) -> str:
        # remove pontuação — aceita "12.345.678/0001-99" ou "12345678000199"
        limpo = re.sub(r"\D", "", v)
        if len(limpo) != 14:
            raise ValueError("CNPJ deve ter 14 dígitos")
        return limpo  # salva sempre sem pontuação
 
 
class Empresa_UpdateRequest_Schema(BaseModel):
    # ─── ATUALIZAÇÃO — edição parcial
    # cnpj de fora — identificador de negócio, não muda depois de criado
    # ────────────────────────────────
    # Usado em: PUT /contratantes/{id} e PUT /contratadas/{id}
    # Todos os campos opcionais — atualiza só o que mandar
 
    nome_fantasia: str | None = Field(default=None, min_length=2, max_length=200)
    razao_social: str | None = Field(default=None, min_length=2, max_length=200)
    email: EmailStr | None = None
    telefone: str | None = Field(default=None, min_length=8, max_length=20)
 
 
class Empresa_StatusRequest_Schema(BaseModel):
    # ─── TOGGLE — ativa ou desativa (soft delete) ────────────────────────────
    # Usado em: PATCH /contratantes/{id}/status e PATCH /contratadas/{id}/status
    # Responsabilidade única — só muda o ativo. Substitui exclusão física:
    # o registro continua existindo pra não quebrar contratos antigos que
    # já o referenciam
 
    ativo: bool
 
 
class Empresa_FromDB_Schema(BaseModel):
    # ─── SAÍDA COMPLETA — resposta detalhada ─────────────────────────────────
    # Usado em: GET /contratantes/{id} e GET /contratadas/{id}
    # Quem usa: admin do sistema (e o frontend de edição, que carrega o form)
    # Não filtra por ativo — retorna mesmo se inativo, com o campo ativo
    # visível, pra telas de histórico de contrato ainda conseguirem exibir
 
    id: uuid.UUID
    type: TipoEmpresaEnum          
    razao_social: str
    nome_fantasia: str
    cnpj: str
    email: str
    telefone: str
    ativo: bool
    criado_em: datetime
    atualizado_em: datetime
 
    class Config:
        from_attributes = True
 
 
class EmpresaResumo_FromDB_Schema(BaseModel):
    # ─── SAÍDA RESUMIDA — listagem no painel ─────────────────────────────────
    # Usado em: GET /contratantes e GET /contratadas
 
    id: uuid.UUID
    nome_fantasia: str
    razao_social: str
    cnpj: str
    ativo: bool
 
    class Config:
        from_attributes = True
 
 
class EmpresaLite_FromDB_Schema(BaseModel):
    # ─── SAÍDA MÍNIMA — para seleção em outro formulário ─────────────────────
    # Usado em: GET /contratantes/lite e GET /contratadas/lite
    # Consumido pelo combobox do formulário de Contrato 
 
    id: uuid.UUID
    nome_fantasia: str
 
    class Config:
        from_attributes = True
