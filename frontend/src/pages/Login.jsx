import { useState } from "react";

export default function Login({ onLoginSuccess }) {
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

      onLoginSuccess(data.token);
    } catch (error) {
      setFeedback("Erro ao conectar com o servidor.");
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <br />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
      />
      <br />
      <button onClick={handleLogin}>Entrar</button>
      <p>{feedback}</p>
    </div>
  );
}
