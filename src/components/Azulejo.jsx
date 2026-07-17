// Decorative azulejo motif, served from /public/assets/img.
export function Rosette({ className, style }) {
  return (
    <img
      className={className}
      style={style}
      src="/assets/img/azulejo-rosette.svg"
      alt=""
      aria-hidden="true"
    />
  );
}

export function Divider() {
  return <img src="/assets/img/azulejo-divider.svg" alt="" aria-hidden="true" />;
}
