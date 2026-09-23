from pydantic import BaseModel, EmailStr

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


class UpdateUser(BaseModel):
    cpf: str | None = None
    nome: str | None = None
    sobrenome: str | None = None
    email: EmailStr | None = None
    senha: str | None = None
    telefone: str | None = None
    canal_preferido: str | None = None
    receber_atualizacoes: bool | None = None
    empreendimento: str | None = None
    unidade: str | None = None
    ativo: bool | None = None


class LoginUser(BaseModel):
    email: EmailStr
    senha: str


class UserReturn(BaseModel):
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


class LoginReturn(BaseModel):
    mensagem: str
    usuario: UserReturn
