import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import { routes } from "./routes";
import { useTitle } from "./hooks";

function AppRoutes() {
  useTitle("UI | Qdrant ");
  const routing = useRoutes(routes.components());

  return <main style={{ height: "100vh" }}>{routing}</main>;
}

function App() {
  return <AppRoutes />;
}
export default App;
