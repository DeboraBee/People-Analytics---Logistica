import { NavLink } from "react-router-dom";
import Logo from "./Logo";

const LINKS = [
  { to: "/", label: "Visão Geral" },
  { to: "/pessoas", label: "Pessoas" },
  { to: "/performance", label: "Performance" },
  { to: "/saude-organizacional", label: "Saúde Organizacional" },
  { to: "/unidades", label: "Unidades (CDs)" },
  { to: "/remuneracao", label: "Remuneração & Recrutamento" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Logo />
      </div>
      <nav className="sidebar-nav">
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === "/"}
            className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
          >
            <span className="dot" />
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">People Analytics · J&amp;T Express</div>
    </aside>
  );
}
