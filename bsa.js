/**
 * ══════════════════════════════════════════
 *  MODULE: Body Surface Area (BSA)
 *  File:   modules/bsa.js
 *  Author: Zafeer ul Islam
 * ══════════════════════════════════════════
 *
 *  Formulas used:
 *  1. Mosteller  → √(Height × Weight / 3600)   [when height is provided]
 *  2. Weight-only → (Weight × 4 + 7) / (Weight + 90)   [fallback]
 *
 *  FIX: height being cleared now correctly switches formula
 *       and the hint updates live in the UI.
 */

function calculateBSA(weight, height) {
    if (!weight || weight <= 0) return null;

    let bsa;

    if (height && height > 0) {
        // Mosteller Formula (more accurate — uses both height & weight)
        bsa = Math.sqrt((height * weight) / 3600);
    } else {
        // Weight-only Simplified Formula (no height needed)
        bsa = (weight * 4 + 7) / (weight + 90);
    }

    return bsa.toFixed(2);
}