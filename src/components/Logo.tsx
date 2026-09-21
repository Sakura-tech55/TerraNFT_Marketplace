/* Identity mark: a minted coin carrying three stacked ledger plates */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="19" fill="var(--lime)" />
      <circle cx="20" cy="20" r="15.5" stroke="#0b0b10" strokeOpacity=".22" strokeWidth="1" />
      <g fill="#0b0b10">
        <path d="M20 9 L29 14 L20 19 L11 14 Z" />
        <path d="M11 18.2 L20 23.2 L29 18.2 L29 20.6 L20 25.6 L11 20.6 Z" opacity=".7" />
        <path d="M11 23.4 L20 28.4 L29 23.4 L29 25.8 L20 30.8 L11 25.8 Z" opacity=".4" />
      </g>
    </svg>
  );
}

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <LogoMark size={size} />
      <span
        style={{
          fontFamily: "var(--display)",
          fontWeight: 600,
          fontSize: 15,
          letterSpacing: "-0.02em",
          color: "var(--ink)",
          whiteSpace: "nowrap",
        }}
      >
        Terra Ledger
      </span>
    </span>
  );
}
