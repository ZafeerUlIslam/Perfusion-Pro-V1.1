/**
 * ═══════════════════════════════════════════════════════════
 *   PERFUSION PRO SUITE — Module: Kirklin PA Ring Size
 *   Author: Zafeer ul Islam
 *   Version: 1.0
 * ═══════════════════════════════════════════════════════════
 *
 *  Source: Kirklin JW, 1975–1976
 *  "Minimum Acceptable Pulmonary Valve Ring Diameter"
 *  Input:  Weight (kg)
 *  Output: Ring diameter (mm), Area (mm²), Half size (mm)
 *
 *  Method: Linear interpolation between published rows.
 *  Values rounded to whole numbers as per clinical use.
 * ═══════════════════════════════════════════════════════════
 */

// ── Published Kirklin table (exact values from source) ───────
// [ weight_kg, ring_mm, area_mm2, half_size_mm ]
const KIRKLIN_TABLE = [
    [1,   4,    13,  null],
    [2,   5,    20,  null],
    [3,   6,    28,  4   ],
    [4,   7,    39,  5   ],
    [5,   7.5,  45,  5.5 ],
    [6,   8,    50,  6   ],
    [7,   9,    64,  6.5 ],
    [8,   9.5,  72,  6.5 ],
    [9,   10,   79,  7   ],
    [10,  11,   95,  7.5 ],
    [12,  12,   113, 8.5 ],
    [14,  13,   133, 9   ],
    [16,  13.5, 144, 9.5 ],
    [18,  14,   154, 10  ],
    [20,  15,   177, 11  ],
    [25,  17,   227, 12  ],
    [30,  18.5, 270, 13  ],
    [35,  20,   314, 14  ],
    [40,  20,   314, 14  ],
];

// ── Lookup with linear interpolation ────────────────────────
function lookupKirklin(weightKg) {
    const t = KIRKLIN_TABLE;

    // Below minimum
    if (weightKg <= t[0][0]) {
        return {
            ring: t[0][1],
            area: t[0][2],
            half: t[0][3],
            exact: true
        };
    }
    // Above maximum
    if (weightKg >= t[t.length - 1][0]) {
        return {
            ring: t[t.length - 1][1],
            area: t[t.length - 1][2],
            half: t[t.length - 1][3],
            exact: true
        };
    }
    // Exact match
    for (let i = 0; i < t.length; i++) {
        if (t[i][0] === weightKg) {
            return { ring: t[i][1], area: t[i][2], half: t[i][3], exact: true };
        }
    }
    // Interpolate between surrounding rows
    for (let i = 0; i < t.length - 1; i++) {
        if (t[i][0] < weightKg && weightKg < t[i + 1][0]) {
            const lo = t[i];
            const hi = t[i + 1];
            const frac = (weightKg - lo[0]) / (hi[0] - lo[0]);

            const ring = lo[1] + frac * (hi[1] - lo[1]);
            const area = lo[2] + frac * (hi[2] - lo[2]);

            // Half size — interpolate only if both ends have it
            let half = null;
            if (lo[3] !== null && hi[3] !== null) {
                half = lo[3] + frac * (hi[3] - lo[3]);
            } else if (hi[3] !== null) {
                half = hi[3];
            }

            return {
                ring: Math.round(ring * 2) / 2,   // round to nearest 0.5
                area: Math.round(area),             // whole mm²
                half: half !== null ? Math.round(half * 2) / 2 : null,
                exact: false
            };
        }
    }
    return null;
}

// ── Render Kirklin card ──────────────────────────────────────
function renderKirklinCard(weight) {
    if (!weight || weight <= 0) return '';

    const k = lookupKirklin(weight);
    if (!k) return '';

    const halfRow = k.half !== null
        ? `<div class="kk-item kk-half">
               <div class="kk-label">Half Size</div>
               <div class="kk-value">${k.half}</div>
               <div class="kk-unit">mm</div>
           </div>`
        : `<div class="kk-item kk-half">
               <div class="kk-label">Half Size</div>
               <div class="kk-value">—</div>
               <div class="kk-unit">N/A</div>
           </div>`;

    return `
    <div class="result-card kk-card" id="card-kirklin-result" style="--card-accent: #06b6d4;">
        <div id="front-kirklin-result" class="card-front">
            <div class="card-header">
                <span class="card-icon">🫀</span>
                <div class="label">Kirklin Pulmonary Valve Ring — Min. Acceptable</div>
                <button class="ref-btn" onclick="toggleReference('kirklin-result')" title="Clinical References">?</button>
            </div>
            <div class="kk-source">Source: Kirklin 1975–76 · Weight-based lookup · Linear interpolation</div>

            <div class="kk-grid">
                <div class="kk-item kk-ring">
                    <div class="kk-label">Ring Diameter</div>
                    <div class="kk-value">${k.ring}</div>
                    <div class="kk-unit">mm</div>
                </div>
                <div class="kk-item kk-area">
                    <div class="kk-label">Cross-section Area</div>
                    <div class="kk-value">${k.area}</div>
                    <div class="kk-unit">mm²</div>
                </div>
                ${halfRow}
            </div>

            <div class="kk-note-box">
                <span class="kk-note-icon">⚠️</span>
                <span>Minimum acceptable diameter — any valve measuring below this requires transannular patch or alternative repair strategy. Verify intraoperatively.</span>
            </div>
        </div>
        <div id="back-kirklin-result" class="card-back">
            <div class="card-header">
                <span class="card-icon">🫀</span>
                <div class="label">Kirklin Pulmonary Valve Ring — Min. Acceptable</div>
                <button class="ref-btn" onclick="toggleReference('kirklin-result')" title="Back to Results">?</button>
            </div>
            <div class="ref-back-text">
                <div class="ref-back-title">Kirklin PA Ring Reference</div>
                <strong>Clinical Purpose</strong>
                <p>Determines minimum acceptable pulmonary valve ring diameter below which transannular patch or alternative repair is required.</p>
                <strong>Historical Source</strong>
                <p>Kirklin JW, 1975–1976. "Minimum Acceptable Pulmonary Valve Ring Diameter." Foundational reference in congenital heart surgery establishing weight-based norms for pediatric valve sizing.</p>
                <strong>Method</strong>
                <p>Weight-based lookup table with linear interpolation between published rows. Provides ring diameter (mm), cross-sectional area (mm²), and half-size measurements.</p>
                <strong>Clinical Application</strong>
                <p>Used during surgical planning to assess pulmonary valve competency and determine if transannular patch is necessary. All values verified intraoperatively.</p>
            </div>
        </div>
    </div>`;
}