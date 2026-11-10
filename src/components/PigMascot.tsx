export function PigMascot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 280" className={className} fill="none" aria-hidden="true">
      <ellipse cx="160" cy="252" rx="92" ry="12" fill="#2A171B" opacity="0.1" />

      <g transform="rotate(-17 82 152)">
        <rect
          x="42"
          y="96"
          width="80"
          height="112"
          rx="14"
          fill="#FFF9EE"
          stroke="#E7DAC8"
          strokeWidth="2"
        />
        <text
          x="59"
          y="137"
          fill="#2A1D1B"
          fontFamily="Space Grotesk Variable, sans-serif"
          fontSize="34"
          fontWeight="700"
        >
          5
        </text>
        <g opacity="0.35" fill="#C73E5B" transform="translate(92 170)">
          <circle cx="5" cy="5" r="5" />
          <circle cx="5" cy="14" r="2" />
        </g>
      </g>

      <g transform="rotate(16 238 154)">
        <rect
          x="200"
          y="100"
          width="80"
          height="112"
          rx="14"
          fill="#FFF9EE"
          stroke="#E7DAC8"
          strokeWidth="2"
        />
        <text
          x="218"
          y="141"
          fill="#2A1D1B"
          fontFamily="Space Grotesk Variable, sans-serif"
          fontSize="34"
          fontWeight="700"
        >
          8
        </text>
        <g opacity="0.35" fill="#0F5D4A" transform="translate(250 174)">
          <circle cx="5" cy="5" r="5" />
          <circle cx="5" cy="14" r="2" />
        </g>
      </g>

      <path d="M94 98C72 64 75 45 85 42.5c13-3.4 32 13.5 43 28" fill="#E98DA4" />
      <path d="M226 98c22-34 19-53 9-55.5-13-3.4-32 13.5-43 28" fill="#E98DA4" />
      <path d="M97 78c8 5 17 13 23 21" stroke="#D97790" strokeWidth="3" strokeLinecap="round" />
      <path d="M223 78c-8 5-17 13-23 21" stroke="#D97790" strokeWidth="3" strokeLinecap="round" />

      <ellipse cx="160" cy="149" rx="92" ry="83" fill="#F3A6B8" />
      <ellipse cx="106" cy="165" rx="16" ry="9" fill="#EA8FA5" opacity="0.55" />
      <ellipse cx="214" cy="165" rx="16" ry="9" fill="#EA8FA5" opacity="0.55" />

      <ellipse cx="160" cy="174" rx="35" ry="26" fill="#F9C5D1" />
      <ellipse cx="150" cy="174" rx="4" ry="5.5" fill="#B65A70" />
      <ellipse cx="170" cy="174" rx="4" ry="5.5" fill="#B65A70" />

      <ellipse cx="128" cy="137" rx="6" ry="7" fill="#3B2026" />
      <ellipse cx="192" cy="137" rx="6" ry="7" fill="#3B2026" />
      <circle cx="130" cy="134.5" r="2" fill="white" opacity="0.9" />
      <circle cx="194" cy="134.5" r="2" fill="white" opacity="0.9" />

      <path
        d="M148 199c4 4 20 4 24 0"
        stroke="#B65A70"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.7"
      />

      <path d="M160 224l-42-20v40l42-20Z" fill="#0F5D4A" />
      <path d="M160 224l42-20v40l-42-20Z" fill="#0F5D4A" />
      <circle cx="160" cy="224" r="10" fill="#0B4A3B" />
      <circle cx="160" cy="224" r="3" fill="#E4A93C" />

      <path d="M51 90l3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z" fill="#E4A93C" />
      <path d="M274 70l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" fill="#E98DA4" />
      <circle cx="282" cy="200" r="3" fill="#E4A93C" opacity="0.8" />
      <circle cx="38" cy="210" r="2.5" fill="#E98DA4" opacity="0.8" />
    </svg>
  );
}
