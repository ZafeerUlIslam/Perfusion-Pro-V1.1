/**
 * ═══════════════════════════════════════════════════════════
 *   PERFUSION PRO SUITE — Module: Goal-Directed Perfusion (GDP)
 *   DO2i Calculation Engine & Hypothermic Q10 Scaling
 *   Author: Zafeer ul Islam
 *   Version: 1.3 — Multi-Tier DO2i Range, Hyperperfusion Alert & Scale
 * ═══════════════════════════════════════════════════════════
 */

class GDPEngine {
  constructor() {
    this.state = {
      targetDO2i: 280,
      bsa: null,
      isBsaManual: false,
      hb: null,
      pao2: null,
      sao2: 100,
      flow: null,
      tempC: 37.0,
      bsaMethod: 'Mosteller'
    };

    this.cacheDom();
    if (!this.dom.hCm || !this.dom.resetBtn) {
      return;
    }

    this.bindEvents();

    // Check pre-populated initial values
    if (this.dom.bsa && this.dom.bsa.value) {
      const initBsa = parseFloat(this.dom.bsa.value);
      if (!isNaN(initBsa) && initBsa > 0) {
        this.state.bsa = initBsa;
      }
    }
    if (this.dom.wKg && this.dom.wKg.value && (!this.state.bsa || (this.dom.hCm && this.dom.hCm.value))) {
      this.recomputeBSA();
    }
    if (this.dom.sao2 && this.dom.sao2.value) {
      this.state.sao2 = parseFloat(this.dom.sao2.value) || 100;
    }
    if (this.dom.hb && this.dom.hb.value) {
      this.state.hb = parseFloat(this.dom.hb.value) || null;
    }
    if (this.dom.pao2 && this.dom.pao2.value) {
      this.state.pao2 = parseFloat(this.dom.pao2.value) || null;
    }
    if (this.dom.flow && this.dom.flow.value) {
      this.state.flow = parseFloat(this.dom.flow.value) || null;
    }

    this.syncTargetUI(false);
    this.calculate();
  }

  cacheDom() {
    this.dom = {
      // Targets
      target260: document.getElementById('target-260'),
      target280: document.getElementById('target-280'),
      target300: document.getElementById('target-300'),
      target360: document.getElementById('target-360'),
      targetCustom: document.getElementById('target-custom'),
      targetCustomPill: document.getElementById('target-custom-pill'),
      targetButtons: document.querySelectorAll('#target-pill-row button'),

      // Inputs
      hCm: document.getElementById('h_cm'),
      wKg: document.getElementById('w_kg'),
      bsa: document.getElementById('bsa'),
      bsaMethod: document.getElementById('bsa-method'),
      bsaHint: document.getElementById('bsa-hint'),
      hb: document.getElementById('hb'),
      pao2: document.getElementById('pao2'),
      sao2: document.getElementById('sao2'),
      flow: document.getElementById('flow'),
      warning: document.getElementById('gdp-warning'),
      resetBtn: document.getElementById('do2i-reset'),

      // Temperature controls
      tempC: document.getElementById('gdp-temp-c'),
      tempSlider: document.getElementById('gdp-temp-slider'),
      tempDisplay: document.getElementById('gdp-temp-display'),
      vo2Fraction: document.getElementById('gdp-vo2-fraction'),
      tempPresets: document.querySelectorAll('[data-gdp-temp-preset]'),

      // Output elements
      cao2Hidden: document.getElementById('cao2'),
      cao2Result: document.getElementById('cao2-result'),
      requiredFlow: document.getElementById('required-flow'),
      tempReferenceFlow: document.getElementById('temp-reference-flow'),
      correctedFlowLabel: document.getElementById('corrected-flow-label'),
      normothermiaFlow: document.getElementById('normothermia-flow'),
      normothermiaDo2Floor: document.getElementById('normothermia-do2-floor'),
      correctedRowLabel: document.getElementById('corrected-row-label'),
      correctedFlowTable: document.getElementById('corrected-flow-table'),
      correctedDo2Floor: document.getElementById('corrected-do2-floor'),
      currentDo2i: document.getElementById('current-do2i'),
      statusText: document.getElementById('gdp-status-text'),
      statusDetail: document.getElementById('gdp-status-detail'),
      adequacyBar: document.getElementById('gdp-adequacy-bar'),

      // Reference scale labels
      scaleLow: document.getElementById('gdp-scale-low'),
      scaleBorder: document.getElementById('gdp-scale-border'),
      scaleOptimal: document.getElementById('gdp-scale-optimal'),
      scaleHigh: document.getElementById('gdp-scale-high')
    };
  }

