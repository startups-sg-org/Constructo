import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="home">
      <span className="subtitulo">Constructo</span>
      <h1>Gerenciamento de usuários</h1>
      <p>Cadastre, consulte, edite e exclua usuários em um só lugar.</p>
      <Link className="botao primario" to="/login">
        Entrar
      </Link>
    </main>
  );
}
