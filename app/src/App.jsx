import { HashRouter, Routes, Route } from "react-router-dom";
import { FilterProvider } from "./context/FilterContext";
import Layout from "./components/Layout";
import VisaoGeral from "./pages/VisaoGeral";
import Pessoas from "./pages/Pessoas";
import Performance from "./pages/Performance";
import SaudeOrganizacional from "./pages/SaudeOrganizacional";

export default function App() {
  return (
    <HashRouter>
      <FilterProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<VisaoGeral />} />
            <Route path="/pessoas" element={<Pessoas />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/saude-organizacional" element={<SaudeOrganizacional />} />
          </Routes>
        </Layout>
      </FilterProvider>
    </HashRouter>
  );
}