  bindEvents() {
    if (!this.dom.targetButtons || !this.dom.hCm) return;

    // Target Selection
    this.dom.targetButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.state.targetDO2i = parseFloat(btn.dataset.value);
        if (this.dom.targetCustom) this.dom.targetCustom.value = '';
        this.syncTargetUI(false);
        this.calculate();
      });
    });

    if (this.dom.targetCustom) {
      this.dom.targetCustom.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val) && val > 0) {
          this.state.targetDO2i = val;
          this.syncTargetUI(true);
          this.calculate();
        }
      });
    }

    // BSA Auto-computation listeners
    const triggerBsaCalc = () => {
      if (!this.state.isBsaManual) {
        this.recomputeBSA();
        this.calculate();
      }
    };
    if (this.dom.hCm) this.dom.hCm.addEventListener('input', triggerBsaCalc);
    if (this.dom.wKg) this.dom.wKg.addEventListener('input', triggerBsaCalc);
    if (this.dom.bsaMethod) {
      this.dom.bsaMethod.addEventListener('change', (e) => {
        this.state.bsaMethod = e.target.value;
        this.state.isBsaManual = false;
        this.recomputeBSA();
        this.calculate();
      });
    }

    if (this.dom.bsa) {
      this.dom.bsa.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val) && val > 0) {
          this.state.bsa = val;
          this.state.isBsaManual = true;
          if (this.dom.bsaHint) this.dom.bsaHint.textContent = 'manual';
          this.calculate();
        } else if (e.target.value.trim() === '') {
          this.state.isBsaManual = false;
          this.recomputeBSA();
          this.calculate();
        }
      });
    }

    // Patient blood gas & flow inputs
    ['hb', 'pao2', 'sao2', 'flow'].forEach(id => {
      if (this.dom[id]) {
        this.dom[id].addEventListener('input', () => {
          const val = parseFloat(this.dom[id].value);
          this.state[id] = !isNaN(val) ? val : null;
          this.calculate();
        });
      }
    });

    // Temperature synchronization
    const handleTempChange = (val) => {
      const clamped = Math.min(37, Math.max(20, parseFloat(val) || 37));
      this.state.tempC = clamped;
      if (this.dom.tempC) this.dom.tempC.value = clamped.toFixed(1);
      if (this.dom.tempSlider) this.dom.tempSlider.value = clamped;
      if (this.dom.tempDisplay) this.dom.tempDisplay.textContent = `${clamped.toFixed(1)}°C`;
      this.calculate();
    };

    if (this.dom.tempC) {
      this.dom.tempC.addEventListener('input', (e) => handleTempChange(e.target.value));
    }
    if (this.dom.tempSlider) {
      this.dom.tempSlider.addEventListener('input', (e) => handleTempChange(e.target.value));
    }
    if (this.dom.tempPresets) {
      this.dom.tempPresets.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          handleTempChange(btn.dataset.gdpTempPreset);
        });
      });
    }

    // Reset button
    if (this.dom.resetBtn) {
      this.dom.resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.reset();
      });
    }
  }

  recomputeBSA() {
    const h = parseFloat(this.dom.hCm ? this.dom.hCm.value : '');
    const w = parseFloat(this.dom.wKg ? this.dom.wKg.value : '');

    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
      if (!this.state.isBsaManual) {
        if (this.state.bsa && (!h || h <= 0) && w > 0) {
          if (this.dom.bsaHint) this.dom.bsaHint.textContent = 'pre-filled';
          return;
        }
        this.state.bsa = null;
        if (this.dom.bsa) this.dom.bsa.value = '';
        if (this.dom.bsaHint) this.dom.bsaHint.textContent = 'auto-calc';
      }
      return;
    }

    let bsa = 0;
    switch (this.state.bsaMethod) {
      case 'DuBois':
        bsa = 0.007184 * Math.pow(h, 0.725) * Math.pow(w, 0.425);
        break;
      case 'Haycock':
        bsa = 0.024265 * Math.pow(h, 0.3964) * Math.pow(w, 0.5378);
        break;
      case 'Boyd': {
        const wtGrams = w * 1000;
        const exp = 0.7285 - 0.0188 * Math.log10(wtGrams);
        bsa = 0.0003207 * Math.pow(h, 0.3) * Math.pow(wtGrams, exp);
        break;
      }
      case 'Mosteller':
      default:
        bsa = Math.sqrt((h * w) / 3600);
        break;
    }

    this.state.bsa = parseFloat(bsa.toFixed(2));
    if (this.dom.bsa) this.dom.bsa.value = this.state.bsa.toFixed(2);
    if (this.dom.bsaHint) this.dom.bsaHint.textContent = 'auto-calc';
  }

  syncTargetUI(isCustom = false) {
    if (!this.dom.targetButtons) return;

    this.dom.targetButtons.forEach(btn => {
      const isSelected = !isCustom && parseFloat(btn.dataset.value) === this.state.targetDO2i;
      btn.classList.toggle('active', isSelected);
      btn.classList.toggle('gdp-target-active', isSelected);
    });

    if (this.dom.targetCustomPill) {
      this.dom.targetCustomPill.classList.toggle('active', isCustom);
      this.dom.targetCustomPill.classList.toggle('ring-2', isCustom);
    }
  }

  calculate() {
    const { hb, pao2, sao2, bsa, flow, targetDO2i, tempC } = this.state;

    // Validate essential fields
    const hasRequired = hb > 0 && pao2 > 0 && sao2 > 0 && bsa > 0;
    if (!hasRequired) {
      if (this.dom.warning) this.dom.warning.classList.remove('hidden');
      this.clearOutputs();
      return;
    }
    if (this.dom.warning) this.dom.warning.classList.add('hidden');

    // 1. Calculate Arterial Oxygen Content (CaO2)
    const sao2Fraction = sao2 / 100;
    const cao2 = (1.34 * hb * sao2Fraction) + (0.0031 * pao2);
    if (this.dom.cao2Hidden) this.dom.cao2Hidden.value = cao2.toFixed(2);
    if (this.dom.cao2Result) {
      this.dom.cao2Result.innerHTML = `${cao2.toFixed(2)} <span class="gdp-unit-span">mL/dL</span>`;
    }

    // 2. Calculate Required Pump Flow (Normothermia)
    // Formula: (Target DO2i * BSA) / (CaO2 * 10)
    const reqFlowNormo = (targetDO2i * bsa) / (cao2 * 10);
    if (this.dom.requiredFlow) {
      this.dom.requiredFlow.innerHTML = `${reqFlowNormo.toFixed(2)} <span class="gdp-unit-span">L/min</span>`;
    }
    if (this.dom.normothermiaFlow) {
      this.dom.normothermiaFlow.textContent = `${reqFlowNormo.toFixed(2)} L/min`;
    }
    if (this.dom.normothermiaDo2Floor) {
      this.dom.normothermiaDo2Floor.textContent = `${Math.round(targetDO2i)} mL/min/m²`;
    }

    // 3. Calculate Hypothermic Q10 Scaling (Q10 = 2.2)
    const vo2Fraction = Math.pow(2.2, (tempC - 37) / 10);
    const correctedFlow = reqFlowNormo * vo2Fraction;
    const correctedDO2iFloor = targetDO2i * vo2Fraction;

    // Dynamic Reference Ranges adjusted for Temperature & Metabolic rate
    const floorVal = Math.round(correctedDO2iFloor);
    const lowBoundary = Math.round(floorVal * 0.90);
    const optimalTop = Math.round(floorVal * 1.35);

    if (this.dom.scaleLow) this.dom.scaleLow.textContent = `< ${lowBoundary}`;
    if (this.dom.scaleBorder) this.dom.scaleBorder.textContent = `${lowBoundary}–${floorVal}`;
    if (this.dom.scaleOptimal) this.dom.scaleOptimal.textContent = `${floorVal}–${optimalTop}`;
    if (this.dom.scaleHigh) this.dom.scaleHigh.textContent = `> ${optimalTop}`;

    if (this.dom.vo2Fraction) {
      this.dom.vo2Fraction.textContent = `${Math.round(vo2Fraction * 100)}%`;
    }
    if (this.dom.correctedFlowLabel) {
      this.dom.correctedFlowLabel.textContent = `Corrected flow (${tempC.toFixed(1)}°C)`;
    }
    if (this.dom.tempReferenceFlow) {
      this.dom.tempReferenceFlow.innerHTML = `${correctedFlow.toFixed(2)} <span class="gdp-unit-span">L/min</span>`;
    }
    if (this.dom.correctedRowLabel) {
      this.dom.correctedRowLabel.textContent = `${tempC.toFixed(1)}°C corrected`;
    }
    if (this.dom.correctedFlowTable) {
      this.dom.correctedFlowTable.textContent = `${correctedFlow.toFixed(2)} L/min`;
    }
    if (this.dom.correctedDo2Floor) {
      this.dom.correctedDo2Floor.textContent = `${floorVal} mL/min/m²`;
    }

    // 4. Evaluate Current Flow Delivery & Clinical 4-Tier Range
    if (flow && flow > 0) {
      const currentDO2i = (flow / bsa) * cao2 * 10;
      if (this.dom.currentDo2i) {
        this.dom.currentDo2i.innerHTML = `${Math.round(currentDO2i).toLocaleString()} <span class="gdp-unit-span">mL/min/m²</span>`;
      }

      const ratio = currentDO2i / correctedDO2iFloor;

      // Scale visual meter: ratio 1.0 (target) is at ~55% of track width
      // ratio 0.9 is at ~40%, ratio 1.35 is at ~75%, ratio >= 1.6 is at 100%
      let meterPercent = 0;
      if (ratio < 0.9) {
        meterPercent = Math.max(5, (ratio / 0.9) * 35);
      } else if (ratio <= 1.0) {
        meterPercent = 35 + ((ratio - 0.9) / 0.1) * 20;
      } else if (ratio <= 1.35) {
        meterPercent = 55 + ((ratio - 1.0) / 0.35) * 22;
      } else {
        meterPercent = Math.min(100, 77 + ((ratio - 1.35) / 0.65) * 23);
      }

      if (this.dom.adequacyBar) {
        this.dom.adequacyBar.style.width = `${meterPercent}%`;
      }

      // Check for Unphysiological Flow or Extreme Hyperperfusion
      const isExtremeFlow = flow > 8.5;
      const isExtremeDO2i = ratio > 1.6 || currentDO2i > (optimalTop * 1.3);

      if (isExtremeDO2i || isExtremeFlow) {
        // TIER 5: EXCESSIVE / HYPERPERFUSION WARNING
        if (this.dom.statusText) {
          this.dom.statusText.textContent = isExtremeFlow ? '⚠️ Extreme Flow / Hyperperfusion' : '⚠️ Excessive / High DO₂i';
          this.dom.statusText.className = 'gdp-status-badge gdp-status-excessive';
        }
        if (this.dom.statusDetail) {
          const flowWarning = isExtremeFlow ? `
            <div style="background:#fee2e2; border:1px solid #f87171; border-radius:6px; padding:4px 8px; margin-bottom:6px; font-weight:700; color:#b91c1c;">
              🚨 Caution: Entered pump flow (${flow.toLocaleString()} L/min) exceeds standard CPB pump & cannula rating (typically max 7.0–8.0 L/min for adults).
            </div>
          ` : '';

          this.dom.statusDetail.innerHTML = `
            <div class="gdp-high-alert-box">
              <div class="gdp-high-alert-title">⚠️ High DO₂i / Hyperperfusion Warning</div>
              ${flowWarning}
              <div class="gdp-high-alert-msg">
                Current delivery (<strong>${Math.round(currentDO2i).toLocaleString()} mL/min/m²</strong>) is <strong>${Math.round((ratio - 1) * 100).toLocaleString()}% above optimal</strong> (Safe target: ${floorVal}–${optimalTop} mL/min/m²).
              </div>
              <div class="gdp-high-alert-risks">
                <strong>Documented Clinical Risks of Excessive Delivery & High Flow:</strong>
                <ul>
                  <li><strong>Cerebral Hyperperfusion:</strong> Overwhelms cerebral autoregulation, increasing microvascular hydrostatic stress, blood-brain barrier disruption, and post-CPB delirium.</li>
                  <li><strong>Shear Hemolysis & Hemoglobinuria:</strong> Excess pump flow/RPM generates severe red cell shear stress, causing plasma free hemoglobin and nephrotoxic pigment nephropathy.</li>
                  <li><strong>ROS Oxidative Stress:</strong> Supraphysiologic oxygen delivery promotes reactive oxygen species (ROS), lipid peroxidation, and systemic inflammatory response (SIRS).</li>
                </ul>
              </div>
              <div class="gdp-high-alert-action">
                🎯 <strong>Recommended Action:</strong> Titrate pump flow down towards <strong>${correctedFlow.toFixed(2)} L/min</strong> to maintain DO₂i within the optimal green band (${floorVal}–${optimalTop} mL/min/m²).
              </div>
            </div>
          `;
        }
        if (this.dom.adequacyBar) {
          this.dom.adequacyBar.className = 'gdp-meter-fill gdp-fill-excessive';
        }
      } else if (ratio > 1.35) {
        // TIER 4: ELEVATED SUPPLY
        if (this.dom.statusText) {
          this.dom.statusText.textContent = 'Elevated Supply';
          this.dom.statusText.className = 'gdp-status-badge gdp-status-elevated';
        }
        if (this.dom.statusDetail) {
          this.dom.statusDetail.innerHTML = `
            <div style="font-size:0.75rem; color:#0369a1; line-height:1.4;">
              <strong>ℹ️ Above Standard Target:</strong> DO₂i (${Math.round(currentDO2i)} mL/min/m²) exceeds the optimal metabolic window (${floorVal}–${optimalTop} mL/min/m²).
              Consider titrating pump flow closer to <strong>${correctedFlow.toFixed(2)} L/min</strong> to avoid unnecessary circuit shear stress.
            </div>
          `;
        }
        if (this.dom.adequacyBar) {
          this.dom.adequacyBar.className = 'gdp-meter-fill gdp-fill-elevated';
        }
      } else if (ratio >= 1.0) {
        // TIER 3: OPTIMAL / ADEQUATE SUPPLY
        if (this.dom.statusText) {
          this.dom.statusText.textContent = 'Optimal Supply';
          this.dom.statusText.className = 'gdp-status-badge gdp-status-ok';
        }
        if (this.dom.statusDetail) {
          this.dom.statusDetail.innerHTML = `
            <div style="font-size:0.75rem; color:#065f46; line-height:1.4;">
              <strong>✓ Optimal Delivery:</strong> DO₂i is within the evidence-based protective zone (${floorVal}–${optimalTop} mL/min/m²), preventing acute kidney injury (AKI) without hyperperfusion risks.
            </div>
          `;
        }
        if (this.dom.adequacyBar) {
          this.dom.adequacyBar.className = 'gdp-meter-fill gdp-fill-ok';
        }
      } else if (ratio >= 0.90) {
        // TIER 2: BORDERLINE SUPPLY
        if (this.dom.statusText) {
          this.dom.statusText.textContent = 'Borderline Low';
          this.dom.statusText.className = 'gdp-status-badge gdp-status-warn';
        }
        if (this.dom.statusDetail) {
          this.dom.statusDetail.innerHTML = `
            <div style="font-size:0.75rem; color:#92400e; line-height:1.4;">
              <strong>⚠️ Borderline Low:</strong> Within 10% below safety floor (${floorVal} mL/min/m²). Closely monitor SvO₂ (≥70%), arterial lactate, and consider minor flow increase.
            </div>
          `;
        }
        if (this.dom.adequacyBar) {
          this.dom.adequacyBar.className = 'gdp-meter-fill gdp-fill-warn';
        }
      } else {
        // TIER 1: CRITICAL LOW (HYPOPERFUSION)
        if (this.dom.statusText) {
          this.dom.statusText.textContent = 'Critical Low';
          this.dom.statusText.className = 'gdp-status-badge gdp-status-danger';
        }
        if (this.dom.statusDetail) {
          this.dom.statusDetail.innerHTML = `
            <div style="font-size:0.75rem; color:#991b1b; line-height:1.4;">
              <strong>⚠️ Hypoperfusion Warning:</strong> DO₂i is below the critical aerobic floor (${floorVal} mL/min/m²). High risk of anaerobic metabolism, hyperlactatemia, and post-CPB AKI. Increase pump flow to at least <strong>${correctedFlow.toFixed(2)} L/min</strong> or consider transfusing PRBC to increase Hb.
            </div>
          `;
        }
        if (this.dom.adequacyBar) {
          this.dom.adequacyBar.className = 'gdp-meter-fill gdp-fill-danger';
        }
      }
    } else {
      if (this.dom.currentDo2i) this.dom.currentDo2i.textContent = '—';
      if (this.dom.statusText) {
        this.dom.statusText.textContent = 'Awaiting Flow';
        this.dom.statusText.className = 'gdp-status-badge gdp-status-neutral';
      }
      if (this.dom.statusDetail) {
        this.dom.statusDetail.textContent = 'Enter current pump flow to evaluate real-time DO₂i adequacy.';
      }
      if (this.dom.adequacyBar) {
        this.dom.adequacyBar.style.width = '0%';
        this.dom.adequacyBar.className = 'gdp-meter-fill gdp-fill-neutral';
      }
    }
  }

  clearOutputs() {
    if (this.dom.cao2Result) this.dom.cao2Result.textContent = '—';
    if (this.dom.requiredFlow) this.dom.requiredFlow.textContent = '—';
    if (this.dom.tempReferenceFlow) this.dom.tempReferenceFlow.textContent = '—';
    if (this.dom.normothermiaFlow) this.dom.normothermiaFlow.textContent = '—';
    if (this.dom.normothermiaDo2Floor) this.dom.normothermiaDo2Floor.textContent = '—';
    if (this.dom.correctedFlowTable) this.dom.correctedFlowTable.textContent = '—';
    if (this.dom.correctedDo2Floor) this.dom.correctedDo2Floor.textContent = '—';
    if (this.dom.currentDo2i) this.dom.currentDo2i.textContent = '—';
    if (this.dom.statusText) {
      this.dom.statusText.textContent = 'Awaiting Flow';
      this.dom.statusText.className = 'gdp-status-badge gdp-status-neutral';
    }
    if (this.dom.statusDetail) {
      this.dom.statusDetail.textContent = 'Enter current pump flow to evaluate real-time DO₂i adequacy.';
    }
    if (this.dom.adequacyBar) {
      this.dom.adequacyBar.style.width = '0%';
      this.dom.adequacyBar.className = 'gdp-meter-fill gdp-fill-neutral';
    }
  }

  reset() {
    this.state = {
      targetDO2i: 280,
      bsa: null,
      isBsaManual: false,
      hb: null,
      pao2: null,
      sao2: 100,
      flow: null,
      tempC: 37.0,
      bsaMethod: 'Mosteller'
    };

    ['hCm', 'wKg', 'bsa', 'hb', 'pao2', 'flow'].forEach(k => {
      if (this.dom[k]) this.dom[k].value = '';
    });
    if (this.dom.sao2) this.dom.sao2.value = '100';
    if (this.dom.targetCustom) this.dom.targetCustom.value = '';
    if (this.dom.bsaMethod) this.dom.bsaMethod.value = 'Mosteller';
    if (this.dom.tempC) this.dom.tempC.value = '37';
    if (this.dom.tempSlider) this.dom.tempSlider.value = '37';
    if (this.dom.tempDisplay) this.dom.tempDisplay.textContent = '37.0°C';
    if (this.dom.vo2Fraction) this.dom.vo2Fraction.textContent = '100%';
    if (this.dom.bsaHint) this.dom.bsaHint.textContent = 'auto-calc';

    this.syncTargetUI(false);
    this.clearOutputs();
    if (this.dom.warning) this.dom.warning.classList.add('hidden');
  }
}

