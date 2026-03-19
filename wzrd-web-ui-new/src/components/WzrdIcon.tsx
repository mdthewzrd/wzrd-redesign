interface WzrdIconProps {
  className?: string;
  size?: number;
}

export function WzrdIcon({ className = '', size = 24 }: WzrdIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F7D000" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFA500" />
        </linearGradient>
      </defs>

      <circle cx="64" cy="64" r="60" fill="#1a1a2e" stroke="url(#goldGradient)" strokeWidth="3" />

      <text x="64" y="72" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="32" fill="url(#goldGradient)">
        WZRD
      </text>

      <circle cx="32" cy="32" r="3" fill="url(#goldGradient)" opacity="0.8" />
      <circle cx="96" cy="32" r="2" fill="url(#goldGradient)" opacity="0.6" />
      <circle cx="104" cy="48" r="2.5" fill="url(#goldGradient)" opacity="0.7" />
      <circle cx="24" cy="52" r="2" fill="url(#goldGradient)" opacity="0.5" />
      <circle cx="88" cy="88" r="2" fill="url(#goldGradient)" opacity="0.6" />
      <circle cx="40" cy="96" r="2.5" fill="url(#goldGradient)" opacity="0.7" />

      <path d="M44 38 L50 28 L64 35 L78 28 L84 38" stroke="url(#goldGradient)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="64" cy="32" r="4" fill="url(#goldGradient)" />
    </svg>
  );
}

// Compact version for small inline use (just emoji with sparkles)
export function WzrdEmoji({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center ${className}`}>
      <span className="text-yellow-400 text-lg">
        ⚡
      </span>
    </span>
  );
}
