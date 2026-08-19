/**
 * Wordmark placeholder para Capital Recovery Consulting LLC. Es un
 * monograma + texto armado en código, no un archivo de diseño — swap-eable
 * por un logo real (SVG/PNG) el día que exista uno, sin tocar el resto de
 * la UI (todo lo que la usa importa este componente, no un <img> suelto).
 */
export function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const isLight = variant === "light";
  return (
    <span className="logo">
      <span className="logo-badge" aria-hidden="true">
        CR
      </span>
      <span className="logo-wordmark" style={{ color: isLight ? "#ffffff" : undefined }}>
        <span className="logo-name">Capital Recovery</span>
        <span className="logo-suffix">Consulting LLC</span>
      </span>
    </span>
  );
}
