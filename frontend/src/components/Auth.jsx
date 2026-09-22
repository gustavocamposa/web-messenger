import { useState } from "react";
import Login from "../pages/Login";
import Register from "../pages/Register";
import PaginaPrincipal from "../pages/PaginaPrincipal";

export default function Auth() {
  const [pagina, setPagina] = useState("register");

  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [userId, setUserId] = useState(() => localStorage.getItem("userId"));

  function handleAuthSuccess({ token, id }) {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", id);
    setToken(token);
    setUserId(id);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setToken(null);
    setUserId(null);
  }

  if (token && userId) {
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
