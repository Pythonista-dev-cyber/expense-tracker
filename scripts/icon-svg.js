// The app icon artwork, shared by make-icon.js and make-store-assets.js.
module.exports = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#a78bfa"/><stop offset=".45" stop-color="#6366f1"/><stop offset="1" stop-color="#0891b2"/>
    </linearGradient>
    <radialGradient id="shine" cx=".25" cy=".15" r=".9">
      <stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="236" height="236" rx="60" fill="url(#bg)"/>
  <rect x="10" y="10" width="236" height="236" rx="60" fill="url(#shine)"/>
  <path d="M52 176 C80 176 84 138 110 140 C136 142 140 158 162 132 C180 110 186 92 204 80 L204 204 L52 204 Z" fill="url(#area)"/>
  <path d="M52 176 C80 176 84 138 110 140 C136 142 140 158 162 132 C180 110 186 92 204 80" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round"/>
  <circle cx="204" cy="80" r="16" fill="#fff"/>
  <circle cx="204" cy="80" r="7" fill="#22d3ee"/>
  <rect x="10" y="10" width="236" height="236" rx="60" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="3"/>
</svg>`;
