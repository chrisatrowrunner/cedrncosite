// Segmented / toggle control.
// variant="segmented" → navy active state (flight class, trip feel)
// variant="toggle"    → gold active state (travelers, care needs)
export default function Segmented({ options, value, onChange, variant = 'segmented', ariaLabel }) {
  return (
    <div
      className={`segmented${variant === 'toggle' ? ' segmented--toggle' : ''}`}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className="seg"
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
