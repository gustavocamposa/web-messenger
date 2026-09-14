import "./styles/style.css";
import PaginaPrincipal from "./pages/PaginaPrincipal";
import HealthCheck from "./components/HealthCheck";

function App() {
  return (
    <>
      <HealthCheck />
      <PaginaPrincipal />
    </>
  );
}

export default App;
