/**
 * ═══════════════════════════════════════════════════════════
 *   PERFUSION PRO SUITE — Module: CPB Hematocrit Calculator
 *   Author: Zafeer ul Islam
 *   Version: 1.0
 * ═══════════════════════════════════════════════════════════
 *  Calculates patient blood volume, total circulating volume,
 *  predicted clear prime hematocrit, PRBC transfusion volume,
 *  isovolumetric hemodilution for polycythemia, anemia flags,
 *  extreme dilution alerts, and real-time CPB monitoring.
 * ═══════════════════════════════════════════════════════════
 */

const CPB_HCT_BV_FACTORS = {
    adult_male: { label: 'Adult Male (75 mL/kg)', factor: 75 },
    adult_female: { label: 'Adult Female (65 mL/kg)', factor: 65 },
    infant: { label: 'Infant / Child (80 mL/kg)', factor: 80 },
    neonate: { label: 'Term Neonate (85 mL/kg)', factor: 85 },
    premature: { label: 'Premature Neonate (95 mL/kg)', factor: 95 },
    custom: { label: 'Custom (User Defined)', factor: 80 }
};

/**
 * Helper to auto-select patient type category based on weight and age
 */
function cpbHctAutoSelectCategory(weightKg, ageYears) {
    if (weightKg && weightKg < 2.5) return 'premature';
    if (ageYears !== null && ageYears !== undefined) {
        if (ageYears === 0) return 'neonate';
        if (ageYears <= 2) return 'infant';
        return 'adult_male';
    }
    if (weightKg && weightKg <= 10) return 'infant';
    return 'adult_male';
}

/**
 * Core CPB Hematocrit Calculation Engine
 */
function calcCpbHct(inputs) {
    const weight = parseFloat(inputs.weight) || 0;
    const preHct = parseFloat(inputs.preHct) || 0;
    const primeVol = parseFloat(inputs.primeVol) || 0;
    const targetHct = parseFloat(inputs.targetHct) || 0;

    if (weight <= 0 || preHct <= 0 || primeVol <= 0 || targetHct <= 0) {
        return { valid: false, message: 'Please enter Weight, Pre-Op Hct, Prime Volume, and Target Hct to calculate.' };
    }

    const patientType = inputs.patientType || 'infant';
    let bvFactor = CPB_HCT_BV_FACTORS[patientType] ? CPB_HCT_BV_FACTORS[patientType].factor : 80;
    if (patientType === 'custom' && inputs.customBvFactor) {
        bvFactor = parseFloat(inputs.customBvFactor) || 80;
    }

    const donorHct = (parseFloat(inputs.donorHct) > 0) ? parseFloat(inputs.donorHct) : 70;
    const anesCrystalloid = parseFloat(inputs.anesCrystalloid) || 0;
    const cpCrystalloid = parseFloat(inputs.cpCrystalloid) || 0;
    const preHb = parseFloat(inputs.preHb) || (preHct / 3);

    // Initial Blood Volume (BV)
    let initialBv = weight * bvFactor;
    let initialRcv = initialBv * (preHct / 100);

    // Polycythemia Isovolume Removal logic
    const isIsovolumed = (preHct > 55 && inputs.isovolumeCheck);
    let isovolumeRemovedVol = 0;
    let isovolumeRbcRemoved = 0;
    let targetPreHctIsovol = parseFloat(inputs.isovolumeTargetHct) || 50;

    if (isIsovolumed && targetPreHctIsovol < preHct) {
        isovolumeRemovedVol = initialBv * ((preHct - targetPreHctIsovol) / preHct);
        isovolumeRbcRemoved = isovolumeRemovedVol * (preHct / 100);
    }

    // Effective Patient Blood Volume & RBC Volume after isovolume removal
    const effectiveBv = initialBv - isovolumeRemovedVol;
    const effectiveRcv = initialRcv - isovolumeRbcRemoved;

    // Total Circulating Volume (TCV)
    const tcv = effectiveBv + primeVol + anesCrystalloid + cpCrystalloid;

    // Predicted Clear Prime Hct on CPB
    const predictedClearPrimeHct = tcv > 0 ? (effectiveRcv / tcv) * 100 : 0;

    // Target RBC Volume needed on CPB
    const targetRcv = tcv * (targetHct / 100);
    const deficitRcv = targetRcv - effectiveRcv;

    // Donor PRBC Volume needed (mL)
    let prbcNeeded = deficitRcv > 0 ? (deficitRcv / (donorHct / 100)) : 0;
    const prbcUnits = prbcNeeded / 250; // ~250 mL per unit

    // Target Status
    const targetAchievedClearPrime = predictedClearPrimeHct >= targetHct;

    // Extreme Dilution Option B recalculation: PRBC needed in prime to hit 28% Hct
    const optionBTargetHct = Math.max(28, targetHct);
    const optionBRcvTarget = tcv * (optionBTargetHct / 100);
    const optionBDeficit = optionBRcvTarget - effectiveRcv;
    const optionBPrbcVol = optionBDeficit > 0 ? (optionBDeficit / (donorHct / 100)) : 0;

    // Real-Time CPB Monitoring
    let actualCpbHct = parseFloat(inputs.actualCpbHct);
    let realTimePrbcNeeded = null;
    if (!isNaN(actualCpbHct) && actualCpbHct > 0) {
        const actualRcv = tcv * (actualCpbHct / 100);
        const actualDeficit = targetRcv - actualRcv;
        realTimePrbcNeeded = actualDeficit > 0 ? (actualDeficit / (donorHct / 100)) : 0;
    }

    return {
        valid: true,
        weight,
        preHct,
        preHb,
        primeVol,
        targetHct,
        donorHct,
        anesCrystalloid,
        cpCrystalloid,
        patientType,
        bvFactor,
        initialBv,
        initialRcv,
        isIsovolumed,
        isovolumeRemovedVol,
        isovolumeRbcRemoved,
        targetPreHctIsovol,
        effectiveBv,
        effectiveRcv,
        tcv,
        predictedClearPrimeHct,
        targetRcv,
        deficitRcv,
        prbcNeeded,
        prbcUnits,
        targetAchievedClearPrime,
        isPolycythemic: preHct > 55,
        isAnemic: preHct < 25,
        isExtremeDilution: predictedClearPrimeHct < 20 || weight < 3.0 || initialBv < 300,
        optionBTargetHct,
        optionBPrbcVol,
        actualCpbHct: isNaN(actualCpbHct) ? null : actualCpbHct,
        realTimePrbcNeeded
    };
}

