import { useState } from "react";

export default function Login({ onLoginSuccess, onGoToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState("");

  async function handleLogin() {
    if (!email.trim()) {
      setFeedback("Informe seu email.");
      return;
    }

    if (!password.trim()) {
      setFeedback("Informe sua senha.");
      return;
    }

    try {
      const request = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await request.json();

      if (!request.ok) {
        setFeedback(data.message);
        return;
      }

      onLoginSuccess({ token: data.token, id: data.id });
    } catch (error) {
      setFeedback("Erro ao conectar com o servidor.");
    }
  }

  return (
    <div>
      <div className="container">
        <div className="card">
          <h2>Login</h2>
          <div className="id-section"></div>
          <div className="form-section">
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <br />
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
            />
            <br />
            <button className="btn btn-secondary" onClick={handleLogin}>
              Entrar
            </button>
            <p>
              Não tem conta?{" "}
              <button className="btn btn-secondary" onClick={onGoToRegister}>
                Criar conta
              </button>
            </p>
            <p>{feedback}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
