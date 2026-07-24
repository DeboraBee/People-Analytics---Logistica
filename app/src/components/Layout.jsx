import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import FilterBar from "./FilterBar";

const TITLES = {
  "/": ["Visão Geral", "KPIs executivos e panorama geral de RH"],
  "/pessoas": ["Pessoas", "Perfil demográfico do quadro de colaboradores"],
  "/performance": ["Performance", "Avaliação, promoções e desenvolvimento"],
  "/saude-organizacional": ["Saúde Organizacional", "Afastamentos, jornada e engajamento"],
};

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const [title, subtitle] = TITLES[pathname] || TITLES["/"];

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <div className="topbar-title">
            <h1>{title}</h1>
            <span>{subtitle}</span>
          </div>
        </div>
        <FilterBar />
        <div className="page">{children}</div>
      </div>
    </div>
  );
}
