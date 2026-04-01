"use client";

interface CooperMascotProps {
  size?: number;
  animated?: boolean;
  variant?: "run" | "idle" | "wave";
}

/**
 * Cooper — pea mascot, sticker/enamel-pin style.
 * Thick dark outlines, layered color bands, wavy dividers,
 * pill slit-eyes, chunky shoes, ice cream in left hand, dollar bill in right.
 */
export function CooperMascot({
  size = 200,
  animated = true,
  variant = "idle",
}: CooperMascotProps) {
  const anim = animated
    ? variant === "run"
      ? "[animation:bounce_0.6s_ease-in-out_infinite_alternate]"
      : "[animation:wiggle_4s_ease-in-out_infinite]"
    : "";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 258 270"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={anim}
      aria-label="Cooper mascot"
      style={{ filter: "drop-shadow(0 10px 30px rgba(18,55,8,0.14))" }}
    >
      <defs>
        <clipPath id="cooper-body-clip">
          <circle cx="114" cy="116" r="70" />
        </clipPath>
      </defs>

      {/* ── Ground shadow ── */}
      <ellipse cx="124" cy="266" rx="56" ry="8" fill="#1A3C08" opacity="0.10" />

      {/* ── Motion squiggle — speed trail to the left ── */}
      <path
        d="M50 168 C44 161 37 171 31 164 C25 157 19 167 12 160"
        stroke="#1D2032" strokeWidth="6" strokeLinecap="round" fill="none"
      />
      {/* Speed drops near feet */}
      <ellipse cx="60"  cy="228" rx="4.5" ry="7"   fill="#1D2032" transform="rotate(22 60 228)" />
      <ellipse cx="46"  cy="242" rx="3.5" ry="5.5" fill="#1D2032" transform="rotate(15 46 242)" />
      <ellipse cx="34"  cy="216" rx="2.5" ry="4"   fill="#1D2032" transform="rotate(30 34 216)" />

      {/* ====== CHARACTER GROUP — leaning forward ====== */}
      <g transform="rotate(9 114 174)">

        {/* ── Color bands (clipped to body circle) ── */}
        {/* Teal bottom */}
        <rect x="44" y="154" width="140" height="32" clipPath="url(#cooper-body-clip)" fill="#54BEB0" />
        <path
          d="M44 154 Q62 142 80 154 Q98 166 116 154 Q134 142 152 154 Q166 162 170 158 L170 186 L44 186 Z"
          clipPath="url(#cooper-body-clip)" fill="#54BEB0"
        />
        {/* Green middle */}
        <rect x="44" y="92" width="140" height="66" clipPath="url(#cooper-body-clip)" fill="#72D418" />
        {/* Lime top */}
        <rect x="44" y="46" width="140" height="48" clipPath="url(#cooper-body-clip)" fill="#C8F052" />
        <path
          d="M44 92 Q62 104 80 92 Q98 80 116 92 Q134 104 152 92 Q166 84 170 88 L170 46 L44 46 Z"
          clipPath="url(#cooper-body-clip)" fill="#C8F052"
        />

        {/* ── Body outline — thick sticker border ── */}
        <circle cx="114" cy="116" r="70" stroke="#1D2032" strokeWidth="10" fill="none" />

        {/* ── Ear nub — upper right, cream ── */}
        <path
          d="M170 80 C180 70 190 78 188 93 C186 105 175 108 170 99 Z"
          fill="#F5EDD8" stroke="#1D2032" strokeWidth="7"
          strokeLinejoin="round" strokeLinecap="round"
        />
        <path
          d="M173 85 C179 80 184 87 182 96"
          stroke="#DDD0BC" strokeWidth="3" strokeLinecap="round" fill="none"
        />

        {/* ── Eyes — horizontal pill slits ── */}
        <rect x="86"  y="108" width="26" height="13" rx="6.5" fill="#1D2032" transform="rotate(-5 99 114)" />
        <rect x="118" y="104" width="26" height="13" rx="6.5" fill="#1D2032" transform="rotate(4 131 110)" />
        <ellipse cx="93"  cy="111" rx="3.5" ry="2.5" fill="white" opacity="0.30" transform="rotate(-5 99 114)" />
        <ellipse cx="125" cy="107" rx="3.5" ry="2.5" fill="white" opacity="0.30" transform="rotate(4 131 110)" />

        {/* ── LEFT ARM ── */}
        <path
          d="M70 112 C52 102 36 90 22 80"
          stroke="#1D2032" strokeWidth="16" strokeLinecap="round" fill="none"
        />
        <path
          d="M70 112 C52 102 36 90 22 80"
          stroke="#F5EDD8" strokeWidth="7" strokeLinecap="round" fill="none"
        />
        {/* Left fist */}
        <circle cx="20" cy="78" r="13" fill="#F5EDD8" stroke="#1D2032" strokeWidth="6" />

        {/* ── ICE CREAM CONE (left hand) ── */}
        {/* Cone — drawn first so scoop overlaps top of it */}
        <path
          d="M4 68 L22 94 L40 68 Z"
          fill="#F0C878" stroke="#1D2032" strokeWidth="6" strokeLinejoin="round"
        />
        {/* Waffle lines on cone */}
        <path d="M10 68 L13 88" stroke="#C89040" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
        <path d="M18 68 L20 90" stroke="#C89040" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
        <path d="M26 68 L26 90" stroke="#C89040" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
        <path d="M34 68 L31 86" stroke="#C89040" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
        {/* Scoop — pastel pink, on top of cone */}
        <circle cx="22" cy="50" r="20" fill="#FFBCD0" stroke="#1D2032" strokeWidth="6" />
        {/* Scoop highlight */}
        <ellipse cx="15" cy="42" rx="7" ry="5.5" fill="white" opacity="0.28" transform="rotate(-20 15 42)" />
        {/* Tiny swirl dot */}
        <circle cx="28" cy="52" r="3" fill="#FF94B0" opacity="0.55" />

        {/* ── RIGHT ARM ── */}
        <path
          d="M158 112 C176 102 194 90 208 80"
          stroke="#1D2032" strokeWidth="16" strokeLinecap="round" fill="none"
        />
        <path
          d="M158 112 C176 102 194 90 208 80"
          stroke="#F5EDD8" strokeWidth="7" strokeLinecap="round" fill="none"
        />
        {/* Right fist */}
        <circle cx="210" cy="78" r="13" fill="#F5EDD8" stroke="#1D2032" strokeWidth="6" />

        {/* ── DOLLAR BILL (right hand) ── */}
        {/* Bill body */}
        <rect
          x="190" y="46" width="44" height="30" rx="5"
          fill="#78C840" stroke="#1D2032" strokeWidth="6" strokeLinejoin="round"
        />
        {/* Left & right side panels */}
        <rect x="195" y="51" width="7" height="20" rx="3.5" fill="#5EAA28" />
        <rect x="228" y="51" width="7" height="20" rx="3.5" fill="#5EAA28" />
        {/* Centre oval portrait */}
        <ellipse cx="212" cy="61" rx="9" ry="11"
          fill="#5EAA28" stroke="#1D2032" strokeWidth="2.5" opacity="0.90"
        />
        {/* $ symbol */}
        <text
          x="212" y="66"
          textAnchor="middle" fontSize="14" fontWeight="900"
          fill="white" fontFamily="system-ui, -apple-system, sans-serif"
        >$</text>

        {/* ── Legs ── */}
        {/* Left leg (forward) */}
        <path d="M100 184 C93 199 85 213 76 228"
          stroke="#1D2032" strokeWidth="16" strokeLinecap="round" fill="none" />
        <path d="M100 184 C93 199 85 213 76 228"
          stroke="#F5EDD8" strokeWidth="7" strokeLinecap="round" fill="none" />
        {/* Right leg (push-off) */}
        <path d="M126 184 C132 196 140 208 148 220"
          stroke="#1D2032" strokeWidth="16" strokeLinecap="round" fill="none" />
        <path d="M126 184 C132 196 140 208 148 220"
          stroke="#F5EDD8" strokeWidth="7" strokeLinecap="round" fill="none" />

        {/* ── Shoes ── */}
        {/* Left shoe */}
        <path
          d="M56 230 C49 223 51 213 60 210 C70 207 93 217 100 223 C105 227 103 235 95 238 C84 241 63 236 56 230 Z"
          fill="#F5EDD8" stroke="#1D2032" strokeWidth="7" strokeLinejoin="round"
        />
        <path
          d="M57 230 C51 233 52 237 59 239 C68 242 84 241 94 238 C101 235 104 231 100 228"
          fill="#F0A060" stroke="#1D2032" strokeWidth="5" strokeLinecap="round"
        />
        {/* Right shoe */}
        <path
          d="M136 222 C143 215 158 218 164 225 C168 230 166 238 158 239 C148 242 133 234 129 228 C127 223 130 219 136 222 Z"
          fill="#F5EDD8" stroke="#1D2032" strokeWidth="7" strokeLinejoin="round"
        />
        <path
          d="M130 228 C132 233 144 239 156 238 C163 236 167 232 164 228"
          fill="#F0A060" stroke="#1D2032" strokeWidth="5" strokeLinecap="round"
        />

      </g>
    </svg>
  );
}

