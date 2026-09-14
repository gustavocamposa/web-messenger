import { useState } from "react";

export default function PaginaPrincipal() {
  const [text, setText] = useState("");
  const [send, setSend] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  async function sendMessage() {
    const request = await fetch("http://localhost:3000/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: text,
        to: send,
        text: message,
      }),
    });

<<<<<<< HEAD
=======
    await response.json();

>>>>>>> main
    setMessage("");
  }

  async function getMessages() {
    const response = await fetch(`http://localhost:3000/messages/${text}`);

    const data = await response.json();

    setMessages(data);
  }
<<<<<<< HEAD
=======

>>>>>>> main
  return (
    <>
      <div>
        <label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Your user ID."
          />
          <br />
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
