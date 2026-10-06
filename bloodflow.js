/**
 * ══════════════════════════════════════════
 *  MODULE: Target Blood Flow
 *  File:   modules/bloodflow.js
 *  Author: Zafeer ul Islam
 * ══════════════════════════════════════════
 *
 *  Age-adjusted Cardiac Index (CI) values:
 *  ─────────────────────────────────────────
 *  Age 0–2 years   → CI = 3.0 L/min/m²
 *  Age 2–4 years   → CI = 2.8 L/min/m²
 *  Age 4–6 years   → CI = 2.6 L/min/m²
 *  Age > 6 years   → CI = 2.4 L/min/m²
 *
 *  Formula: Flow (L/min) = BSA × CI
 *
 *  FIX: age = 0 (neonates) now correctly handled.
 *       Previously age=0 was falsy and returned null.
 *       Now we check for null explicitly.
 */

function calculateBloodFlow(bsa, ageYears) {
    // FIX: use explicit null check — age 0 is valid (neonate)
    if (!bsa || bsa <= 0 || ageYears === null || ageYears === undefined) return null;

    let ci;

    if (ageYears >= 0 && ageYears <= 2) {
        ci = 3.0;  // Neonate / Infant
    } else if (ageYears > 2 && ageYears <= 4) {
        ci = 2.8;  // Toddler
    } else if (ageYears > 4 && ageYears <= 6) {
        ci = 2.6;  // Young child
    } else {
        ci = 2.4;  // Older child / adult range
    }

    const flow = (parseFloat(bsa) * ci).toFixed(2);
    return { flow, ci };
}