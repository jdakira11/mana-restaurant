/** Marco circular con un detalle de mandala sencillo (pétalos, anillo de puntos y líneas finas). */
export function MandalaFrame({ className = "" }: { className?: string }) {
  const petals = Array.from({ length: 24 }, (_, i) => i * 15);
  const leaves = Array.from({ length: 12 }, (_, i) => i * 30 + 7.5);
  return (
    <svg viewBox="0 0 240 240" className={className} aria-hidden>
      <g fill="none" stroke="currentColor">
        {petals.map((deg) => (
          <path key={deg} d="M120 3c4 5 4 11 0 16-4-5-4-11 0-16z" strokeWidth="1" transform={`rotate(${deg} 120 120)`} />
        ))}
        {leaves.map((deg) => (
          <circle key={deg} cx="120" cy="14.5" r="1.6" fill="currentColor" stroke="none" transform={`rotate(${deg} 120 120)`} />
        ))}
        <circle cx="120" cy="120" r="101" strokeWidth="1" opacity="0.8" />
        <circle cx="120" cy="120" r="106" strokeWidth="2" strokeDasharray="0.1 7" strokeLinecap="round" />
        <circle cx="120" cy="120" r="96" strokeWidth="1.5" />
      </g>
    </svg>
  );
}
