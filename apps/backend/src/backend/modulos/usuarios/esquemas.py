from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CreateUser(BaseModel):
    cpf: str
    nome: str
    sobrenome: str
    email: EmailStr
    senha: str
    telefone: str
    canal_preferido: str = "email"
    receber_atualizacoes: bool = True
    empreendimento: str
    unidade: str
    ativo: bool = True


class LoginUser(BaseModel):
    email: EmailStr
    senha: str


class UpdateUser(BaseModel):
    cpf: str = Field(pattern=r"^(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11})$")
    nome: str = Field(min_length=3, max_length=200)
    sobrenome: str = Field(min_length=3, max_length=200)
    email: EmailStr
    telefone: str = Field(min_length=10, max_length=20)
    canal_preferido: Literal["email", "whatsapp"]
    receber_atualizacoes: bool
    empreendimento: str = Field(min_length=1, max_length=200)
    unidade: str = Field(min_length=1, max_length=50)
    ativo: bool


class UserReturn(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    cpf: str
    nome: str
    sobrenome: str
    email: EmailStr
    telefone: str
    canal_preferido: str
    receber_atualizacoes: bool
    empreendimento: str
    unidade: str
    ativo: bool


class UserCount(BaseModel):
    total: int


class LoginReturn(BaseModel):
    mensagem: str
    usuario: UserReturn
