import React, { createContext, useContext, useEffect, useState } from 'react';
import { CadastroUsuarioRequest, UsuarioSessao } from '../types/auth';
import { authService } from '../services/auth.service';
import { obterTokenSessao } from '../services/api';

export interface AuthContextData {
  usuario: UsuarioSessao | null;
  autenticado: boolean;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<UsuarioSessao>;
  cadastrar: (dados: CadastroUsuarioRequest) => Promise<UsuarioSessao>;
  logout: () => Promise<void>;
  recarregarSessao: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSessao | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);

  const carregarSessao = async () => {
    try {
      setCarregando(true);
      const token = await obterTokenSessao();
      if (!token) {
        setUsuario(null);
        return;
      }

      const dadosUsuario = await authService.obterSessao();
      setUsuario(dadosUsuario);
    } catch {
      setUsuario(null);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarSessao();
  }, []);

  const login = async (email: string, senha: string): Promise<UsuarioSessao> => {
    setCarregando(true);
    try {
      const resposta = await authService.login({ email, senha });
      setUsuario(resposta.usuario);
      return resposta.usuario;
    } finally {
      setCarregando(false);
    }
  };

  const cadastrar = async (dados: CadastroUsuarioRequest): Promise<UsuarioSessao> => {
    setCarregando(true);
    try {
      const criado = await authService.cadastrar(dados);
      try {
        const logado = await authService.login({ email: dados.email, senha: dados.senha });
        setUsuario(logado.usuario);
        return logado.usuario;
      } catch {
        setUsuario(criado);
        return criado;
      }
    } finally {
      setCarregando(false);
    }
  };

  const logout = async () => {
    setCarregando(true);
    try {
      await authService.logout();
      setUsuario(null);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        autenticado: Boolean(usuario),
        carregando,
        login,
        cadastrar,
        logout,
        recarregarSessao: carregarSessao,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
