import { useEffect, useState } from "react";
import Login from "../pages/Login";
import Register from "../pages/Register";
import PaginaPrincipal from "../pages/PaginaPrincipal";

export default function Auth() {
  const [pagina, setPagina] = useState("register");

  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    if (!token || user || sessionError) {
      return;
    }

    let ignore = false;

    async function validateSession() {
      try {
        const response = await fetch("http://localhost:3000/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (ignore) {
          return;
        }

        if (response.status === 401) {
          handleLogout();
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          setSessionError(data.message);
          return;
        }

        if (!ignore) {
          setUser(data);
        }
      } catch (error) {
        console.error(error);

        if (!ignore) {
          setSessionError("Erro ao conectar com o servidor.");
        }
      }
    }

    validateSession();

    return () => {
      ignore = true;
    };
  }, [token, user, sessionError]);

  function handleAuthSuccess({ token }) {
    localStorage.setItem("token", token);
    setToken(token);
    setUser(null);
    setSessionError("");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setToken(null);
    setUser(null);
    setSessionError("");
  }

  if (token && user) {
    return <PaginaPrincipal token={token} user={user} onLogout={handleLogout} />;
  }

  if (token) {
    return (
      <div className="container">
        <div className="card">
          {sessionError ? (
            <>
              <p className="feedback">{sessionError}</p>
              <button
                className="btn btn-secondary"
                onClick={() => setSessionError("")}
              >
                Tentar novamente
              </button>
            </>
          ) : (
            <p>Verificando sessão...</p>
          )}
        </div>
      </div>
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
