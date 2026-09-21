import { useState } from "react";
import Login from "../pages/Login";
import Register from "../pages/Register";
import PaginaPrincipal from "../pages/PaginaPrincipal";

export default function Auth() {
  const [pagina, setPagina] = useState("register");
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  function handleAuthSuccess({ token, id }) {
    setToken(token);
    setUserId(id);
  }

  function handleLogout() {
    setToken(null);
    setUserId(null);
  }

  if (token) {
    return (
      <PaginaPrincipal token={token} userId={userId} onLogout={handleLogout} />
    );
  }

  return (
    <div>
      {pagina === "register" ? (
        <Register
          onRegisterSucess={handleAuthSuccess}
          onGoToLogin={() => setPagina("login")}
        />
      ) : (
        <Login
          onLoginSuccess={handleAuthSuccess}
          onGoToRegister={() => setPagina("register")}
        />
      )}
    </div>
  );
}
