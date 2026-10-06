/**
 * ══════════════════════════════════════════
 *  MODULE: Oxygenator Selection & Priming
 *  File:   modules/oxygenator.js
 *  Author: Zafeer ul Islam
 * ══════════════════════════════════════════
 *
 *  Weight-based oxygenator selection:
 *  ─────────────────────────────────────────
 *  < 9 kg         → BabyFX 05   (Total Prime: 350–450 mL)
 *  9 kg – 30 kg   → Trilly      (Total Prime: 550–600 mL)
 *  > 30 kg        → Skipper     (Total Prime: 1200–1400 mL)
 *
 *  Static Prime = manufacturer-specified dead volume (mL)
 *  Total Prime  = static prime + tubing volume (estimated range)
 */

function recommendOxygenator(weight) {
    if (!weight || weight <= 0) return null;

    let model, totalPrime, staticPrime;

    if (weight < 9) {
        model       = 'BabyFX 05';
        totalPrime  = '350 – 450';
        staticPrime = '~31';
    } else if (weight <= 30) {
        // Boundary FIX: weight === 9 now clearly goes to Trilly (>= 9)
        model       = 'Trilly';
        totalPrime  = '550 – 600';
        staticPrime = '~85';
    } else {
        model       = 'Skipper';
        totalPrime  = '1200 – 1400';
        staticPrime = '~255';
    }

    return { model, totalPrime, staticPrime };
}