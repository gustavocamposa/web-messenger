import { useState } from "react";
import "../styles/style.css";

export default function PaginaPrincipal({ token, userId, onLogout }) {
  const [send, setSend] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [feedback, setFeedback] = useState("");

  async function getMessages() {
    const response = await fetch(`http://localhost:3000/messages/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      setFeedback(data.message);
      return;
    }

    setMessages(data);
  }

  async function sendMessage() {
    if (!send.trim()) {
      setFeedback("Informe para quem deseja enviar a mensagem.");
      return;
    }

    if (!message.trim()) {
      setFeedback("Você deve digitar uma mensagem.");
      return;
    }

    try {
      const request = await fetch("http://localhost:3000/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: send,
          text: message,
        }),
      });

      const data = await request.json();

      if (!request.ok) {
        setFeedback(data.message);
        return;
      }

      setMessage("");
      setFeedback(data.message);
    } catch (error) {
      setFeedback("Erro ao conectar com o servidor.");
    }
  }

  async function copyUserId() {
    await navigator.clipboard.writeText(userId);
  }

  return (
    <div className="container">
      <div className="card">
        <div className="id-section">
          <button className="btn btn-secondary" onClick={copyUserId}>
            Copy ID
          </button>
          <button className="btn btn-secondary" onClick={onLogout}>
            Logout
          </button>
          <p className="user-id">Your ID: {userId}</p>
        </div>

        <div className="form-section">
          <input
            className="input"
            type="text"
            value={send}
            onChange={(e) => setSend(e.target.value)}
            placeholder="Send To."
          />
          <input
            className="input"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message."
          />
          <button className="btn btn-primary" onClick={sendMessage}>
            Send
          </button>
          {feedback && <p className="feedback">{feedback}</p>}
        </div>

        <div className="messages">
          <div className="messages-header">
            <h3>Messages</h3>
            <button className="btn btn-secondary" onClick={getMessages}>
              Check Messages
            </button>
          </div>
          {messages.map((message, index) => (
            <p className="message-item" key={index}>
              <strong>{message.from}:</strong> {message.text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}