export type PapelUsuario = 'ADMIN' | 'GESTOR' | 'COMPRADOR';

export interface UsuarioSessao {
  id: number;
  cpf: string;
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  canal_preferido: string;
  receber_atualizacoes: boolean;
  empreendimento: string;
  unidade: string;
  ativo: boolean;
  papel: PapelUsuario;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  mensagem: string;
  usuario: UsuarioSessao;
}

export interface CadastroUsuarioRequest {
  cpf: string;
  nome: string;
  sobrenome: string;
  email: string;
  senha: string;
  telefone: string;
  canal_preferido?: 'email' | 'whatsapp' | 'sms';
  receber_atualizacoes?: boolean;
  empreendimento?: string;
  unidade?: string;
  papel?: PapelUsuario;
}

export interface SessaoEstado {
  autenticado: boolean;
  usuario: UsuarioSessao | null;
  carregando: boolean;
  token: string | null;
}
