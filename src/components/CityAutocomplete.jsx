import { useEffect, useRef, useState } from 'react';
import { searchLocations } from '../lib/api.js';

// Bold + gold the first case-insensitive occurrence of `query` within `text`.
function highlight(text, query) {
  if (!text) return text;
  const q = (query || '').trim();
  if (q.length < 1) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

const SearchIcon = () => (
  <svg className="autocomplete__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function CityAutocomplete({ id, label, placeholder, value, onInput, onSelect }) {
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false); // a query of >=3 chars has returned
  const [fallback, setFallback] = useState(false);  // API failed → plain input
  const [active, setActive] = useState(-1);
  const wrapRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (fallback) return;
    const q = (value || '').trim();
    if (q.length < 3) {
      setResults([]); setSearched(false); setLoading(false); setOpen(false);
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchLocations(q, controller.signal);
        setResults(res);
        setSearched(true);
        setOpen(true);
        setActive(-1);
      } catch (err) {
        if (err.name !== 'AbortError') setFallback(true); // API failed entirely
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => { clearTimeout(t); controller.abort(); };
  }, [value, fallback]);

  // Dismiss on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function choose(loc) {
    onSelect(loc);
    setOpen(false);
    setResults([]);
  }

  function onKeyDown(e) {
    if (!open || !results.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); choose(results[active]); }
    else if (e.key === 'Escape') { setOpen(false); }
  }

  // Fallback: plain manual-entry input
  if (fallback) {
    return (
      <div className="field">
        <label htmlFor={id}>
          <span className="field__cap">{label}</span>
          <input
            id={id}
            className="input"
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onInput(e.target.value, null)}
          />
        </label>
        <div className="autocomplete__fallback-note">Enter city or airport code manually.</div>
      </div>
    );
  }

  const showMenu = open && (value || '').trim().length >= 3;

  return (
    <div className="field">
      <label htmlFor={id}><span className="field__cap">{label}</span></label>
      <div className="autocomplete" ref={wrapRef}>
        <SearchIcon />
        <input
          id={id}
          className="input"
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onInput(e.target.value, null)}
          onFocus={() => { if (results.length) setOpen(true); }}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={showMenu}
          aria-controls={`${id}-menu`}
          aria-autocomplete="list"
        />
        {loading && <span className="autocomplete__busy"><span className="spinner" /></span>}

        {showMenu && (
          <ul className="autocomplete__menu" id={`${id}-menu`} role="listbox">
            {results.length === 0 && searched && !loading && (
              <li className="autocomplete__empty" role="option" aria-disabled="true">
                No airports found — try a different search.
              </li>
            )}
            {results.map((r, i) => (
              <li key={`${r.iataCode}-${i}`} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  className="autocomplete__option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(r)}
                >
                  {highlight(r.cityName, value)}
                  {r.countryName ? <>, {highlight(r.countryName, value)}</> : null}{' '}
                  <span className="iata">({r.iataCode})</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
