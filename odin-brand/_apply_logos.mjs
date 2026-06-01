// Generates ODIN-branded logo SVGs into src/core/server/core_app/assets/logos/
// keeping the original OpenSearch filenames so no code references break.
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'src/core/server/core_app/assets/logos');

const GRAD =
  '<defs><linearGradient id="g" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3B82F6"></stop><stop offset="1" stop-color="#22D3EE"></stop></linearGradient></defs>';

// ---- Full ODIN lockup (wordmark) ----
const lockup = (textFill, withGrad = true) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100" width="600" height="200">${GRAD}
<g><circle cx="50" cy="50" r="44" fill="none" stroke="url(#g)" stroke-width="4.5" opacity="0.3"></circle>
<circle cx="50" cy="50" r="30" fill="none" stroke="url(#g)" stroke-width="5.5" opacity="0.6"></circle>
<circle cx="50" cy="50" r="16" fill="none" stroke="url(#g)" stroke-width="7"></circle>
<path d="M50 50 L 53.069 6.107 A 44 44 0 0 1 88.85 29.343 Z" fill="#22D3EE" opacity="0.18"></path>
<line x1="50" y1="50" x2="88.85" y2="29.343" stroke="#22D3EE" stroke-width="6" stroke-linecap="round"></line>
<circle cx="50" cy="50" r="4.5" fill="url(#g)"></circle></g>
<text x="106" y="50" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif" font-weight="600" font-size="92" letter-spacing="9.2" dominant-baseline="central" fill="${textFill}">DIN</text>
</svg>
`;
// Themed lockup: text adapts to color scheme
const lockupThemed = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100" width="600" height="200"><defs><linearGradient id="g" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3B82F6"></stop><stop offset="1" stop-color="#22D3EE"></stop></linearGradient><style>.wm{fill:#0B1220}@media(prefers-color-scheme:dark){.wm{fill:#E6EDF6}}</style></defs>
<g><circle cx="50" cy="50" r="44" fill="none" stroke="url(#g)" stroke-width="4.5" opacity="0.3"></circle>
<circle cx="50" cy="50" r="30" fill="none" stroke="url(#g)" stroke-width="5.5" opacity="0.6"></circle>
<circle cx="50" cy="50" r="16" fill="none" stroke="url(#g)" stroke-width="7"></circle>
<path d="M50 50 L 53.069 6.107 A 44 44 0 0 1 88.85 29.343 Z" fill="#22D3EE" opacity="0.18"></path>
<line x1="50" y1="50" x2="88.85" y2="29.343" stroke="#22D3EE" stroke-width="6" stroke-linecap="round"></line>
<circle cx="50" cy="50" r="4.5" fill="url(#g)"></circle></g>
<text class="wm" x="106" y="50" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif" font-weight="600" font-size="92" letter-spacing="9.2" dominant-baseline="central">DIN</text>
</svg>
`;

// ---- Mark (mini) ----
const markMini = (stroke) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="256" height="256">${
    stroke === 'url(#g)' ? GRAD : ''
  }
<circle cx="50" cy="50" r="42" fill="none" stroke="${stroke}" stroke-width="7"></circle>
<circle cx="50" cy="50" r="20" fill="none" stroke="${stroke}" stroke-width="8" opacity="0.4"></circle>
<line x1="50" y1="50" x2="83.096" y2="24.142" stroke="${stroke}" stroke-width="8" stroke-linecap="round"></line>
<circle cx="50" cy="50" r="6.5" fill="${stroke}"></circle>
</svg>
`;

// ---- Center mark (sweep) ----
const markSweep = (color) => {
  const isGrad = color === 'url(#g)';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="256" height="256">${
    isGrad ? GRAD : ''
  }
<circle cx="50" cy="50" r="44" fill="none" stroke="${color}" stroke-width="4.5" opacity="0.3"></circle>
<circle cx="50" cy="50" r="30" fill="none" stroke="${color}" stroke-width="5.5" opacity="0.6"></circle>
<circle cx="50" cy="50" r="16" fill="none" stroke="${color}" stroke-width="7"></circle>
<path d="M50 50 L 53.069 6.107 A 44 44 0 0 1 88.85 29.343 Z" fill="${
    isGrad ? '#22D3EE' : color
  }" opacity="0.18"></path>
<line x1="50" y1="50" x2="88.85" y2="29.343" stroke="${
    isGrad ? '#22D3EE' : color
  }" stroke-width="6" stroke-linecap="round"></line>
<circle cx="50" cy="50" r="4.5" fill="${color}"></circle>
</svg>
`;
};

// ---- Animated spinner (radar sweep via SMIL) ----
const spinner = (color) => {
  const isGrad = color === 'url(#g)';
  const beam = isGrad ? '#22D3EE' : color;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="120" height="120">${
    isGrad ? GRAD : ''
  }
<g fill="none" stroke="${color}" stroke-linecap="round">
  <circle cx="50" cy="50" r="44" stroke-width="4.5" opacity="0.22"></circle>
  <circle cx="50" cy="50" r="30" stroke-width="5.5" opacity="0.4"></circle>
  <circle cx="50" cy="50" r="16" stroke-width="7" opacity="0.75"></circle>
</g>
<g>
  <path d="M50 50 L 53.069 6.107 A 44 44 0 0 1 88.85 29.343 Z" fill="${beam}" opacity="0.18"></path>
  <line x1="50" y1="50" x2="88.85" y2="29.343" stroke="${beam}" stroke-width="6" stroke-linecap="round"></line>
  <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1.4s" repeatCount="indefinite"></animateTransform>
</g>
<circle cx="50" cy="50" r="4.5" fill="${color}"></circle>
</svg>
`;
};

const files = {
  // Product wordmark
  'opensearch.svg': lockupThemed,
  'opensearch_on_light.svg': lockup('#0B1220'),
  'opensearch_on_dark.svg': lockup('#E6EDF6'),
  // "Dashboards" wordmark — ODIN is a single product name, reuse the lockup
  'opensearch_dashboards.svg': lockupThemed,
  'opensearch_dashboards_on_light.svg': lockup('#0B1220'),
  'opensearch_dashboards_on_dark.svg': lockup('#E6EDF6'),
  // Mark / icon
  'opensearch_mark.svg': markMini('url(#g)'),
  'opensearch_mark_on_light.svg': markMini('#0B1220'),
  'opensearch_mark_on_dark.svg': markMini('#FFFFFF'),
  // Center mark
  'opensearch_center_mark.svg': markSweep('url(#g)'),
  'opensearch_center_mark_on_light.svg': markSweep('#0B1220'),
  'opensearch_center_mark_on_dark.svg': markSweep('#FFFFFF'),
  // Animated spinner (loading icon)
  'opensearch_spinner.svg': spinner('url(#g)'),
  'opensearch_spinner_on_light.svg': spinner('#0B1220'),
  'opensearch_spinner_on_dark.svg': spinner('#FFFFFF'),
};

for (const [name, content] of Object.entries(files)) {
  writeFileSync(join(out, name), content);
  console.log('wrote', name);
}
console.log('done:', Object.keys(files).length, 'logo files');