/**
 * Renders the HTML inside the Hct Calculator modal
 */
function renderCpbHctContent(initialWeight, initialAge) {
    const defaultType = cpbHctAutoSelectCategory(initialWeight, initialAge);

    return `
    <div class="cpb-hct-container">
        <!-- Modal Header -->
        <div class="cpb-hct-header">
            <div class="cpb-hct-badge">
                <span class="badge-dot" style="background:#ef4444;"></span>
                OR Decision Support Module
            </div>
            <h2>CPB Hematocrit Calculator</h2>
            <p class="cpb-hct-subtitle">Pediatric & Adult Perfusion Hemodilution, PRBC Requirements & Isovolume Management</p>
        </div>

        <div class="cpb-hct-grid">
            <!-- INPUT PANEL -->
            <div class="cpb-hct-card glass-panel">
                <div class="cpb-hct-section-title">
                    <span class="section-icon">📋</span> Required Patient & Circuit Inputs
                </div>

                <!-- Primary Required Fields -->
                <div class="cpb-input-row">
                    <div class="input-group">
                        <label for="hct-weight">Weight <span class="unit-tag">kg</span> <span class="required">✱</span></label>
                        <input type="number" id="hct-weight" step="0.1" min="0.5" max="150" placeholder="0.0" value="${initialWeight || ''}">
                    </div>
                    <div class="input-group">
                        <label for="hct-pre-hct">Pre-Op Hct <span class="unit-tag">%</span> <span class="required">✱</span></label>
                        <input type="number" id="hct-pre-hct" step="0.5" min="10" max="75" placeholder="e.g. 35">
                    </div>
                </div>

                <div class="cpb-input-row">
                    <div class="input-group">
                        <label for="hct-prime">Prime Volume <span class="unit-tag">mL</span> <span class="required">✱</span></label>
                        <input type="number" id="hct-prime" step="10" min="50" max="3000" placeholder="e.g. 350">
                    </div>
                    <div class="input-group">
                        <label for="hct-target-hct">Target Hct on CPB <span class="unit-tag">%</span> <span class="required">✱</span></label>
                        <input type="number" id="hct-target-hct" step="0.5" min="20" max="40" placeholder="e.g. 28">
                    </div>
                </div>

                <!-- Patient Blood Volume Category Selector -->
                <div class="input-group" style="margin-top:10px;">
                    <label for="hct-patient-type">Patient Category (BV Factor)</label>
                    <select id="hct-patient-type" onchange="hctToggleCustomBv();">
                        <option value="premature" ${defaultType === 'premature' ? 'selected' : ''}>Premature Neonate (95 mL/kg)</option>
                        <option value="neonate" ${defaultType === 'neonate' ? 'selected' : ''}>Term Neonate (85 mL/kg)</option>
                        <option value="infant" ${defaultType === 'infant' ? 'selected' : ''}>Infant / Child (80 mL/kg)</option>
                        <option value="adult_male" ${defaultType === 'adult_male' ? 'selected' : ''}>Adult Male (75 mL/kg)</option>
                        <option value="adult_female">Adult Female (65 mL/kg)</option>
                        <option value="custom">Custom (User Defined)</option>
                    </select>
                </div>

                <div class="input-group" id="hct-custom-bv-wrap" style="display:none; margin-top:8px;">
                    <label for="hct-custom-bv">Custom Blood Volume <span class="unit-tag">mL/kg</span></label>
                    <input type="number" id="hct-custom-bv" step="1" min="50" max="110" value="80">
                </div>

                <!-- Polycythemia Isovolume Option (Conditional Display) -->
                <div id="hct-polycythemia-box" class="hct-poly-box" style="display:none;">
                    <div class="hct-poly-title">⚠️ Polycythemia Alert (Pre-Op Hct > 55%)</div>
                    <label class="hct-checkbox-label">
                        <input type="checkbox" id="hct-isovolume-check">
                        <span>Patient will have isovolume removal before CPB — recalculate</span>
                    </label>
                    <div id="hct-isovolume-target-wrap" style="margin-top:8px; display:none;">
                        <label for="hct-isovolume-target">Target Pre-Op Hct after removal (%):</label>
                        <input type="number" id="hct-isovolume-target" step="1" min="40" max="55" value="50" style="width:90px; display:inline-block; margin-left:8px;">
                    </div>
                </div>

                <!-- Advanced / Optional Inputs Toggle -->
                <details class="hct-advanced-details" style="margin-top:14px;">
                    <summary class="hct-advanced-summary">⚙️ Secondary & Optional Parameters (Crystalloids, Donor Hct, Real-Time)</summary>
                    <div class="hct-advanced-body">
                        <div class="cpb-input-row">
                            <div class="input-group">
                                <label for="hct-donor-hct">Donor PRBC Hct <span class="unit-tag">%</span></label>
                                <input type="number" id="hct-donor-hct" step="1" min="50" max="85" value="70">
                            </div>
                            <div class="input-group">
                                <label for="hct-pre-hb">Pre-Op Hb <span class="unit-tag">g/dL</span></label>
                                <input type="number" id="hct-pre-hb" step="0.1" min="3" max="25" placeholder="Auto (~Hct/3)">
                            </div>
                        </div>

                        <div class="cpb-input-row">
                            <div class="input-group">
                                <label for="hct-anesth">Anesthesia Crystalloid <span class="unit-tag">mL</span></label>
                                <input type="number" id="hct-anesth" step="10" min="0" max="2000" placeholder="0">
                            </div>
                            <div class="input-group">
                                <label for="hct-cp">Cardioplegia Crystalloid <span class="unit-tag">mL</span></label>
                                <input type="number" id="hct-cp" step="10" min="0" max="2000" placeholder="0">
                            </div>
                        </div>

                        <div class="input-group" style="margin-top:8px;">
                            <label for="hct-actual-hct">Real-Time Actual CPB Hct <span class="unit-tag">% (mid-bypass)</span></label>
                            <input type="number" id="hct-actual-hct" step="0.5" min="10" max="45" placeholder="Enter mid-bypass lab Hct if re-evaluating">
                        </div>
                    </div>
                </details>

                <!-- Action Buttons: Calculate & Reset -->
                <div class="hct-action-btns" style="display:flex; gap:10px; margin-top:16px;">
                    <button type="button" onclick="hctUpdateCalc()" class="cpb-hct-calc-btn">
                        ⚡ Calculate Hct & PRBC Requirements
                    </button>
                    <button type="button" onclick="hctResetCalc()" class="cpb-hct-reset-btn">
                        ↺ Reset
                    </button>
                </div>
            </div>

            <!-- RESULTS PANEL -->
            <div class="cpb-hct-card glass-panel" id="hct-results-wrapper">
                <div class="empty-state" id="hct-empty-state">
                    <div class="empty-icon">🩸</div>
                    <p>Enter patient Weight, Pre-Op Hct, Prime Volume, and Target Hct to view predictions and PRBC calculations.</p>
                </div>

                <div id="hct-results-content" style="display:none;">
                    <!-- 1. QUICK SUMMARY BOX (TOP) -->
                    <div class="hct-summary-box">
                        <div class="hct-summary-title">Summary Quick Verification</div>
                        <div class="hct-summary-grid">
                            <div class="hct-sum-item">
                                <span class="hct-sum-lbl">Weight</span>
                                <span class="hct-sum-val" id="sum-weight">—</span>
                            </div>
                            <div class="hct-sum-item">
                                <span class="hct-sum-lbl">Blood Vol (BV)</span>
                                <span class="hct-sum-val" id="sum-bv">—</span>
                            </div>
                            <div class="hct-sum-item">
                                <span class="hct-sum-lbl">Pre-Op Hct</span>
                                <span class="hct-sum-val" id="sum-pre-hct">—</span>
                            </div>
                            <div class="hct-sum-item">
                                <span class="hct-sum-lbl">Prime Vol</span>
                                <span class="hct-sum-val" id="sum-prime">—</span>
                            </div>
                            <div class="hct-sum-item">
                                <span class="hct-sum-lbl">Total Vol (TCV)</span>
                                <span class="hct-sum-val" id="sum-tcv">—</span>
                            </div>
                            <div class="hct-sum-item hct-sum-highlight">
                                <span class="hct-sum-lbl">Predicted Clear Prime Hct</span>
                                <span class="hct-sum-val" id="sum-clear-hct">—</span>
                            </div>
                        </div>
                    </div>

                    <!-- 2. MOST IMPORTANT FACTORS (MAIN RESULTS) -->
                    <div class="hct-main-result-box">
                        <div class="hct-main-row">
                            <div class="hct-main-card">
                                <div class="hct-main-label">Predicted Hct on CPB</div>
                                <div class="hct-main-val" id="res-pred-hct">—</div>
                                <div class="hct-main-sub" id="res-pred-status">Clear Prime Result</div>
                            </div>
                            <div class="hct-main-card hct-main-card-prbc">
                                <div class="hct-main-label">PRBC Volume Needed</div>
                                <div class="hct-main-val" id="res-prbc-vol">—</div>
                                <div class="hct-main-sub" id="res-prbc-units">Donor Blood Requirement</div>
                            </div>
                        </div>

                        <div class="hct-target-status-badge" id="res-target-status-badge">
                            <!-- Populated dynamically -->
                        </div>
                    </div>

                    <!-- 3. WARNINGS & PROTOCOL NOTICES -->
                    <div id="hct-warnings-container"></div>

                    <!-- 4. DETAILED BREAKDOWN (COLLAPSIBLE) -->
                    <details class="hct-breakdown-details" open style="margin-top:12px;">
                        <summary class="hct-breakdown-summary">📊 Detailed Step-by-Step Calculation Breakdown</summary>
                        <div class="hct-breakdown-body" id="res-breakdown-body">
                            <!-- Populated dynamically -->
                        </div>
                    </details>
                </div>
            </div>
        </div>
    </div>
    `;
}