export function CooperMascotSmall({ size = 44 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="cooper-sm-clip">
          <circle cx="36" cy="36" r="26" />
        </clipPath>
        <radialGradient id="cooper-sm-badge" cx="34%" cy="26%" r="74%">
          <stop offset="0%"  stopColor="#FFD070" />
          <stop offset="100%" stopColor="#C84C08" />
        </radialGradient>
      </defs>

      {/* Teal bottom */}
      <rect x="10" y="50" width="52" height="12" clipPath="url(#cooper-sm-clip)" fill="#54BEB0" />
      <path
        d="M10 50 Q19 44 28 50 Q37 56 46 50 Q55 44 62 50 L62 62 L10 62 Z"
        clipPath="url(#cooper-sm-clip)" fill="#54BEB0"
      />
      {/* Green middle */}
      <rect x="10" y="26" width="52" height="26" clipPath="url(#cooper-sm-clip)" fill="#72D418" />
      {/* Lime top */}
      <rect x="10" y="10" width="52" height="18" clipPath="url(#cooper-sm-clip)" fill="#C8F052" />
      <path
        d="M10 26 Q19 32 28 26 Q37 20 46 26 Q55 32 62 28 L62 10 L10 10 Z"
        clipPath="url(#cooper-sm-clip)" fill="#C8F052"
      />

      {/* Body outline */}
      <circle cx="36" cy="36" r="26" stroke="#1D2032" strokeWidth="4" fill="none" />

      {/* Slit eyes */}
      <rect x="20" y="33" width="11" height="6" rx="3" fill="#1D2032" transform="rotate(-4 25.5 36)" />
      <rect x="37" y="31" width="11" height="6" rx="3" fill="#1D2032" transform="rotate(3 42.5 34)" />

      {/* Badge */}
      <circle cx="61" cy="19" r="13" fill="url(#cooper-sm-badge)" stroke="#1D2032" strokeWidth="3" />
      <text
        x="61" y="24"
        textAnchor="middle" fontSize="13" fontWeight="900"
        fill="#FFF4E0" fontFamily="system-ui"
      >$</text>
    </svg>
  );
}
