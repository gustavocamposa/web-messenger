import { useState } from "react";
import Login from "../pages/Login";
import Register from "../pages/Register";
import PaginaPrincipal from "../pages/PaginaPrincipal";

export default function Auth() {
  const [pagina, setPagina] = useState("register");
  const [token, setToken] = useState(null);

  if (token) {
    return <PaginaPrincipal />;
  }

  return (
    <div>
      {pagina === "register" ? (
        <Register
          onRegisterSucess={() => {
            setPagina("login");
          }}
        />
      ) : (
        <Login onLoginSuccess={setToken} />
      )}
    </div>
  );
}
