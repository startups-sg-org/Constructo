from pydantic import BaseModel, EmailStr

class CreateUser(BaseModel):
    cpf: str 
    nome: str  
    sobrenome: str
    email: EmailStr
    senha: str

class UserReturn(BaseModel):
    id: int
    cpf: str 
    nome: str  
    sobrenome: str
    email: str
