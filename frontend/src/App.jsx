import "./styles/style.css";
import PaginaPrincipal from "./pages/PaginaPrincipal";
import Login from "./pages/Login";
import HealthCheck from "./components/HealthCheck";
import Register from "./pages/Register";
function App() {
  return (
    <>
      <Register />
      <Login />
      <PaginaPrincipal />
      <HealthCheck />
    </>
  );
}

export default App;
