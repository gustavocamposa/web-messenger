import { useState } from "react";
import { getUserId } from "../utils/userId";

export default function PaginaPrincipal() {
  const [text, setText] = useState("");
  const [send, setSend] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [feedback, setFeedback] = useState("");
  const userId = getUserId();

  async function sendMessage() {
    if (!send.trim()) {
      setFeedback("Informe para quem deseja enviar a mensagem.");
      return;
    }

    if (!message.trim()) {
      setFeedback("Digite uma mensagem.");
      return;
    }

    try {
      const request = await fetch("http://localhost:3000/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: userId,
          to: send,
          text: message,
        }),
      });

      if (!request.ok) {
        setFeedback("Não foi possível enviar a mensagem.");
        return;
      }

      setMessage("");
      setFeedback("Mensagem enviada com sucesso!");
    } catch (error) {
      setFeedback("Erro ao conectar com o servidor.");
    }
  }

  async function getMessages() {
    const response = await fetch(`http://localhost:3000/messages/${userId}`);

    const data = await response.json();

    setMessages(data);
  }

  async function copyUserId() {
    await navigator.clipboard.writeText(userId);
  }
  return (
    <>
      <div>
        <button onClick={copyUserId}>Copy ID</button>
        <p>Your ID: {userId}</p>
        <label>
          <input
            type="text"
            value={send}
            onChange={(e) => setSend(e.target.value)}
            placeholder="Send To."
          />
          <br />
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message."
          />
          <br />

          <button onClick={sendMessage}>Send</button>
          <p>{feedback}</p>

          <div className="messages">
            Messages
            <button onClick={getMessages}>Check Messages</button>
            {messages.map((message, index) => (
              <p key={index}>
                {message.from}: {message.text}
              </p>
            ))}
          </div>
        </label>
      </div>
    </>
  );
}
