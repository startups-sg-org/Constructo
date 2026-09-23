from pydantic import BaseModel, EmailStr

class CreateUser(BaseModel):
    cpf: str 
    nome: str  
    sobrenome: str
    email: EmailStr
    senha: str


class UpdateUser(BaseModel):
    cpf: str | None = None
    nome: str | None = None
    sobrenome: str | None = None
    email: EmailStr | None = None
    senha: str | None = None


class UserReturn(BaseModel):
    id: int
    cpf: str 
    nome: str  
    sobrenome: str
    email: EmailStr
