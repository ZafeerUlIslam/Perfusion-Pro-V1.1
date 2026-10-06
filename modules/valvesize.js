/**
 * ═══════════════════════════════════════════════════════════
 *   PERFUSION PRO SUITE — Module: Valve Size Reference
 *   Author: Zafeer ul Islam
 *   Version: 1.0
 * ═══════════════════════════════════════════════════════════
 *
 *  Source: Kirklin / Barratt-Boyes normative valve table
 *  Input:  BSA (m²) — calculated via Mosteller formula
 *  Output: Mean diameter + normal range for MV, TV, AoV, PV
 *
 *  Method: Linear interpolation between published BSA rows.
 *  All values rounded to whole numbers for clinical use.
 * ═══════════════════════════════════════════════════════════
 */

// ── Published valve size table (exact from PDF) ──────────────
// [ BSA, MV_mean, MV_low, MV_high, TV_mean, TV_low, TV_high,
//         AoV_mean, AoV_low, AoV_high, PV_mean, PV_low, PV_high ]
const VALVE_TABLE = [
    [0.25, 11.4, 9.8,  13.0, 13.4, 11.8, 15.0, 7.2,  6.2,  8.2,  8.4,  7.3,  9.6 ],
    [0.30, 12.5, 10.9, 14.2, 14.9, 13.3, 16.5, 8.1,  7.1,  9.1,  9.3,  8.2,  10.5],
    [0.35, 13.5, 11.9, 15.2, 16.2, 14.5, 17.8, 8.8,  7.8,  9.8,  10.1, 8.9,  11.2],
    [0.40, 14.4, 12.7, 16.0, 17.3, 15.6, 18.9, 9.5,  8.5,  10.5, 10.7, 9.6,  11.9],
    [0.45, 15.1, 13.5, 16.7, 18.2, 16.6, 19.9, 10.1, 9.1,  11.1, 11.3, 10.2, 12.5],
    [0.50, 15.8, 14.1, 17.4, 19.1, 17.5, 20.7, 10.6, 9.6,  11.6, 11.9, 10.7, 13.0],
    [0.60, 16.9, 15.3, 18.6, 20.6, 19.0, 22.2, 11.4, 10.4, 12.5, 12.8, 11.6, 13.9],
    [0.70, 17.9, 16.3, 19.5, 21.9, 20.3, 23.5, 12.2, 11.2, 13.2, 13.5, 12.4, 14.7],
    [0.80, 18.7, 17.1, 20.4, 23.0, 21.4, 24.6, 12.8, 11.8, 13.8, 14.2, 13.0, 15.3],
    [0.90, 19.5, 17.8, 21.1, 24.0, 22.3, 25.6, 13.4, 12.4, 14.4, 14.8, 13.6, 15.9],
    [1.00, 20.1, 18.5, 21.8, 24.8, 23.2, 26.5, 13.9, 12.9, 14.9, 15.3, 14.1, 16.4],
    [1.20, 21.3, 19.7, 22.9, 26.3, 24.7, 28.0, 14.8, 13.8, 15.8, 16.2, 15.0, 17.4],
    [1.40, 22.3, 20.6, 23.9, 27.6, 26.0, 29.2, 15.6, 14.6, 16.6, 17.0, 15.8, 18.1],
    [1.60, 23.1, 21.5, 24.8, 28.7, 27.1, 30.3, 16.2, 15.2, 17.2, 17.6, 16.5, 18.8],
    [1.80, 23.9, 22.2, 25.5, 29.7, 28.1, 31.3, 16.8, 15.8, 17.8, 18.2, 17.1, 19.4],
    [2.00, 24.5, 22.9, 26.2, 30.6, 28.9, 32.3, 17.3, 16.3, 18.3, 18.7, 17.6, 19.9],
];

// ── Linear interpolation helper ──────────────────────────────
function interpolateValves(bsa) {
    const T = VALVE_TABLE;

    // Clamp to table limits
    if (bsa <= T[0][0])             return extractRow(T[0]);
    if (bsa >= T[T.length - 1][0]) return extractRow(T[T.length - 1]);

    // Exact match
    for (let i = 0; i < T.length; i++) {
        if (T[i][0] === bsa) return extractRow(T[i]);
    }

    // Interpolate
    for (let i = 0; i < T.length - 1; i++) {
        if (T[i][0] < bsa && bsa < T[i + 1][0]) {
            const lo   = T[i];
            const hi   = T[i + 1];
            const frac = (bsa - lo[0]) / (hi[0] - lo[0]);
            const lerp = (a, b) => Math.round(a + frac * (b - a));
            return {
                mv:  { mean: lerp(lo[1], hi[1]),  low: lerp(lo[2],  hi[2]),  high: lerp(lo[3],  hi[3])  },
                tv:  { mean: lerp(lo[4], hi[4]),  low: lerp(lo[5],  hi[5]),  high: lerp(lo[6],  hi[6])  },
                aov: { mean: lerp(lo[7], hi[7]),  low: lerp(lo[8],  hi[8]),  high: lerp(lo[9],  hi[9])  },
                pv:  { mean: lerp(lo[10],hi[10]), low: lerp(lo[11], hi[11]), high: lerp(lo[12], hi[12]) },
            };
        }
    }
    return null;
}

