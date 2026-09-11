import { useEffect, useState } from "react";

function App() {
  const [messages, setMessages] = useState([]);

  const userId = "user-2";

  useEffect(() => {
    fetch(`http://localhost:3000/messages/${userId}`)
      .then((response) => response.json())
      .then((data) => {
        setMessages(data);
      });
  }, []);

  return (
    <>
      {messages.map((message) => (
        <div key={message.id}>
          {message.from}
          {message.to}
          {message.text}
        </div>
      ))}
    </>
  );
}

export default App;
