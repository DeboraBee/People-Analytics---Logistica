import { createContext, useContext, useMemo, useState } from "react";
import colaboradores from "../data/colaboradores.json";
import serieMensalColaborador from "../data/serie_mensal_colaborador.json";

const FILTER_KEYS = [
  { key: "departamento", label: "Departamento" },
  { key: "nivel_cargo", label: "Nível" },
  { key: "regional", label: "Regional" },
  { key: "status", label: "Status" },
  { key: "sexo", label: "Sexo" },
  { key: "tipo_contrato", label: "Contrato" },
];

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState(() =>
    Object.fromEntries(FILTER_KEYS.map((f) => [f.key, []]))
  );

  const options = useMemo(() => {
    const o = {};
    for (const { key } of FILTER_KEYS) {
      o[key] = [...new Set(colaboradores.map((r) => r[key]).filter(Boolean))].sort();
    }
    return o;
  }, []);

  const filtered = useMemo(() => {
    return colaboradores.filter((row) =>
      FILTER_KEYS.every(({ key }) => {
        const selected = filters[key];
        return !selected.length || selected.includes(row[key]);
      })
    );
  }, [filters]);

  const filteredMensal = useMemo(() => {
    return serieMensalColaborador.filter((row) =>
      FILTER_KEYS.every(({ key }) => {
        const selected = filters[key];
        return !selected.length || selected.includes(row[key]);
      })
    );
  }, [filters]);

  function toggle(key, value) {
    setFilters((prev) => {
      const cur = prev[key];
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      return { ...prev, [key]: next };
    });
  }

  function reset() {
    setFilters(Object.fromEntries(FILTER_KEYS.map((f) => [f.key, []])));
  }

  const activeCount = FILTER_KEYS.reduce((acc, { key }) => acc + filters[key].length, 0);

  return (
    <FilterContext.Provider
      value={{ filterDefs: FILTER_KEYS, filters, options, filtered, filteredMensal, toggle, reset, activeCount, all: colaboradores }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  return useContext(FilterContext);
}
