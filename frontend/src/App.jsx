import "./styles/style.css";
import PaginaPrincipal from "./pages/PaginaPrincipal";
import Login from "./pages/Login";
import HealthCheck from "./components/HealthCheck";
function App() {
  return (
    <>
      <Login />
      <PaginaPrincipal />
      <HealthCheck />
    </>
  );
}

export default App;
