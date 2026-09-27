import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ContratoResponse } from "@constructo/shared";

import FormularioObra from "./FormularioObra";

const contratosMock: ContratoResponse[] = [
  { id: 1, numero: "CTR-001", descricao: "Contrato Alpha", obraVinculadaId: null },
  { id: 2, numero: "CTR-002", descricao: "Contrato Beta", obraVinculadaId: null },
];

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useLoaderData: () => contratosMock,
  };
});

import { createMemoryRouter, RouterProvider } from "react-router-dom";

function montarFormulario(
    onAction?: (formData: FormData) => Promise<{ erro?: string; campos?: Record<string, string> } | { sucesso?: boolean }>,
) {
  const router = createMemoryRouter(
      [
          {
              path: "/",
              // @ts-expect-error React Router mock data
              loaderData: contratosMock,
              action: onAction


                  ? async ({ request }: { request: Request }) => {
                      const formData = await request.formData();
                      return onAction(formData);
                  }
                  : undefined,
              element: <FormularioObra />,
          },
      ],
      { initialEntries: ["/"] },
  );

  render(<RouterProvider router={router} />);
  return router;
}

describe("FormularioObra", () => {
  const user = userEvent.setup();

  beforeEach(() => vi.clearAllMocks());

  it("renderiza todos os campos do formulário", () => {
    montarFormulario();

    expect(screen.getByLabelText("Nome da obra")).toBeInTheDocument();
    expect(screen.getByLabelText("Contrato vinculado")).toBeInTheDocument();
    expect(screen.getByLabelText("Descrição")).toBeInTheDocument();
    expect(screen.getByLabelText("Endereço")).toBeInTheDocument();
    expect(screen.getByLabelText("Latitude")).toBeInTheDocument();
    expect(screen.getByLabelText("Longitude")).toBeInTheDocument();
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
    expect(screen.getByLabelText("Data de início")).toBeInTheDocument();
    expect(screen.getByLabelText("Data de fim prevista")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cadastrar/i })).toBeInTheDocument();
  });

  it("exibe os contratos disponíveis no seletor", () => {
    montarFormulario();

    const select = screen.getByLabelText("Contrato vinculado");
    expect(select).toHaveValue("");

    expect(screen.getByText("CTR-001 — Contrato Alpha")).toBeInTheDocument();
    expect(screen.getByText("CTR-002 — Contrato Beta")).toBeInTheDocument();
  });

  it("exibe erros de validação ao submeter dados inválidos", async () => {
    montarFormulario();

    await user.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/pelo menos 3 caracteres/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("Endereço obrigatório")).toBeInTheDocument();
    });
  });

  it("exibe erro quando a data de fim é anterior à data de início", async () => {
    montarFormulario();

    await user.type(screen.getByLabelText("Nome da obra"), "Edifício Central");
    await user.type(screen.getByLabelText("Endereço"), "Rua das Flores, 123");

    const latInput = screen.getByLabelText("Latitude");
    await user.type(latInput, "-15.79");

    const lonInput = screen.getByLabelText("Longitude");
    await user.type(lonInput, "-47.88");

    await user.type(screen.getByLabelText("Data de início"), "2026-12-01");
    await user.type(screen.getByLabelText("Data de fim prevista"), "2026-06-01");

    const select = screen.getByLabelText("Contrato vinculado");
    await user.selectOptions(select, select.querySelector("option[value='1']") as HTMLOptionElement);

    await user.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/maior ou igual/i)).toBeInTheDocument();
    });
  });

  it("exibe erro de latitude inválida", async () => {
    montarFormulario();

    await user.type(screen.getByLabelText("Nome da obra"), "Edifício Central");
    await user.type(screen.getByLabelText("Endereço"), "Rua das Flores, 123");

    const latInput = screen.getByLabelText("Latitude");
    await user.clear(latInput);
    await user.type(latInput, "999");

    const lonInput = screen.getByLabelText("Longitude");
    await user.clear(lonInput);
    await user.type(lonInput, "-47.88");

    await user.type(screen.getByLabelText("Data de início"), "2026-01-15");
    await user.type(screen.getByLabelText("Data de fim prevista"), "2027-06-30");

    const select = screen.getByLabelText("Contrato vinculado");
    await user.selectOptions(select, select.querySelector("option[value='1']") as HTMLOptionElement);

    await user.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/entre -90 e 90/i)).toBeInTheDocument();
    });
  });

  it("exibe mensagem de erro de contrato duplicado", async () => {
    montarFormulario(
      async () => ({ erro: "Este contrato já possui uma obra cadastrada." }),
    );

    await user.type(screen.getByLabelText("Nome da obra"), "Edifício Central");
    await user.type(screen.getByLabelText("Endereço"), "Rua das Flores, 123");

    const latInput = screen.getByLabelText("Latitude");
    await user.type(latInput, "-15.79");

    const lonInput = screen.getByLabelText("Longitude");
    await user.type(lonInput, "-47.88");

    await user.type(screen.getByLabelText("Data de início"), "2026-01-15");
    await user.type(screen.getByLabelText("Data de fim prevista"), "2027-06-30");

    const select = screen.getByLabelText("Contrato vinculado");
    await user.selectOptions(select, select.querySelector("option[value='1']") as HTMLOptionElement);

    await user.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/já possui uma obra/i)).toBeInTheDocument();
    });
  });

  it("exibe texto de carregamento durante submissão", async () => {
    let resolvePromise: (value: { erro?: string }) => void;
    const delayPromise = new Promise<{ erro?: string }>((resolve) => { resolvePromise = resolve; });

    montarFormulario(
      async () => {
        await delayPromise;
        return {};
      },
    );

    await user.type(screen.getByLabelText("Nome da obra"), "Edifício Central");
    await user.type(screen.getByLabelText("Endereço"), "Rua das Flores, 123");

    const latInput = screen.getByLabelText("Latitude");
    await user.type(latInput, "-15.79");

    const lonInput = screen.getByLabelText("Longitude");
    await user.type(lonInput, "-47.88");

    await user.type(screen.getByLabelText("Data de início"), "2026-01-15");
    await user.type(screen.getByLabelText("Data de fim prevista"), "2027-06-30");

    const select = screen.getByLabelText("Contrato vinculado");
    await user.selectOptions(select, select.querySelector("option[value='1']") as HTMLOptionElement);

    void user.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/cadastrando/i)).toBeInTheDocument();
    });

    resolvePromise!({});
  });

  it("limpa o formulário após sucesso", async () => {
    montarFormulario(
      async () => ({ sucesso: true }),
    );

    await user.type(screen.getByLabelText("Nome da obra"), "Edifício Central");
    await user.type(screen.getByLabelText("Endereço"), "Rua das Flores, 123");

    const latInput = screen.getByLabelText("Latitude");
    await user.type(latInput, "-15.79");

    const lonInput = screen.getByLabelText("Longitude");
    await user.type(lonInput, "-47.88");

    await user.type(screen.getByLabelText("Data de início"), "2026-01-15");
    await user.type(screen.getByLabelText("Data de fim prevista"), "2027-06-30");

    const select = screen.getByLabelText("Contrato vinculado");
    await user.selectOptions(select, select.querySelector("option[value='1']") as HTMLOptionElement);

    await user.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByLabelText("Nome da obra")).toHaveValue("");
    });
  });
});
