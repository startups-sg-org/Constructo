import ProtocolEditor from "./ProtocolEditor";

/** A rota de listagem usa o mesmo workspace das rotas de criação e edição. */
export default function ProtocolList() {
    return <ProtocolEditor />;
}
