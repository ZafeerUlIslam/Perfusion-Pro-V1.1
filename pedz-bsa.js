/**
 * ═══════════════════════════════════════════════════════════
 *   PEDZ — Body Surface Area Formulas Module
 * ═══════════════════════════════════════════════════════════
 */

function bsaDuBois(a, c) {
    if (!a || !c) return 0;
    var b = Math.pow(c, 0.425) * Math.pow(a, 0.725) * 0.007184;
    b *= 1000;
    b = Math.round(b);
    b /= 1000;
    return b;
}

function bsaHaycock(a, c) {
    if (!a || !c) return 0;
    var b = 0.024265 * Math.pow(a, 0.3964) * Math.pow(c, 0.5378);
    b *= 1000;
    b = Math.round(b);
    b /= 1000;
    return b;
}

function bsaMosteller(a, c) {
    if (!a || !c) return 0;
    var b = Math.sqrt((a * c) / 3600);
    b *= 1000;
    b = Math.round(b);
    b /= 1000;
    return b;
}

function bsaBoyd(a, c) {
    if (!a || !c) return 0;
    var weightGrams = c * 1000;
    var exp = 0.7285 - 0.0188 * (Math.log(weightGrams) / Math.LN10);
    var b = 0.0003207 * Math.pow(a, 0.3) * Math.pow(weightGrams, exp);
    b *= 1000;
    b = Math.round(b);
    b /= 1000;
    return b;
}