/**
 * Toggles the single master reference flip card
 */
function toggleGdpReference() {
  const card = document.getElementById('card-gdp-result');
  const refBtn = document.getElementById('gdp-header-ref-btn');
  if (!card) return;

  card.classList.toggle('flipped');
  const isFlipped = card.classList.contains('flipped');

  if (refBtn) {
    refBtn.title = isFlipped ? 'Back to Calculator' : 'Clinical References & Evidence';
    refBtn.classList.toggle('active', isFlipped);
    refBtn.style.background = isFlipped ? '#0284c7' : 'rgba(2, 132, 199, 0.1)';
    refBtn.style.color = isFlipped ? '#ffffff' : '#0284c7';
  }
}

/**
 * Generates the complete clinical HTML interface for the GDP Modal
 */
function renderGdpContent(initialWeight = '', initialHeight = '', initialBsa = '') {
  return `
    <div class="gdp-container">
        <!-- Self-contained Modal Styles to Guarantee Solid Rendering & Clean Layout -->
        <style>
          #gdp-modal {
            align-items: flex-start !important;
            justify-content: center !important;
            padding: 24px 16px 60px !important;
            overflow-y: auto !important;
          }
          #gdp-modal .modal-content {
            background: transparent !important;
            box-shadow: none !important;
            border: none !important;
            max-width: 980px !important;
            width: 100% !important;
            margin: 0 auto !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          #gdp-modal .modal-close {
            top: 18px !important;
            right: 18px !important;
            z-index: 20 !important;
            background: #ffffff !important;
            border: 1px solid #cbd5e1 !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
          }
          .gdp-container {
            background: #ffffff !important;
            border-radius: 16px !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: 0 25px 60px -12px rgba(15, 23, 42, 0.4) !important;
            padding: 22px 24px 28px !important;
            color: #111827 !important;
            font-family: var(--font-body, 'IBM Plex Sans', sans-serif) !important;
            position: relative !important;
          }
          .gdp-modal-topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 14px;
            padding-bottom: 12px;
            border-bottom: 1px solid #e2e8f0;
            padding-right: 50px;
          }
          .gdp-modal-title-group {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .gdp-icon-badge {
            width: 38px;
            height: 38px;
            border-radius: 10px;
            background: #e0f2fe;
            border: 1px solid #bae6fd;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.3rem;
            flex-shrink: 0;
          }
          .gdp-modal-h2 {
            font-family: var(--font-display, 'Sora', sans-serif) !important;
            font-size: 1.3rem !important;
            font-weight: 800 !important;
            color: #0f172a !important;
            margin: 0 !important;
          }
          .gdp-modal-sub {
            font-size: 0.78rem !important;
            color: #64748b !important;
            margin: 2px 0 0 0 !important;
            font-weight: 500 !important;
          }
          .gdp-top-actions {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .gdp-single-ref-btn {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 28px !important;
            height: 28px !important;
            border-radius: 50% !important;
            background: rgba(2, 132, 199, 0.1) !important;
            border: 1.5px solid rgba(2, 132, 199, 0.35) !important;
            color: #0284c7 !important;
            font-family: var(--font-body) !important;
            font-weight: 800 !important;
            font-size: 0.85rem !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
          }
          .gdp-single-ref-btn:hover {
            background: #0284c7 !important;
            color: #ffffff !important;
            transform: scale(1.08) !important;
          }
          .gdp-target-panel {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 12px 14px;
            margin-bottom: 16px;
          }
          .gdp-target-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .gdp-target-title {
            font-family: var(--font-display, 'Sora', sans-serif);
            font-size: 0.78rem;
            font-weight: 700;
            color: #334155;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .gdp-target-guide {
            font-size: 0.72rem;
            color: #64748b;
            font-weight: 500;
          }
          .gdp-target-pill-row {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            align-items: stretch !important;
            gap: 8px !important;
          }
          .gdp-target-btn {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            min-height: 40px !important;
            padding: 8px 10px !important;
            border-radius: 8px !important;
            font-family: var(--font-body, 'IBM Plex Sans', sans-serif) !important;
            font-size: 0.8rem !important;
            font-weight: 700 !important;
            text-align: center !important;
            line-height: 1.25 !important;
            border: 1.5px solid #cbd5e1 !important;
            background: #ffffff !important;
            color: #334155 !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
            outline: none !important;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
          }
          .gdp-target-btn:hover {
            border-color: #0284c7 !important;
            color: #0284c7 !important;
            background: #f0f9ff !important;
          }
          .gdp-target-btn.active,
          .gdp-target-btn.gdp-target-active {
            background: #0284c7 !important;
            color: #ffffff !important;
            border-color: #0284c7 !important;
            box-shadow: 0 2px 8px rgba(2, 132, 199, 0.35) !important;
            transform: translateY(-1px) !important;
          }
          .gdp-custom-pill {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 8px !important;
            background: #ffffff !important;
            border: 1.5px solid #cbd5e1 !important;
            border-radius: 8px !important;
            padding: 6px 12px !important;
            min-height: 40px !important;
            grid-column: span 2 !important;
            transition: all 0.2s ease !important;
          }
          .gdp-custom-pill.active {
            border-color: #0284c7 !important;
            box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.25) !important;
          }
          .gdp-custom-pill input {
            width: 58px !important;
            max-width: 58px !important;
            border: none !important;
            background: transparent !important;
            font-family: var(--font-mono, 'IBM Plex Mono', monospace) !important;
            font-size: 0.85rem !important;
            font-weight: 700 !important;
            color: #0284c7 !important;
            outline: none !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          .gdp-grid-2col {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 16px !important;
          }
          @media (max-width: 780px) {
            .gdp-grid-2col {
              grid-template-columns: 1fr !important;
            }
          }
          .gdp-card-box {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
          }
          .gdp-box-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 8px;
            margin-bottom: 12px;
          }
          .gdp-box-title {
            font-family: var(--font-display, 'Sora', sans-serif);
            font-size: 0.8rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.07em;
            color: #334155;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .gdp-alert-box {
            background: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 0.74rem;
            font-weight: 600;
            color: #b45309;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .gdp-alert-box.hidden {
            display: none !important;
          }
          .gdp-input-grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 10px;
          }
          .gdp-input-grid-3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 8px;
            margin-bottom: 10px;
          }
          @media (max-width: 480px) {
            .gdp-input-grid-3 {
              grid-template-columns: 1fr;
            }
          }
          .gdp-temp-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 12px;
            margin-top: 14px;
          }
          .gdp-temp-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 6px;
          }
          .gdp-temp-val-display {
            font-family: var(--font-mono, 'IBM Plex Mono', monospace);
            font-size: 1rem;
            font-weight: 700;
            color: #0284c7;
          }
          .gdp-vo2-pill {
            font-size: 0.72rem;
            font-weight: 700;
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
            color: #059669;
            padding: 2px 8px;
            border-radius: 6px;
          }
          .gdp-temp-slider-wrap input[type="range"] {
            width: 100%;
            height: 6px;
            background: #cbd5e1;
            border-radius: 99px;
            outline: none;
            -webkit-appearance: none;
            cursor: pointer;
            margin: 8px 0;
          }
          .gdp-temp-slider-wrap input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #0284c7;
            border: 2px solid #ffffff;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
            cursor: pointer;
          }
          .gdp-temp-preset-row {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin-top: 6px;
          }
          .gdp-temp-preset-btn {
            background: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 3px 8px;
            font-size: 0.7rem;
            font-weight: 600;
            color: #475569;
            cursor: pointer;
            transition: all 0.15s ease;
          }
          .gdp-temp-preset-btn:hover {
            background: #e0f2fe;
            border-color: #7dd3fc;
            color: #0369a1;
          }
          .gdp-metric-trio {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 8px;
            margin-bottom: 12px;
          }
          @media (max-width: 600px) {
            .gdp-metric-trio {
              grid-template-columns: 1fr;
            }
          }
          .gdp-mcard {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 10px;
          }
          .gdp-mcard-normo {
            background: rgba(2, 132, 199, 0.05);
            border-color: #bae6fd;
          }
          .gdp-mcard-corrected {
            background: rgba(16, 185, 129, 0.05);
            border-color: #a7f3d0;
          }
          .gdp-mlabel {
            font-size: 0.68rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748b;
            margin-bottom: 4px;
          }
          .gdp-mval {
            font-family: var(--font-mono, 'IBM Plex Mono', monospace);
            font-size: 1.25rem;
            font-weight: 700;
            color: #0f172a;
          }
          .gdp-unit-span {
            font-family: var(--font-body, 'IBM Plex Sans', sans-serif);
            font-size: 0.72rem;
            font-weight: 400;
            color: #64748b;
          }
          .gdp-msub {
            font-size: 0.68rem;
            color: #64748b;
            margin-top: 3px;
            line-height: 1.35;
          }

          /* ── Adequacy Panel & Clinical Reference Range Scale ── */
          .gdp-adequacy-panel {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 14px;
            margin-bottom: 14px;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
          }
          .gdp-status-badge {
            font-size: 0.75rem;
            font-weight: 700;
            padding: 4px 12px;
            border-radius: 99px;
            display: inline-block;
          }
          .gdp-status-ok { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
          .gdp-status-warn { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
          .gdp-status-danger { background: #fef2f2; color: #dc2626; border: 1px solid #fca5a5; }
          .gdp-status-elevated { background: #f0f9ff; color: #0284c7; border: 1px solid #bae6fd; }
          .gdp-status-excessive { background: #fdf2f8; color: #be185d; border: 1.5px solid #f472b6; animation: gdpPulseAlert 2s infinite; }
          @keyframes gdpPulseAlert {
            0% { box-shadow: 0 0 0 0 rgba(190, 24, 93, 0.3); }
            70% { box-shadow: 0 0 0 8px rgba(190, 24, 93, 0); }
            100% { box-shadow: 0 0 0 0 rgba(190, 24, 93, 0); }
          }
          .gdp-status-neutral { background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; }

          /* 4-Zone Reference Scale Guide */
          .gdp-scale-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.68rem;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748b;
            margin: 10px 0 4px;
          }
          .gdp-scale-grid {
            display: grid;
            grid-template-columns: 1.5fr 1fr 1.6fr 1.4fr;
            gap: 2px;
            margin-bottom: 6px;
            border-radius: 6px;
            overflow: hidden;
            font-size: 0.68rem;
            text-align: center;
            font-weight: 600;
          }
          .gdp-scale-seg {
            padding: 3px 2px;
          }
          .gdp-scale-seg.seg-low { background: #fee2e2; color: #991b1b; }
          .gdp-scale-seg.seg-border { background: #fef3c7; color: #92400e; }
          .gdp-scale-seg.seg-optimal { background: #d1fae5; color: #065f46; font-weight: 700; }
          .gdp-scale-seg.seg-high { background: #fce7f3; color: #9d174d; }

          .gdp-meter-bg {
            width: 100%;
            height: 10px;
            background: #e2e8f0;
            border-radius: 9999px;
            overflow: hidden;
            margin: 6px 0 8px;
            position: relative;
          }
          .gdp-meter-fill {
            height: 100%;
            border-radius: 9999px;
            transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease;
          }
          .gdp-fill-ok { background: #10b981; }
          .gdp-fill-warn { background: #f59e0b; }
          .gdp-fill-danger { background: #ef4444; }
          .gdp-fill-elevated { background: #0284c7; }
          .gdp-fill-excessive { background: linear-gradient(90deg, #ec4899, #be185d); }
          .gdp-fill-neutral { background: #94a3b8; }

          /* High DO2i Warning Box */
          .gdp-high-alert-box {
            background: #fff1f2;
            border: 1.5px solid #fecdd3;
            border-radius: 8px;
            padding: 10px 12px;
            margin-top: 6px;
            font-size: 0.74rem;
            color: #9f1239;
            line-height: 1.45;
          }
          .gdp-high-alert-title {
            font-weight: 800;
            font-size: 0.8rem;
            color: #be185d;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .gdp-high-alert-risks {
            margin: 6px 0;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 6px;
            padding: 6px 10px;
          }
          .gdp-high-alert-risks ul {
            margin: 4px 0 0 16px;
            padding: 0;
          }
          .gdp-high-alert-risks li {
            margin-bottom: 2px;
          }
          .gdp-high-alert-action {
            margin-top: 6px;
            font-weight: 700;
            color: #be185d;
          }

          .gdp-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.78rem;
          }
          .gdp-table th, .gdp-table td {
            padding: 6px 10px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
          }
          .gdp-table th {
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748b;
            background: #f8fafc;
          }
          .gdp-table tr.gdp-highlight-tr {
            background: rgba(16, 185, 129, 0.07);
          }
          .gdp-back-card-body {
            background: #ffffff;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            padding: 20px;
          }
          .gdp-back-btn {
            background: #e0f2fe;
            border: 1px solid #bae6fd;
            color: #0284c7;
            font-weight: 700;
            font-size: 0.8rem;
            padding: 6px 14px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
          }
          .gdp-back-btn:hover {
            background: #0284c7;
            color: #ffffff;
          }
        </style>

        <!-- Top Header Bar with Single Reference Button & Close Button in Corner -->
        <div class="gdp-modal-topbar">
            <div class="gdp-modal-title-group">
                <div class="gdp-icon-badge">🎯</div>
                <div>
                    <h2 class="gdp-modal-h2">Goal-Directed Perfusion (GDP) DO₂i Engine</h2>
                    <p class="gdp-modal-sub">Oxygen Delivery Index, Hypothermic Q₁₀ Scaling & Real-Time Flow Optimization</p>
                </div>
            </div>
            <div class="gdp-top-actions">
                <!-- SINGLE Master Reference Button in Corner -->
                <button type="button" id="gdp-header-ref-btn" class="gdp-single-ref-btn" onclick="toggleGdpReference()" title="Clinical References & Evidence">?</button>
            </div>
        </div>

        <!-- Target DO2i Selection Row -->
        <div class="gdp-target-panel">
            <div class="gdp-target-header">
                <div class="gdp-target-title">
                    <span>🎯</span> Target DO₂i Safety Floor
                </div>
                <div class="gdp-target-guide">
                    Ranucci Floor: ≥280 mL/min/m² (AKI prevention) · De Somer: 260 mL/min/m² (Min)
                </div>
            </div>
            <div class="gdp-target-pill-row" id="target-pill-row">
                <button type="button" id="target-260" class="gdp-target-btn" data-value="260">260 mL/min/m² (De Somer)</button>
                <button type="button" id="target-280" class="gdp-target-btn active" data-value="280">280 mL/min/m² (Standard Ranucci)</button>
                <button type="button" id="target-300" class="gdp-target-btn" data-value="300">300 mL/min/m² (Conservative)</button>
                <button type="button" id="target-360" class="gdp-target-btn" data-value="360">360 mL/min/m² (High Demand)</button>
                <div class="gdp-custom-pill" id="target-custom-pill">
                    <span style="font-size:0.75rem; font-weight:700; color:#475569;">Custom:</span>
                    <input type="number" id="target-custom" placeholder="280" min="150" max="500" step="5">
                </div>
            </div>
        </div>

        <!-- Flip-Card Architecture with Single Reference Option -->
        <div class="result-card" id="card-gdp-result" style="--card-accent: #0284c7;">
            <!-- CARD FRONT: Live Interactive Dashboard with Relative Formula Hints -->
            <div id="front-gdp-result" class="card-front">
                <div class="gdp-grid-2col">
                    <!-- LEFT COLUMN: PARAMETERS -->
                    <div class="gdp-card-box">
                        <div class="gdp-box-header">
                            <span class="gdp-box-title">📋 Patient & Circuit Parameters</span>
                        </div>

                        <!-- Missing Fields Alert Box -->
                        <div id="gdp-warning" class="gdp-alert-box hidden">
                            <span>⚠️</span> Enter Height & Weight (or Manual BSA), Hemoglobin, PaO₂, and SaO₂ to calculate delivery.
                        </div>

                        <!-- Height & Weight -->
                        <div class="gdp-input-grid-2">
                            <div class="input-group">
                                <label for="h_cm">Height <span class="unit-tag">cm</span> <span class="optional-tag">optional</span></label>
                                <input type="number" id="h_cm" step="0.1" min="20" max="220" placeholder="0.0" value="${initialHeight || ''}">
                            </div>
                            <div class="input-group">
                                <label for="w_kg">Weight <span class="unit-tag">kg</span> <span class="required">✱</span></label>
                                <input type="number" id="w_kg" step="0.1" min="0.5" max="150" placeholder="0.0" value="${initialWeight || ''}">
                            </div>
                        </div>

                        <!-- BSA & Method -->
                        <div class="gdp-input-grid-2">
                            <div class="input-group">
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
                                    <label for="bsa" style="margin-bottom:0;">BSA <span class="unit-tag">m²</span> <span class="required">✱</span></label>
                                    <span id="bsa-hint" class="gdp-hint-tag">${initialBsa ? 'pre-filled' : 'auto-calc'}</span>
                                </div>
                                <input type="number" id="bsa" step="0.01" min="0.1" max="3.5" placeholder="Auto / Manual" value="${initialBsa || ''}">
                            </div>
                            <div class="input-group">
                                <label for="bsa-method">BSA Formula</label>
                                <select id="bsa-method">
                                    <option value="Mosteller" selected>Mosteller (Default)</option>
                                    <option value="DuBois">DuBois</option>
                                    <option value="Haycock">Haycock</option>
                                    <option value="Boyd">Boyd</option>
                                </select>
                            </div>
                        </div>

                        <!-- Blood Gas Inputs -->
                        <div style="font-family:var(--font-display, 'Sora'); font-size:0.75rem; font-weight:700; text-transform:uppercase; color:#475569; margin: 12px 0 8px;">
                            🩸 Blood Gas & Oxygenation
                        </div>
                        <div class="gdp-input-grid-3">
                            <div class="input-group">
                                <label for="hb">Hemoglobin <span class="unit-tag">g/dL</span> <span class="required">✱</span></label>
                                <input type="number" id="hb" step="0.1" min="3" max="25" placeholder="e.g. 10.0">
                            </div>
                            <div class="input-group">
                                <label for="pao2">PaO₂ <span class="unit-tag">mmHg</span> <span class="required">✱</span></label>
                                <input type="number" id="pao2" step="1" min="30" max="600" placeholder="e.g. 180">
                            </div>
                            <div class="input-group">
                                <label for="sao2">SaO₂ <span class="unit-tag">%</span> <span class="required">✱</span></label>
                                <input type="number" id="sao2" step="0.1" min="70" max="100" value="100">
                            </div>
                        </div>

                        <!-- Current Pump Flow Input -->
                        <div class="input-group" style="margin-top: 6px;">
                            <label for="flow">Current CPB Pump Flow <span class="unit-tag">L/min</span> <span class="optional-tag">Real-Time Evaluation</span></label>
                            <input type="number" id="flow" step="0.05" min="0.1" max="15" placeholder="Enter pump flow to evaluate DO₂i">
                        </div>

                        <!-- Temperature Controls -->
                        <div class="gdp-temp-box">
                            <div class="gdp-temp-row">
                                <span style="font-size:0.75rem; font-weight:700; color:#334155;">Patient Core Temperature:</span>
                                <span id="gdp-temp-display" class="gdp-temp-val-display">37.0°C</span>
                                <span class="gdp-vo2-pill">Metabolic VO₂: <strong id="gdp-vo2-fraction">100%</strong></span>
                            </div>

                            <div class="gdp-temp-slider-wrap">
                                <input type="range" id="gdp-temp-slider" min="20" max="37" step="0.5" value="37">
                            </div>

                            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                                <div style="display:flex; align-items:center; gap:6px; font-size:0.74rem; font-weight:600; color:#475569;">
                                    <label for="gdp-temp-c" style="margin:0;">Manual (°C):</label>
                                    <input type="number" id="gdp-temp-c" min="20" max="37" step="0.1" value="37.0" style="width:60px; padding:3px 6px; font-weight:700; text-align:center;">
                                </div>
                                <div class="gdp-temp-preset-row">
                                    <button type="button" class="gdp-temp-preset-btn" data-gdp-temp-preset="37">37°C Normo</button>
                                    <button type="button" class="gdp-temp-preset-btn" data-gdp-temp-preset="34">34°C Tepid</button>
                                    <button type="button" class="gdp-temp-preset-btn" data-gdp-temp-preset="32">32°C Mild</button>
                                    <button type="button" class="gdp-temp-preset-btn" data-gdp-temp-preset="28">28°C Mod</button>
                                    <button type="button" class="gdp-temp-preset-btn" data-gdp-temp-preset="24">24°C Deep</button>
                                    <button type="button" class="gdp-temp-preset-btn" data-gdp-temp-preset="20">20°C Profound</button>
                                </div>
                            </div>
                        </div>

                        <!-- Reset Button -->
                        <div style="margin-top: 14px;">
                            <button type="button" id="do2i-reset" class="gdp-reset-btn">↺ Reset All GDP Parameters</button>
                        </div>
                    </div>

                    <!-- RIGHT COLUMN: DELIVERY DASHBOARD -->
                    <div class="gdp-card-box">
                        <div class="gdp-box-header">
                            <span class="gdp-box-title">📊 Delivery Dashboard & Adequacy</span>
                        </div>

                        <input type="hidden" id="cao2">

                        <!-- Primary Metrics Trio with Contextual Relative Formulas -->
                        <div class="gdp-metric-trio">
                            <div class="gdp-mcard">
                                <div class="gdp-mlabel">Arterial Oxygen (CaO₂)</div>
                                <div class="gdp-mval" id="cao2-result">— <span class="gdp-unit-span">mL/dL</span></div>
                                <div class="gdp-msub"><strong>Formula:</strong> (1.34 × Hb × SaO₂) + (0.0031 × PaO₂)</div>
                            </div>
                            <div class="gdp-mcard gdp-mcard-normo">
                                <div class="gdp-mlabel">Required Flow (37°C)</div>
                                <div class="gdp-mval" id="required-flow">— <span class="gdp-unit-span">L/min</span></div>
                                <div class="gdp-msub"><strong>Formula:</strong> (Target DO₂i × BSA) ÷ (CaO₂ × 10)</div>
                            </div>
                            <div class="gdp-mcard gdp-mcard-corrected">
                                <div class="gdp-mlabel" id="corrected-flow-label">Corrected flow (37.0°C)</div>
                                <div class="gdp-mval" id="temp-reference-flow">— <span class="gdp-unit-span">L/min</span></div>
                                <div class="gdp-msub"><strong>Q₁₀ Scaling:</strong> Base Flow × 2.2^((Temp − 37)/10)</div>
                            </div>
                        </div>

                        <!-- Real-Time Delivery Adequacy Box with 4-Tier Reference Range Scale -->
                        <div class="gdp-adequacy-panel">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                <div>
                                    <div style="font-size:0.74rem; font-weight:700; text-transform:uppercase; color:#64748b;">Current Delivery Index (DO₂i)</div>
                                    <div style="font-family:var(--font-mono, 'IBM Plex Mono'); font-size:1.4rem; font-weight:700; color:#0f172a; margin-top:2px;" id="current-do2i">— <span class="gdp-unit-span">mL/min/m²</span></div>
                                </div>
                                <div id="gdp-status-text" class="gdp-status-badge gdp-status-neutral">Awaiting Flow</div>
                            </div>

                            <!-- 4-Tier Reference Range Scale Guide -->
                            <div class="gdp-scale-header">
                                <span>Clinical Perfusion Range (mL/min/m²):</span>
                                <span style="font-weight:500;">Q₁₀ Temp-Adjusted</span>
                            </div>
                            <div class="gdp-scale-grid">
                                <div class="gdp-scale-seg seg-low">Low (<span id="gdp-scale-low">&lt; 252</span>)</div>
                                <div class="gdp-scale-seg seg-border">Border (<span id="gdp-scale-border">252–280</span>)</div>
                                <div class="gdp-scale-seg seg-optimal">Optimal (<span id="gdp-scale-optimal">280–378</span>)</div>
                                <div class="gdp-scale-seg seg-high">High (<span id="gdp-scale-high">&gt; 378</span>)</div>
                            </div>

                            <div class="gdp-meter-bg">
                                <div id="gdp-adequacy-bar" class="gdp-meter-fill gdp-fill-neutral" style="width: 0%;"></div>
                            </div>

                            <div id="gdp-status-detail" style="font-size:0.74rem; color:#475569; margin-top:4px;">
                                Enter current pump flow to evaluate real-time DO₂i adequacy.
                            </div>
                        </div>

                        <!-- Targets Comparison Table -->
                        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:10px; margin-bottom:12px;">
                            <div style="font-size:0.73rem; font-weight:700; text-transform:uppercase; color:#475569; margin-bottom:6px;">⚡ Perfusion Targets Breakdown</div>
                            <table class="gdp-table">
                                <thead>
                                    <tr>
                                        <th>Condition</th>
                                        <th>Required Pump Flow</th>
                                        <th>DO₂i Safety Floor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Normothermia (37°C)</strong></td>
                                        <td id="normothermia-flow">—</td>
                                        <td id="normothermia-do2-floor">—</td>
                                    </tr>
                                    <tr class="gdp-highlight-tr">
                                        <td><strong id="corrected-row-label">37.0°C corrected</strong></td>
                                        <td id="corrected-flow-table">—</td>
                                        <td id="corrected-do2-floor">—</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CARD BACK: Single Full Clinical Evidence & Literature Reference Card -->
            <div id="back-gdp-result" class="card-back gdp-back-card-body">
                <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; padding-bottom:8px; border-bottom:1px solid #e2e8f0;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span class="card-icon" style="font-size:1.3rem;">🎯</span>
                        <div class="label" style="font-size:0.95rem; font-weight:800;">Goal-Directed Perfusion (GDP) Clinical Reference</div>
                    </div>
                    <button type="button" class="gdp-back-btn" onclick="toggleGdpReference()">↺ Return to Calculator</button>
                </div>
                <div class="ref-back-text">
                    <div class="ref-back-title" style="font-size:0.9rem; font-weight:700; color:#0284c7; margin-bottom:8px;">Clinical Evidence, Formulas & Rationale</div>
                    
                    <strong>1. Oxygen Delivery Index (DO₂i):</strong>
                    <div class="ref-back-formula" style="background:#f1f5f9; padding:6px 10px; border-radius:6px; font-family:var(--font-mono); margin:4px 0 8px;">
                        DO₂i (mL/min/m²) = (Pump Flow L/min ÷ BSA m²) × CaO₂ (mL/dL) × 10
                    </div>
                    
                    <strong>2. Arterial Oxygen Content (CaO₂):</strong>
                    <div class="ref-back-formula" style="background:#f1f5f9; padding:6px 10px; border-radius:6px; font-family:var(--font-mono); margin:4px 0 8px;">
                        CaO₂ = (1.34 × Hb × SaO₂/100) + (0.0031 × PaO₂)
                    </div>
                    
                    <strong>3. Hypothermic Metabolic Temperature Scaling (Q₁₀ = 2.2):</strong>
                    <div class="ref-back-formula" style="background:#f1f5f9; padding:6px 10px; border-radius:6px; font-family:var(--font-mono); margin:4px 0 8px;">
                        VO₂ Fraction = 2.2^((Patient Temp °C − 37) ÷ 10)<br>
                        Corrected Flow = Normothermic Required Flow × VO₂ Fraction
                    </div>
                    
                    <strong>4. Evidence-Based Clinical Range (Low vs Optimal vs High):</strong>
                    <p>• <strong>Hypoperfusion Range (&lt; 260–280 mL/min/m²):</strong> Critical anaerobic threshold. Causes tissue oxygen debt, peak hyperlactatemia, and markedly increases Acute Kidney Injury (AKI) incidence.</p>
                    <p>• <strong>Optimal Protective Window (280–380 mL/min/m²):</strong> Fully satisfies aerobic cellular oxygen requirements while avoiding hyperperfusion barotrauma.</p>
                    <p>• <strong>Excessive Delivery / Hyperperfusion Risks (&gt; 400–450 mL/min/m² or &gt;135% Target):</strong></p>
                    <ul style="margin: 4px 0 8px 18px;">
                        <li><strong>Cerebral Hyperperfusion:</strong> Exceeds cerebral autoregulatory capacity, causing microvascular hydrostatic stress, blood-brain barrier leakage, and postoperative delirium.</li>
                        <li><strong>Shear Hemolysis & Hemoglobinuria:</strong> Driving supraphysiologic pump flow generates high mechanical shear, lysing red blood cells and creating free hemoglobin that causes pigment nephropathy (tubular AKI).</li>
                        <li><strong>Oxidative Stress:</strong> Massive oxygen delivery drives excessive reactive oxygen species (ROS) formation, cellular lipid peroxidation, and systemic inflammatory cascade.</li>
                    </ul>

                    <strong>Primary Clinical Literature Sources:</strong>
                    <p>• Ranucci M, et al. Oxygen delivery during cardiopulmonary bypass and acute renal failure. <em>Ann Thorac Surg</em>. 2005;80(6):2213-2220.</p>
                    <p>• De Somer F, et al. Oxygen delivery during cardiopulmonary bypass: is there a critical threshold? <em>Ann Thorac Surg</em>. 2011;92(1):128-133.</p>
                    <p>• Ranucci M. Goal-directed perfusion to reduce acute kidney injury. <em>Perfusion</em>. 2018;33(1_suppl):60-64.</p>
                    <p>• Mosteller RD. Simplified calculation of body surface area. <em>N Engl J Med</em>. 1987;317(17):1098.</p>
                </div>
            </div>
        </div>
    </div>
  `;
}

// Attach to window object for global module availability
window.GDPEngine = GDPEngine;
window.renderGdpContent = renderGdpContent;
window.toggleGdpReference = toggleGdpReference;