/**
 * Handle custom BV field toggle
 */
function hctToggleCustomBv() {
    const typeSelect = document.getElementById('hct-patient-type');
    const customWrap = document.getElementById('hct-custom-bv-wrap');
    if (typeSelect && customWrap) {
        customWrap.style.display = typeSelect.value === 'custom' ? 'block' : 'none';
    }
}

/**
 * Live reactive update handler for CPB Hct Calculator
 */
function hctUpdateCalc() {
    const weightInp = document.getElementById('hct-weight');
    const preHctInp = document.getElementById('hct-pre-hct');
    const primeInp = document.getElementById('hct-prime');
    const targetHctInp = document.getElementById('hct-target-hct');

    const emptyState = document.getElementById('hct-empty-state');
    const resultsContent = document.getElementById('hct-results-content');
    const polyBox = document.getElementById('hct-polycythemia-box');
    const isovolumeCheck = document.getElementById('hct-isovolume-check');
    const isovolumeTargetWrap = document.getElementById('hct-isovolume-target-wrap');

    if (!weightInp || !preHctInp || !primeInp || !targetHctInp || !emptyState || !resultsContent) return;

    const preHctVal = parseFloat(preHctInp.value) || 0;

    // Show/hide polycythemia box if pre-Hct > 55%
    if (polyBox) {
        if (preHctVal > 55) {
            polyBox.style.display = 'block';
            if (isovolumeTargetWrap && isovolumeCheck) {
                isovolumeTargetWrap.style.display = isovolumeCheck.checked ? 'block' : 'none';
            }
        } else {
            polyBox.style.display = 'none';
        }
    }

    const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
    const inputs = {
        weight: weightInp.value,
        preHct: preHctInp.value,
        primeVol: primeInp.value,
        targetHct: targetHctInp.value,
        patientType: getVal('hct-patient-type'),
        customBvFactor: getVal('hct-custom-bv'),
        donorHct: getVal('hct-donor-hct'),
        preHb: getVal('hct-pre-hb'),
        anesCrystalloid: getVal('hct-anesth'),
        cpCrystalloid: getVal('hct-cp'),
        isovolumeCheck: isovolumeCheck ? isovolumeCheck.checked : false,
        isovolumeTargetHct: getVal('hct-isovolume-target'),
        actualCpbHct: getVal('hct-actual-hct')
    };

    const res = calcCpbHct(inputs);

    if (!res.valid) {
        emptyState.style.display = 'block';
        resultsContent.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    resultsContent.style.display = 'block';

    // 1. Fill Summary Quick Verification Box
    document.getElementById('sum-weight').textContent = `${res.weight.toFixed(1)} kg`;
    document.getElementById('sum-bv').textContent = `${Math.round(res.effectiveBv)} mL`;
    document.getElementById('sum-pre-hct').textContent = `${res.preHct.toFixed(1)}%`;
    document.getElementById('sum-prime').textContent = `${Math.round(res.primeVol)} mL`;
    document.getElementById('sum-tcv').textContent = `${Math.round(res.tcv)} mL`;

    const clearHctEl = document.getElementById('sum-clear-hct');
    clearHctEl.textContent = `${res.predictedClearPrimeHct.toFixed(1)}%`;
    clearHctEl.style.color = res.predictedClearPrimeHct < 20 ? '#ef4444' : (res.predictedClearPrimeHct >= res.targetHct ? '#10b981' : '#f59e0b');

    // 2. Fill Main Results Cards
    document.getElementById('res-pred-hct').textContent = `${res.predictedClearPrimeHct.toFixed(1)}%`;
    document.getElementById('res-pred-status').textContent = res.predictedClearPrimeHct >= res.targetHct
        ? '✓ Exceeds Target without blood'
        : `Deficit: ${(res.targetHct - res.predictedClearPrimeHct).toFixed(1)}%`;

    const prbcValEl = document.getElementById('res-prbc-vol');
    const prbcUnitsEl = document.getElementById('res-prbc-units');

    if (res.prbcNeeded <= 0) {
        prbcValEl.textContent = '0 mL';
        prbcValEl.style.color = '#10b981';
        prbcUnitsEl.textContent = 'No Donor Blood Required';
    } else {
        prbcValEl.textContent = `${Math.round(res.prbcNeeded)} mL`;
        prbcValEl.style.color = '#ef4444';
        prbcUnitsEl.textContent = `~${res.prbcUnits.toFixed(1)} Units (at ${res.donorHct}% Donor Hct)`;
    }

    // Target Status Badge
    const badgeEl = document.getElementById('res-target-status-badge');
    if (res.prbcNeeded <= 0) {
        badgeEl.className = 'hct-target-status-badge hct-badge-success';
        badgeEl.innerHTML = `✅ <strong>TARGET ACHIEVED ON CLEAR PRIME:</strong> Predicted Hct (${res.predictedClearPrimeHct.toFixed(1)}%) ≥ Target (${res.targetHct.toFixed(1)}%). No PRBC required.`;
    } else {
        badgeEl.className = 'hct-target-status-badge hct-badge-warning';
        badgeEl.innerHTML = `🩸 <strong>PRBC TRANSFUSION REQUIRED:</strong> Clear prime Hct (${res.predictedClearPrimeHct.toFixed(1)}%) is below Target (${res.targetHct.toFixed(1)}%). Add <strong>${Math.round(res.prbcNeeded)} mL PRBC</strong> to circuit.`;
    }

    // 3. Render Dynamic Warnings
    const warnContainer = document.getElementById('hct-warnings-container');
    let warnHtml = '';

    // Polycythemia Warning
    if (res.isPolycythemic) {
        if (res.isIsovolumed) {
            warnHtml += `
            <div class="hct-alert-card hct-alert-info">
                <div class="hct-alert-title">⚡ Isovolumetric Hemodilution Recalculation Applied</div>
                <div class="hct-alert-text">
                    Recommended volume of patient blood to remove before CPB: <strong>${Math.round(res.isovolumeRemovedVol)} mL</strong> (to reduce Hct from ${res.preHct}% to ${res.targetPreHctIsovol}%).<br>
                    Recalculated Patient Blood Volume: <strong>${Math.round(res.effectiveBv)} mL</strong>.
                </div>
            </div>`;
        } else {
            warnHtml += `
            <div class="hct-alert-card hct-alert-warning">
                <div class="hct-alert-title">⚠️ Polycythemia Alert (Pre-Op Hct ${res.preHct}% > 55%)</div>
                <div class="hct-alert-text">
                    High initial hematocrit accepted for calculation. Isovolume removal before CPB may be performed if ordered by the surgical team. Check the Isovolume box above to simulate removal.
                </div>
            </div>`;
        }
    }

    // Severe Anemia Warning
    if (res.isAnemic) {
        warnHtml += `
        <div class="hct-alert-card hct-alert-warning">
            <div class="hct-alert-title">⚠️ Severe Anemia Alert (Pre-Op Hct ${res.preHct}% < 25%)</div>
            <div class="hct-alert-text">
                Low pre-op hematocrit detected. Hemofilter (CUF / MUF) may be required during bypass to manage fluid balance and concentrate red cells.<br>
                <em>Clinical Rule: Low pre-op Hct → Use hemofilter; High pre-op Hct → No hemofilter.</em>
            </div>
        </div>`;
    }

    // Extreme Dilution Warning (Clear Prime < 20% or small infant)
    if (res.isExtremeDilution) {
        warnHtml += `
        <div class="hct-alert-card hct-alert-danger">
            <div class="hct-alert-title">🚨 CRITICAL WARNING: Severe Hemodilution Expected</div>
            <div class="hct-alert-text">
                Predicted clear prime Hct is <strong>${res.predictedClearPrimeHct.toFixed(1)}%</strong> (&lt; 20%) or patient BV is small (${Math.round(res.initialBv)} mL). Select a management pathway:
                <div class="hct-options-grid">
                    <div class="hct-option-card">
                        <strong>Option A: Miniaturized Circuit</strong>
                        <p>Reduce prime volume (mini-tubing, vacuum-assisted venous drainage) to decrease total circulating volume.</p>
                    </div>
                    <div class="hct-option-card">
                        <strong>Option B: PRBC Prime Recalculation</strong>
                        <p>Prime circuit with PRBC: Add <strong>${Math.round(res.optionBPrbcVol)} mL PRBC</strong> to achieve target Hct ${res.optionBTargetHct}% in prime.</p>
                    </div>
                </div>
            </div>
        </div>`;
    }

    warnContainer.innerHTML = warnHtml;

    // 4. Detailed Breakdown Body
    const breakdownEl = document.getElementById('res-breakdown-body');
    let breakdownHtml = `
        <table class="hct-breakdown-table">
            <tr>
                <td>Patient Type & BV Factor:</td>
                <td><strong>${CPB_HCT_BV_FACTORS[res.patientType] ? CPB_HCT_BV_FACTORS[res.patientType].label : res.bvFactor + ' mL/kg'}</strong></td>
            </tr>
            <tr>
                <td>Initial Patient Blood Volume (BV):</td>
                <td><strong>${Math.round(res.initialBv)} mL</strong> (${res.weight} kg × ${res.bvFactor} mL/kg)</td>
            </tr>
            <tr>
                <td>Initial Red Cell Volume (RCV):</td>
                <td><strong>${Math.round(res.initialRcv)} mL</strong> (${res.preHct}% of BV)</td>
            </tr>
            ${res.isIsovolumed ? `
            <tr style="background:rgba(234, 88, 12, 0.08);">
                <td>Isovolume Removal Volume:</td>
                <td><strong>−${Math.round(res.isovolumeRemovedVol)} mL</strong> (Effective BV: ${Math.round(res.effectiveBv)} mL)</td>
            </tr>
            ` : ''}
            <tr>
                <td>Circuit Prime Volume:</td>
                <td><strong>${Math.round(res.primeVol)} mL</strong></td>
            </tr>
            ${(res.anesCrystalloid > 0 || res.cpCrystalloid > 0) ? `
            <tr>
                <td>Optional Crystalloids (Anesth + CP):</td>
                <td><strong>+${Math.round(res.anesCrystalloid + res.cpCrystalloid)} mL</strong> (Anesth: ${res.anesCrystalloid}mL, CP: ${res.cpCrystalloid}mL)</td>
            </tr>
            ` : ''}
            <tr style="border-top: 1px solid var(--border-light); font-weight:700;">
                <td>Total Circulating Volume (TCV):</td>
                <td><strong>${Math.round(res.tcv)} mL</strong></td>
            </tr>
            <tr>
                <td>Predicted Clear Prime Hct:</td>
                <td><strong>${res.predictedClearPrimeHct.toFixed(1)}%</strong></td>
            </tr>
            <tr>
                <td>Target RBC Volume needed on CPB:</td>
                <td><strong>${Math.round(res.targetRcv)} mL</strong> (${res.targetHct}% of TCV)</td>
            </tr>
            <tr>
                <td>Deficit RBC Volume:</td>
                <td><strong>${res.deficitRcv > 0 ? Math.round(res.deficitRcv) + ' mL' : '0 mL (No Deficit)'}</strong></td>
            </tr>
            <tr style="background:rgba(239, 68, 68, 0.08); font-weight:700;">
                <td>PRBC Volume Needed (${res.donorHct}% Donor Hct):</td>
                <td><strong style="color:#ef4444;">${Math.round(res.prbcNeeded)} mL</strong> (~${res.prbcUnits.toFixed(1)} Units)</td>
            </tr>
        </table>
    `;

    // Add Real-Time CPB section if entered
    if (res.actualCpbHct !== null) {
        breakdownHtml += `
            <div class="hct-realtime-box">
                <div class="hct-realtime-title">⏱️ Real-Time Mid-Bypass Monitoring</div>
                <div>Actual CPB Hct Reported: <strong>${res.actualCpbHct.toFixed(1)}%</strong> (Target: ${res.targetHct}%)</div>
                <div>Additional PRBC Required Mid-Bypass: <strong style="color:#ef4444; font-size:1.1rem;">${res.realTimePrbcNeeded > 0 ? Math.round(res.realTimePrbcNeeded) + ' mL' : '0 mL (Target Maintained)'}</strong></div>
            </div>
        `;
    }

    breakdownEl.innerHTML = breakdownHtml;
}
