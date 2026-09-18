import { useState } from "react";

export default function Register({ onRegisterSucess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState("");

  async function handleRegister() {
    if (!email.trim()) {
      setFeedback("Informe seu email.");
      return;
    }

    if (!password.trim()) {
      setFeedback("Informe sua senha.");
      return;
    }

    try {
      const request = await fetch("http://localhost:3000/register", {
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

      const loginRequest = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const loginData = await loginRequest.json();

      if (!loginRequest.ok) {
        setFeedback(
          "Cadastro realizado, mas não foi possível fazer login automático.",
        );
        return;
      }

      onRegisterSucess({ token: loginData.token, id: loginData.id });
    } catch (error) {
      setFeedback("Erro ao conectar com o servidor.");
    }
  }

  return (
    <div>
      <h2>Register</h2>
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
      <button onClick={handleRegister}>Registrar</button>
      <p>{feedback}</p>
    </div>
  );
}
