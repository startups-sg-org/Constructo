from pydantic import BaseModel, ConfigDict, EmailStr


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
