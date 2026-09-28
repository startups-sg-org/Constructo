import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, useActionData, useLoaderData, useNavigation, useSubmit } from "react-router-dom";
import { createObraFormSchema, type CreateObraFormData, type StatusObra, type ContratoResponse } from "@constructo/shared";
import type { ObraActionData } from "../../../features/obras/obras.action";
import "./FormularioObra.css";

type FormularioObraProps = {
    onSucesso?: () => void;
};

const statusOptions: { value: StatusObra; label: string }[] = [
    { value: "PLANEJAMENTO", label: "Planejamento" },
    { value: "EM_ANDAMENTO", label: "Em andamento" },
    { value: "CONCLUIDA", label: "Concluída" },
];

export default function FormularioObra({ onSucesso }: FormularioObraProps) {
    const contratos = useLoaderData() as ContratoResponse[] | undefined;
    const actionData = useActionData<ObraActionData>();
    const navigation = useNavigation();
    const submit = useSubmit();

    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CreateObraFormData>({
        resolver: zodResolver(createObraFormSchema),
        defaultValues: {
            nome: "",
            descricao: "",
            endereco: "",
            latitude: "",
            longitude: "",
            status: "PLANEJAMENTO",
            dataInicio: "",
            dataFimPrevista: "",
            contratoId: "",
        },
    });

    const enviando =
        isSubmitting ||
        (navigation.state !== "idle" && navigation.formData != null);

    useEffect(() => {
        if (actionData?.campos) {
            for (const [campo, mensagem] of Object.entries(actionData.campos)) {
                setError(campo as keyof CreateObraFormData, {
                    type: "server",
                    message: String(mensagem),
                });
            }
        }
    }, [actionData, setError]);


    useEffect(() => {
        if (actionData?.sucesso) {
            reset();
            onSucesso?.();
        }
    }, [actionData, reset, onSucesso]);

    return (
        <div className="obra-form-wrapper card">
            <Form
                method="post"
                className="obra-form"
                noValidate
                aria-busy={enviando}
                onSubmit={handleSubmit((data) => {
                    const formulario = new FormData();
                    for (const [campo, valor] of Object.entries(data)) {
                        if (valor !== "") {
                            formulario.set(campo, String(valor));
                        }
                    }
                    submit(formulario, { method: "post" });
                })}
            >
                <div className="obra-form__secao">
                    <h3>Informações gerais</h3>

                    <div className="obra-form__grade">
                        <div className="campo">
                            <label htmlFor="nome">Nome da obra</label>
                            <input
                                id="nome"
                                type="text"
                                placeholder="Ex.: Edifício Central"
                                {...register("nome")}
                                disabled={enviando}
                                aria-invalid={Boolean(errors.nome)}
                                aria-describedby={errors.nome ? "nome-erro" : undefined}
                            />
                            {errors.nome && (
                                <span id="nome-erro" className="campo__erro" role="alert">
                                    {errors.nome.message}
                                </span>
                            )}
                        </div>

                        <div className="campo">
                            <label htmlFor="contratoId">Contrato vinculado</label>
                            <select
                                id="contratoId"
                                {...register("contratoId")}
                                disabled={enviando}
                                aria-invalid={Boolean(errors.contratoId)}
                                aria-describedby={errors.contratoId ? "contratoId-erro" : undefined}
                            >
                                <option value="">Selecione um contrato</option>
                                {contratos?.map((contrato) => (
                                    <option key={contrato.id} value={String(contrato.id)}>
                                        {contrato.numero} — {contrato.descricao}
                                    </option>
                                ))}
                            </select>
                            {errors.contratoId && (
                                <span id="contratoId-erro" className="campo__erro" role="alert">
                                    {errors.contratoId.message}
                                </span>
                            )}
                        </div>

                        <div className="campo obra-form__campo--largo">
                            <label htmlFor="descricao">Descrição</label>
                            <textarea
                                id="descricao"
                                placeholder="Detalhes sobre a obra (opcional)"
                                rows={3}
                                {...register("descricao")}
                                disabled={enviando}
                                aria-invalid={Boolean(errors.descricao)}
                                aria-describedby={errors.descricao ? "descricao-erro" : undefined}
                            />
                            {errors.descricao && (
                                <span id="descricao-erro" className="campo__erro" role="alert">
                                    {errors.descricao.message}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="obra-form__secao">
                    <h3>Localização</h3>

                    <div className="obra-form__grade">
                        <div className="campo obra-form__campo--largo">
                            <label htmlFor="endereco">Endereço</label>
                            <input
                                id="endereco"
                                type="text"
                                placeholder="Rua, número, bairro, cidade"
                                {...register("endereco")}
                                disabled={enviando}
                                aria-invalid={Boolean(errors.endereco)}
                                aria-describedby={errors.endereco ? "endereco-erro" : undefined}
                            />
                            {errors.endereco && (
                                <span id="endereco-erro" className="campo__erro" role="alert">
                                    {errors.endereco.message}
                                </span>
                            )}
                        </div>

                        <div className="campo">
                            <label htmlFor="latitude">Latitude</label>
                            <input
                                id="latitude"
                                type="number"
                                step="any"
                                placeholder="-90 a 90"
                                {...register("latitude")}
                                disabled={enviando}
                                aria-invalid={Boolean(errors.latitude)}
                                aria-describedby={errors.latitude ? "latitude-erro" : undefined}
                            />
                            {errors.latitude && (
                                <span id="latitude-erro" className="campo__erro" role="alert">
                                    {errors.latitude.message}
                                </span>
                            )}
                        </div>

                        <div className="campo">
                            <label htmlFor="longitude">Longitude</label>
                            <input
                                id="longitude"
                                type="number"
                                step="any"
                                placeholder="-180 a 180"
                                {...register("longitude")}
                                disabled={enviando}
                                aria-invalid={Boolean(errors.longitude)}
                                aria-describedby={errors.longitude ? "longitude-erro" : undefined}
                            />
                            {errors.longitude && (
                                <span id="longitude-erro" className="campo__erro" role="alert">
                                    {errors.longitude.message}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="obra-form__secao">
                    <h3>Status e cronograma</h3>

                    <div className="obra-form__grade">
                        <div className="campo">
                            <label htmlFor="status">Status</label>
                            <select
                                id="status"
                                {...register("status")}
                                disabled={enviando}
                            >
                                {statusOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="campo">
                            <label htmlFor="dataInicio">Data de início</label>
                            <input
                                id="dataInicio"
                                type="date"
                                {...register("dataInicio")}
                                disabled={enviando}
                                aria-invalid={Boolean(errors.dataInicio)}
                                aria-describedby={errors.dataInicio ? "dataInicio-erro" : undefined}
                            />
                            {errors.dataInicio && (
                                <span id="dataInicio-erro" className="campo__erro" role="alert">
                                    {errors.dataInicio.message}
                                </span>
                            )}
                        </div>

                        <div className="campo">
                            <label htmlFor="dataFimPrevista">Data de fim prevista</label>
                            <input
                                id="dataFimPrevista"
                                type="date"
                                {...register("dataFimPrevista")}
                                disabled={enviando}
                                aria-invalid={Boolean(errors.dataFimPrevista)}
                                aria-describedby={errors.dataFimPrevista ? "dataFimPrevista-erro" : undefined}
                            />
                            {errors.dataFimPrevista && (
                                <span id="dataFimPrevista-erro" className="campo__erro" role="alert">
                                    {errors.dataFimPrevista.message}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {actionData?.erro && (
                    <p className="mensagem-erro obra-form__erro" role="alert">
                        <span className="obra-form__erro-icone" aria-hidden="true">!</span>
                        <span>{actionData.erro}</span>
                    </p>
                )}

                <div className="obra-form__acoes">
                    <button
                        type="submit"
                        className="botao primario"
                        disabled={enviando}
                    >
                        {enviando ? "Cadastrando..." : "Cadastrar obra"}
                    </button>
                </div>
            </Form>
        </div>
    );
}
