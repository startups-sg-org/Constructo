import { extrairSessionTokenDeHeaders, getApiBaseUrl } from '../api';

describe('api.ts - Interceptor e Cookie de Sessão', () => {
  test('deve extrair session_token do header Set-Cookie com sucesso', () => {
    const headers = new Headers();
    headers.set(
      'set-cookie',
      'session_token=8f9b2a1e0c4d7f5e3b6a9c1d4e7f0a2b5c8d1e4f7a0b3c6d9e2f5a8b1c4d7e0; Path=/; HttpOnly; SameSite=lax; Max-Age=604800'
    );

    const token = extrairSessionTokenDeHeaders(headers);
    expect(token).toBe('8f9b2a1e0c4d7f5e3b6a9c1d4e7f0a2b5c8d1e4f7a0b3c6d9e2f5a8b1c4d7e0');
  });

  test('deve retornar null caso Set-Cookie não esteja presente', () => {
    const headers = new Headers();
    const token = extrairSessionTokenDeHeaders(headers);
    expect(token).toBeNull();
  });

  test('deve retornar URL base apropriada', () => {
    const url = getApiBaseUrl();
    expect(url).toMatch(/^https?:\/\//);
  });
});
