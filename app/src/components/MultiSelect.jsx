import { useEffect, useRef, useState } from "react";

export default function MultiSelect({ label, options, selected, onToggle }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="multiselect" ref={ref}>
      <button
        className={`multiselect-btn${selected.length ? " active" : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        {selected.length > 0 && <span className="multiselect-badge">{selected.length}</span>}
        <span style={{ opacity: 0.5 }}>▾</span>
      </button>
      {open && (
        <div className="multiselect-panel">
          {options.map((opt) => (
            <label className="multiselect-option" key={opt}>
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => onToggle(opt)}
              />
              {opt}
            </label>
          ))}
          {!options.length && <div style={{ fontSize: 12, color: "#9199a3", padding: 6 }}>Sem opções</div>}
        </div>
      )}
    </div>
  );
}
