import { beforeEach, describe, expect, it, vi } from "vitest";

import { loaderArgs } from "../../test/testUtils";
import { carregarResumoPainel } from "./resumoPainel.loader";
import { carregarUsuarios } from "./usuarios.loader";
import { getUsers, getUsersCount } from "./usuarios.service";

vi.mock("./usuarios.service", () => ({
  getUsers: vi.fn(),
  getUsersCount: vi.fn(),
}));

const getUsersMock = vi.mocked(getUsers);
const getUsersCountMock = vi.mocked(getUsersCount);

describe("loaders de usuários", () => {
  beforeEach(() => vi.clearAllMocks());

  it("carrega a lista de usuários isoladamente", async () => {
    const usuarios = [{ id: 1, nome: "Maria" }];
    getUsersMock.mockResolvedValue(usuarios as never);
    const args = loaderArgs("http://localhost/admin/usuarios");

    await expect(carregarUsuarios(args)).resolves.toEqual(usuarios);
    expect(getUsersMock).toHaveBeenCalledWith({ signal: args.request.signal });
  });

  it("propaga erros da listagem para o errorElement da rota", async () => {
    const erro = new Error("API indisponível");
    getUsersMock.mockRejectedValue(erro);

    await expect(
      carregarUsuarios(loaderArgs("http://localhost/admin/usuarios")),
    ).rejects.toBe(erro);
  });

  it("adapta a contagem para os dados do resumo", async () => {
    getUsersCountMock.mockResolvedValue(12);
    const args = loaderArgs("http://localhost/admin");

    await expect(carregarResumoPainel(args)).resolves.toEqual({
      usuariosCadastrados: 12,
    });
    expect(getUsersCountMock).toHaveBeenCalledWith({
      signal: args.request.signal,
    });
  });
});