function extractRow(row) {
    return {
        mv:  { mean: Math.round(row[1]),  low: Math.round(row[2]),  high: Math.round(row[3])  },
        tv:  { mean: Math.round(row[4]),  low: Math.round(row[5]),  high: Math.round(row[6])  },
        aov: { mean: Math.round(row[7]),  low: Math.round(row[8]),  high: Math.round(row[9])  },
        pv:  { mean: Math.round(row[10]), low: Math.round(row[11]), high: Math.round(row[12]) },
    };
}

// ── Render Valve Size card ───────────────────────────────────
function renderValveSizeCard(weight, height) {
    if (!weight || weight <= 0 || !height || height <= 0) {
        return `
        <div class="result-card vs-card" style="--card-accent: #06b6d4;">
            <div class="card-header">
                <span class="card-icon">💠</span>
                <div class="label">Valve Size Reference (Kirklin / Barratt-Boyes)</div>
            </div>
            <div class="vs-notice">
                ⚠️ Height is required for BSA-based valve size calculation.<br>
                Please enter patient height to enable this module.
            </div>
        </div>`;
    }

    // Mosteller BSA (same formula used by rest of app)
    const bsa  = Math.sqrt(height * weight / 3600);
    const vals = interpolateValves(bsa);
    if (!vals) return '';

    const valves = [
        { name: 'Mitral Valve',    abbr: 'MV',  d: vals.mv,  color: 'vs-mv'  },
        { name: 'Tricuspid Valve', abbr: 'TV',  d: vals.tv,  color: 'vs-tv'  },
        { name: 'Aortic Valve',    abbr: 'AoV', d: vals.aov, color: 'vs-aov' },
        { name: 'Pulmonary Valve', abbr: 'PV',  d: vals.pv,  color: 'vs-pv'  },
    ];

    const rows = valves.map(v => `
        <div class="vs-row ${v.color}">
            <div class="vs-abbr">${v.abbr}</div>
            <div class="vs-name">${v.name}</div>
            <div class="vs-mean">${v.d.mean}<span class="vs-unit">mm</span></div>
            <div class="vs-range">${v.d.low}–${v.d.high}<span class="vs-unit">mm</span></div>
        </div>`).join('');

    return `
    <div class="result-card vs-card" id="card-valvesize-result" style="--card-accent: #06b6d4;">
        <div id="front-valvesize-result" class="card-front">
            <div class="card-header">
                <span class="card-icon">💠</span>
                <div class="label">Valve Size Reference — Kirklin / Barratt-Boyes</div>
                <button class="ref-btn" onclick="toggleReference('valvesize-result')" title="Clinical References">?</button>
            </div>
            <div class="vs-bsa-row">
                <span class="vs-bsa-lbl">BSA (Mosteller)</span>
                <span class="vs-bsa-val">${bsa.toFixed(2)} m²</span>
                <span class="vs-bsa-note">Interpolated from normative table</span>
            </div>

            <div class="vs-col-header">
                <span></span>
                <span class="vs-col-lbl">Valve</span>
                <span class="vs-col-lbl">Mean</span>
                <span class="vs-col-lbl">Normal Range</span>
            </div>

            ${rows}

            <div class="vs-footnote">
                Source: Kirklin / Barratt-Boyes · Values in mm · Normal range = published ±limits
            </div>
        </div>
        <div id="back-valvesize-result" class="card-back">
            <div class="card-header">
                <span class="card-icon">💠</span>
                <div class="label">Valve Size Reference — Kirklin / Barratt-Boyes</div>
                <button class="ref-btn" onclick="toggleReference('valvesize-result')" title="Back to Results">?</button>
            </div>
            <div class="ref-back-text">
                <div class="ref-back-title">Cardiac Valve Sizing</div>
                <strong>BSA-Based Normative Reference</strong>
                <p>Values interpolated from Kirklin & Barratt-Boyes cardiac anatomy tables based on patient BSA (m²).</p>
                <strong>Primary Source</strong>
                <p>Kirklin JW, Barratt-Boyes BG. Cardiac Surgery, 2nd Edition. Normative valve diameters with published ±limits for MV, TV, AoV, PV.</p>
                <strong>Clinical Application</strong>
                <p>Used for valve prosthesis selection in replacement surgery and to assess valve competency during surgical repair. Mean diameter guides minimum acceptable size; normal range provides clinical context.</p>
                <strong>Valves Included</strong>
                <p>Mitral (MV), Tricuspid (TV), Aortic (AoV), Pulmonary (PV). All values in millimeters.</p>
            </div>
        </div>
    </div>`;
}