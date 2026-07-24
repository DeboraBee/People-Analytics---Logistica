import { useFilters } from "../context/FilterContext";
import MultiSelect from "./MultiSelect";

export default function FilterBar() {
  const { filterDefs, filters, options, toggle, reset, activeCount, filtered, all } = useFilters();

  return (
    <div className="filterbar">
      <span className="filterbar-label">Filtros</span>
      {filterDefs.map(({ key, label }) => (
        <MultiSelect
          key={key}
          label={label}
          options={options[key]}
          selected={filters[key]}
          onToggle={(v) => toggle(key, v)}
        />
      ))}
      <span className="filter-count">
        {filtered.length} de {all.length} colaboradores
      </span>
      {activeCount > 0 && (
        <button className="filter-reset" onClick={reset}>
          Limpar filtros
        </button>
      )}
    </div>
  );
}
