import "./styles/style.css"
import PaginaPrincipal from "./pages/PaginaPrincipal";
import { useEffect, useState } from "react";

function App() {

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
      <PaginaPrincipal />
    </>
  );
}

export default App; 
