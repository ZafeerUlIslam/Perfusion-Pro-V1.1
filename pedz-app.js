/**
 * ═══════════════════════════════════════════════════════════
 *   PEDZ — Echocardiography Z-Score Application Engine
 * ═══════════════════════════════════════════════════════════
 */

(function (global) {
  'use strict';

  if (typeof window.lang === 'undefined') {
    window.lang = { convert: function (str) { return str; } };
  }

  if (typeof setStrings === 'function') {
    setStrings();
  }

  const REFERENCE_DATA = {
    "Kampmann et al. 2000": {
      title: "Normal values of M-mode echocardiography in children",
      authors: "Kampmann W, Wiethoff CM, Wenzel A, et al.",
      journal: "Eur J Pediatr. 2000;159(3):185-192",
      pubmed: "http://www.ncbi.nlm.nih.gov/pubmed/10664166",
      population: "500 healthy pediatric subjects (1 day to 18 years, BSA 0.25 - 2.0 m²)",
      method: "Mean ± SD regression based on Body Surface Area (DuBois) and Weight for neonates (<4 kg)."
    },
    "Gautier et al. 2010": {
      title: "Aortic root dimensions in healthy children and adolescents",
      authors: "Gautier M, et al.",
      journal: "J Am Soc Echocardiogr. 2010;23(3):270-277",
      pubmed: "http://www.ncbi.nlm.nih.gov/pubmed/20211339",
      population: "Healthy pediatric cohort evaluated for aortic root diameter norms",
      method: "Natural logarithm regression: ln(y) = a + b * ln(BSA). Stratified by gender."
    },
    "Peterssen et al. 2008": {
      title: "Normal values for aortic and pulmonary artery diameters in children",
      authors: "Peterssen O, et al.",
      journal: "Cardiol Young. 2008;18(2):142-149",
      pubmed: "http://www.ncbi.nlm.nih.gov/pubmed/18406572",
      population: "Pediatric normal cohort for thoracic aortic arch and pulmonary artery branches",
      method: "Mean-SD polynomial coefficient model: y = a0 + a1*BSA + a2*BSA² + a3*BSA³."
    },
    "Zilberman et al. 2008": {
      title: "Standardized Z-scores for pediatric cardiac valve diameters",
      authors: "Zilberman MV, et al.",
      journal: "J Am Soc Echocardiogr. 2008;19(1):47-53",
      pubmed: "http://www.ncbi.nlm.nih.gov/pubmed/16374684",
      population: "Large pediatric echocardiography registry",
      method: "Gender-stratified logarithmic BSA regression equations for PV, AoV, TV, MV."
    },
    "Dallaire et al. 2011": {
      title: "New equations and Z-score curves for pediatric coronary artery dimensions",
      authors: "Dallaire F, Dahdah N.",
      journal: "J Am Soc Echocardiogr. 2011;24(1):60-74",
      pubmed: "http://www.ncbi.nlm.nih.gov/pubmed/21074965",
      population: "1,033 healthy children (0 to 18 years)",
      method: "Linear regression model using √BSA: Mean = a + b*√BSA; SD = c + d*√BSA. Uses Haycock BSA."
    },
    "Dallaire et al. 2016": {
      title: "Reference values for left ventricular strain parameters in pediatric populations",
      authors: "Dallaire F, et al.",
      journal: "J Am Soc Echocardiogr. 2016;29(6):514-520",
      pubmed: "https://www.ncbi.nlm.nih.gov/pubmed/27185223",
      population: "Healthy pediatric speckle-tracking strain cohort",
      method: "Power law and polynomial BSA models for circumferential and longitudinal strain."
    },
    "Koestenberger et al. 2009": {
      title: "Transthoracic echocardiographic determination of TAPSE in healthy children",
      authors: "Koestenberger M, et al.",
      journal: "J Am Soc Echocardiogr. 2009;22(6):715-719",
      pubmed: "http://www.ncbi.nlm.nih.gov/pubmed/19423286",
      population: "625 healthy children from neonates to 18 years",
      method: "Age-grid interpolated mean and SD reference curves for TAPSE."
    },
    "Koestenberger et al. 2011": {
      title: "Tricuspid annular peak systolic velocity (TAPSV) in pediatric cohorts",
      authors: "Koestenberger M, et al.",
      journal: "Eur Heart J Cardiovasc Imaging. 2011",
      pubmed: "http://www.ncbi.nlm.nih.gov/pubmed/21944674",
      population: "Healthy children age 0 to 18 years",
      method: "Age-dependent interpolation model for tissue Doppler TAPSV velocities."
    },
    "Koestenberger et al. 2012": {
      title: "Mitral annular peak systolic excursion (MAPSE) in healthy children",
      authors: "Koestenberger M, et al.",
      journal: "J Am Soc Echocardiogr. 2012;25(8):840-848",
      pubmed: "http://www.ncbi.nlm.nih.gov/pubmed/22795292",
      population: "Pediatric cohort for left ventricular annular excursion",
      method: "Age-dependent interpolation grid for MAPSE."
    },
    "Koestenberger et al. 2014": {
      title: "Mitral annular peak systolic velocity (MAPSV) in pediatric cohorts",
      authors: "Koestenberger M, et al.",
      journal: "Eur Heart J Cardiovasc Imaging. 2014",
      pubmed: "http://www.ncbi.nlm.nih.gov/pubmed/25271547",
      population: "Healthy pediatric cohort evaluated with tissue Doppler",
      method: "BSA-grid interpolated mean and SD reference curves."
    }
  };

  const PARAMETERS = [
    // PLAX M-Mode Ventricles
    { id: 'Rvawd', symbol: 'RVAWD', name: 'Right Ventricle Anterior Wall (Diastole)', category: 'mmode', unit: 'mm', refKey: 'REF_KAMPMANN', classConstructor: 'kampmannRvawd', argType: 'wh', hint: '2.8' },
    { id: 'Rvdd', symbol: 'RVDD', name: 'Right Ventricular Diameter (Diastole)', category: 'mmode', unit: 'mm', refKey: 'REF_KAMPMANN', classConstructor: 'kampmannRvdd', argType: 'wh', hint: '12' },
    { id: 'Ivsd', symbol: 'IVSD', name: 'Interventricular Septum (Diastole)', category: 'mmode', unit: 'mm', refKey: 'REF_KAMPMANN', classConstructor: 'kampmannIvsd', argType: 'wh', hint: '5' },
    { id: 'Ivss', symbol: 'IVSS', name: 'Interventricular Septum (Systole)', category: 'mmode', unit: 'mm', refKey: 'REF_KAMPMANN', classConstructor: 'kampmannIvss', argType: 'wh', hint: '7' },
    { id: 'Lvedd', symbol: 'LVEDD', name: 'Left Ventricular End-Diastolic Diameter', category: 'mmode', unit: 'mm', refKey: 'REF_KAMPMANN', classConstructor: 'kampmannLvedd', argType: 'wh', hint: '35' },
    { id: 'Lvesd', symbol: 'LVESD', name: 'Left Ventricular End-Systolic Diameter', category: 'mmode', unit: 'mm', refKey: 'REF_KAMPMANN', classConstructor: 'kampmannLvesd', argType: 'wh', hint: '22' },
    { id: 'Lvpwd', symbol: 'LVPWD', name: 'Left Ventricular Posterior Wall (Diastole)', category: 'mmode', unit: 'mm', refKey: 'REF_KAMPMANN', classConstructor: 'kampmannLvpwd', argType: 'wh', hint: '5' },
    { id: 'Lvpws', symbol: 'LVPWS', name: 'Left Ventricular Posterior Wall (Systole)', category: 'mmode', unit: 'mm', refKey: 'REF_KAMPMANN', classConstructor: 'kampmannLvpws', argType: 'wh', hint: '8' },

    // Aorta & Arch
    { id: 'Anulus', symbol: 'Ao Annulus', name: 'Aortic Valve Annulus Diameter', category: 'aorta', unit: 'mm', refKey: 'REF_GAUTIER', classConstructor: 'gautierAnulus', argType: 'whm', hint: '13' },
    { id: 'Sov', symbol: 'SoV', name: 'Sinus of Valsalva Diameter', category: 'aorta', unit: 'mm', refKey: 'REF_GAUTIER', classConstructor: 'gautierSov', argType: 'whm', hint: '18' },
    { id: 'Stj', symbol: 'STJ', name: 'Sino-Tubular Junction Diameter', category: 'aorta', unit: 'mm', refKey: 'REF_GAUTIER', classConstructor: 'gautierStj', argType: 'whm', hint: '15' },
    { id: 'Aao', symbol: 'AAo', name: 'Ascending Aorta Diameter', category: 'aorta', unit: 'mm', refKey: 'REF_GAUTIER', classConstructor: 'gautierAao', argType: 'whm', hint: '17' },
    { id: 'Taa', symbol: 'Transv Arch', name: 'Transverse Aortic Arch Diameter', category: 'aorta', unit: 'mm', refKey: 'REF_PETERSSEN', classConstructor: 'peterssenTaa', argType: 'wh', hint: '12' },
    { id: 'Isthmus', symbol: 'Isthmus', name: 'Aortic Isthmus Diameter', category: 'aorta', unit: 'mm', refKey: 'REF_PETERSSEN', classConstructor: 'peterssenIsthmus', argType: 'wh', hint: '8' },
    { id: 'Distarch', symbol: 'Dist Arch', name: 'Distal Aortic Arch Diameter', category: 'aorta', unit: 'mm', refKey: 'REF_PETERSSEN', classConstructor: 'peterssenDistarch', argType: 'wh', hint: '10' },
    { id: 'Dao', symbol: 'DAo', name: 'Descending Aorta Diameter', category: 'aorta', unit: 'mm', refKey: 'REF_PETERSSEN', classConstructor: 'peterssenDao', argType: 'wh', hint: '9' },

    // Pulmonary Arteries
    { id: 'Mpa', symbol: 'MPA', name: 'Main Pulmonary Artery Diameter', category: 'pulmo', unit: 'mm', refKey: 'REF_PETERSSEN', classConstructor: 'peterssenMpa', argType: 'wh', hint: '16' },
    { id: 'Rpa', symbol: 'RPA', name: 'Right Pulmonary Artery Diameter', category: 'pulmo', unit: 'mm', refKey: 'REF_PETERSSEN', classConstructor: 'peterssenRpa', argType: 'wh', hint: '8' },
    { id: 'Lpa', symbol: 'LPA', name: 'Left Pulmonary Artery Diameter', category: 'pulmo', unit: 'mm', refKey: 'REF_PETERSSEN', classConstructor: 'peterssenLpa', argType: 'wh', hint: '7' },

    // Cardiac Valves
    { id: 'Pv', symbol: 'PV', name: 'Pulmonary Valve Annulus', category: 'valves', unit: 'mm', refKey: 'REF_ZILBERMAN', classConstructor: 'zilbermanPv', argType: 'wh', hint: '14' },
    { id: 'Aov', symbol: 'AoV', name: 'Aortic Valve Annulus (Zilberman)', category: 'valves', unit: 'mm', refKey: 'REF_ZILBERMAN', classConstructor: 'zilbermanAov', argType: 'wh', hint: '12' },
    { id: 'Tv', symbol: 'TV', name: 'Tricuspid Valve Annulus', category: 'valves', unit: 'mm', refKey: 'REF_ZILBERMAN', classConstructor: 'zilbermanTv', argType: 'wh', hint: '18' },
    { id: 'Mv', symbol: 'MV', name: 'Mitral Valve Annulus', category: 'valves', unit: 'mm', refKey: 'REF_ZILBERMAN', classConstructor: 'zilbermanMv', argType: 'wh', hint: '16' },

    // Coronaries
    { id: 'Lmca', symbol: 'LMCA', name: 'Left Main Coronary Artery', category: 'coro', unit: 'mm', refKey: 'REF_DALLAIRE', classConstructor: 'dallaireLmca', argType: 'wh', hint: '2.5' },
    { id: 'Lad', symbol: 'LAD', name: 'Left Anterior Descending Coronary', category: 'coro', unit: 'mm', refKey: 'REF_DALLAIRE', classConstructor: 'dallaireLad', argType: 'wh', hint: '2.0' },
    { id: 'Cx', symbol: 'Cx', name: 'Circumflex Coronary Artery', category: 'coro', unit: 'mm', refKey: 'REF_DALLAIRE', classConstructor: 'dallaireCx', argType: 'wh', hint: '1.8' },
    { id: 'Rcaprox', symbol: 'RCA Prox', name: 'Right Coronary Artery (Proximal)', category: 'coro', unit: 'mm', refKey: 'REF_DALLAIRE', classConstructor: 'dallaireRcaprox', argType: 'wh', hint: '2.2' },
    { id: 'Rcamed', symbol: 'RCA Mid', name: 'Right Coronary Artery (Mid)', category: 'coro', unit: 'mm', refKey: 'REF_DALLAIRE', classConstructor: 'dallaireRcamed', argType: 'wh', hint: '1.8' },
    { id: 'Rcadist', symbol: 'RCA Dist', name: 'Right Coronary Artery (Distal)', category: 'coro', unit: 'mm', refKey: 'REF_DALLAIRE', classConstructor: 'dallaireRcadist', argType: 'wh', hint: '1.5' },

    // Ventricular Function & Strain
    { id: 'Tapse', symbol: 'TAPSE', name: 'Tricuspid Annular Plane Systolic Excursion', category: 'function', unit: 'cm', refKey: 'REF_KOESTENBERGER_TAPSE', classConstructor: 'koestenbergerTapse', argType: 'age', hint: '1.8' },
    { id: 'Tapsv', symbol: 'TAPSV', name: 'Tricuspid Annular Peak Systolic Velocity', category: 'function', unit: 'cm/s', refKey: 'REF_KOESTENBERGER_TAPSV', classConstructor: 'koestenbergerTapsv', argType: 'age', hint: '12' },
    { id: 'Mapse', symbol: 'MAPSE', name: 'Mitral Annular Plane Systolic Excursion', category: 'function', unit: 'cm', refKey: 'REF_KOESTENBERGER_MAPSE', classConstructor: 'koestenbergerMapse', argType: 'age', hint: '1.2' },
    { id: 'Mapsv', symbol: 'MAPSV', name: 'Mitral Annular Peak Systolic Velocity', category: 'function', unit: 'cm/s', refKey: 'REF_KOESTENBERGER_MAPSV', classConstructor: 'koestenbergerMapsv', argType: 'age', hint: '10' },
    { id: 'Basalcs', symbol: 'Basal CS', name: 'Basal Circumferential Strain', category: 'function', unit: '%', refKey: 'REF_DALLAIRE2', classConstructor: 'dallaireBasalcs', argType: 'wh', hint: '-22' },
    { id: 'Midcs', symbol: 'Mid CS', name: 'Mid Circumferential Strain', category: 'function', unit: '%', refKey: 'REF_DALLAIRE2', classConstructor: 'dallaireMidcs', argType: 'wh', hint: '-20' },
    { id: 'Apicalcs', symbol: 'Apical CS', name: 'Apical Circumferential Strain', category: 'function', unit: '%', refKey: 'REF_DALLAIRE2', classConstructor: 'dallaireApicalcs', argType: 'wh', hint: '-25' },
    { id: 'Meanls', symbol: 'LS', name: 'Mean Longitudinal Strain', category: 'function', unit: '%', refKey: 'REF_DALLAIRE2', classConstructor: 'dallaireMeanls', argType: 'wh', hint: '-20' }
  ];

  const REF_KEY_MAP = {
    'REF_KAMPMANN': 'Kampmann et al. 2000',
    'REF_GAUTIER': 'Gautier et al. 2010',
    'REF_PETERSSEN': 'Peterssen et al. 2008',
    'REF_ZILBERMAN': 'Zilberman et al. 2008',
    'REF_DALLAIRE': 'Dallaire et al. 2011',
    'REF_DALLAIRE2': 'Dallaire et al. 2016',
    'REF_KOESTENBERGER_TAPSE': 'Koestenberger et al. 2009',
    'REF_KOESTENBERGER_MAPSE': 'Koestenberger et al. 2012',
    'REF_KOESTENBERGER_TAPSV': 'Koestenberger et al. 2011',
    'REF_KOESTENBERGER_MAPSV': 'Koestenberger et al. 2014'
  };

  function computeBSA(heightCm, weightKg, formula) {
    if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return 0;
    switch (formula) {
      case 'mosteller':
        return bsaMosteller(heightCm, weightKg);
      case 'haycock':
        return bsaHaycock(heightCm, weightKg);
      case 'boyd':
        return bsaBoyd(heightCm, weightKg);
      case 'dubois':
      default:
        return bsaDuBois(heightCm, weightKg);
    }
  }

  function renderPedZModal(containerEl, initialWeight, initialHeight, initialAgeYears) {
    const state = {
      weight: parseFloat(initialWeight) || 0,
      height: parseFloat(initialHeight) || 0,
      gender: 'male',
      ageYears: parseFloat(initialAgeYears) || 0,
      ageMonths: (parseFloat(initialAgeYears) || 0) * 12,
      bsaFormula: 'dubois',
      bsaValue: 0,
      comparisonMode: false,
      activeCategory: 'none',
      searchQuery: '',
      measuredValues: {}
    };

    containerEl.innerHTML = `
      <div class="pedz-container">
        <!-- Header -->
        <div class="pedz-header">
          <div class="pedz-brand">
            <div class="pedz-brand-icon">🫀</div>
            <div>
              <h2 class="pedz-title">PedZ Echocardiography Calculator</h2>
              <p class="pedz-subtitle">Pediatric Cardiology Z-Scores, BSA Engine & Reference Norms</p>
            </div>
          </div>
          <button id="pedzBtnExport" class="pedz-btn-secondary">📋 Export Summary</button>
        </div>

        <!-- Inputs & BSA -->
        <div class="pedz-input-panel">
          <div class="pedz-panel-title">⚖️ Patient Biometrics & Parameters</div>
          <div class="pedz-input-grid">
            <div class="pedz-field">
              <label for="pedzWeight">Weight (W)</label>
              <div class="pedz-input-wrap">
                <input type="number" id="pedzWeight" class="pedz-input" step="0.1" min="0.5" max="150" placeholder="e.g. 15" value="${state.weight > 0 ? state.weight : ''}">
                <span class="pedz-unit">kg</span>
              </div>
            </div>
            <div class="pedz-field">
              <label for="pedzHeight">Height (H)</label>
              <div class="pedz-input-wrap">
                <input type="number" id="pedzHeight" class="pedz-input" step="0.5" min="20" max="220" placeholder="e.g. 100" value="${state.height > 0 ? state.height : ''}">
                <span class="pedz-unit">cm</span>
              </div>
            </div>
            <div class="pedz-field">
              <label>Age (Yr & Mo)</label>
              <div class="pedz-flex-gap">
                <div class="pedz-input-wrap" style="flex:1">
                  <input type="number" id="pedzAgeYears" class="pedz-input" min="0" max="18" placeholder="yr" value="${state.ageYears > 0 ? Math.floor(state.ageYears) : ''}">
                  <span class="pedz-unit">yr</span>
                </div>
                <div class="pedz-input-wrap" style="flex:1">
                  <input type="number" id="pedzAgeMonths" class="pedz-input" min="0" max="11" placeholder="mo" value="${Math.round((state.ageYears % 1) * 12) || ''}">
                  <span class="pedz-unit">mo</span>
                </div>
              </div>
            </div>
            <div class="pedz-field">
              <label>Biological Sex</label>
              <div class="pedz-segmented-control">
                <button id="pedzGenderMale" class="pedz-seg-btn active">Male</button>
                <button id="pedzGenderFemale" class="pedz-seg-btn">Female</button>
              </div>
            </div>
          </div>

          <div class="pedz-bsa-bar">
            <div class="pedz-bsa-selector">
              <span class="pedz-label-sm">BSA Formula:</span>
              <div class="pedz-bsa-opts">
                <button class="pedz-bsa-btn active" data-formula="dubois">DuBois</button>
                <button class="pedz-bsa-btn" data-formula="mosteller">Mosteller</button>
                <button class="pedz-bsa-btn" data-formula="haycock">Haycock</button>
                <button class="pedz-bsa-btn" data-formula="boyd">Boyd</button>
              </div>
            </div>
            <div class="pedz-bsa-val-card">
              <div style="font-size:0.7rem; font-weight:800; text-transform:uppercase; color:var(--text-muted);">Calculated BSA</div>
              <div id="pedzBsaValDisplay" class="pedz-bsa-num">-- m²</div>
            </div>
          </div>
        </div>

        <!-- Optional Comparison Box Toggle -->
        <div class="pedz-comparison-box-toggle">
          <div class="pedz-toggle-text">
            <div style="font-weight:700; font-size:0.9rem; color:var(--text-primary);">🧪 Measured Values & Discrepancy Evaluation</div>
            <div style="font-size:0.8rem; color:var(--text-secondary);">Enable to input custom echo measurements and compute Z-score spectrum & % deviation.</div>
          </div>
          <label class="pedz-switch">
            <input type="checkbox" id="pedzToggleComparison">
            <span class="pedz-slider"></span>
          </label>
        </div>

        <!-- Tabs & Search -->
        <div class="pedz-toolbar">
          <div class="pedz-category-tabs">
            <button class="pedz-tab" data-cat="mmode">🫀 M-Mode Ventricles</button>
            <button class="pedz-tab" data-cat="aorta">🩸 Aorta & Arch</button>
            <button class="pedz-tab" data-cat="pulmo">🫁 Pulmonary Arteries</button>
            <button class="pedz-tab" data-cat="valves">🩺 Valves</button>
            <button class="pedz-tab" data-cat="coro">👑 Coronaries</button>
            <button class="pedz-tab" data-cat="function">⚡ Function & Strain</button>
          </div>
          <div class="pedz-search-wrap">
            <input type="text" id="pedzSearch" class="pedz-search-input" placeholder="Search (e.g. LAD, TAPSE, AoV)...">
          </div>
        </div>

        <!-- Parameter List -->
        <div id="pedzParamsContainer" class="pedz-params-list"></div>
      </div>

      <!-- Reference Modal Overlay -->
      <div id="pedzRefModalOverlay" class="pedz-modal-overlay">
        <div class="pedz-modal-card">
          <div class="pedz-modal-header">
            <div>
              <div id="pedzModalTitle" style="font-size:1.1rem; font-weight:800; color:var(--text-primary);">Reference Citation</div>
              <div id="pedzModalSub" style="font-size:0.85rem; color:#06b6d4; font-weight:600;">Study Information</div>
            </div>
            <button id="pedzModalClose" class="pedz-modal-close-btn">✕</button>
          </div>
          <div style="display:flex; flex-direction:column; gap:12px; margin-top:12px;">
            <div>
              <div class="pedz-ref-lbl">Authors</div>
              <div id="pedzRefAuthors" class="pedz-ref-val">--</div>
            </div>
            <div>
              <div class="pedz-ref-lbl">Journal & Publication</div>
              <div id="pedzRefJournal" class="pedz-ref-val">--</div>
            </div>
            <div>
              <div class="pedz-ref-lbl">Study Population</div>
              <div id="pedzRefPopulation" class="pedz-ref-val">--</div>
            </div>
            <div>
              <div class="pedz-ref-lbl">Statistical Model</div>
              <div id="pedzRefMethod" class="pedz-ref-val">--</div>
            </div>
            <div style="margin-top:4px;">
              <a id="pedzRefPubmed" href="#" target="_blank" class="pedz-pubmed-link">🔗 View PubMed Article</a>
            </div>
          </div>
        </div>
      </div>
    `;

    // Event Bindings
    const elWeight = containerEl.querySelector('#pedzWeight');
    const elHeight = containerEl.querySelector('#pedzHeight');
    const elAgeY = containerEl.querySelector('#pedzAgeYears');
    const elAgeM = containerEl.querySelector('#pedzAgeMonths');
    const elMale = containerEl.querySelector('#pedzGenderMale');
    const elFemale = containerEl.querySelector('#pedzGenderFemale');
    const bsaBtns = containerEl.querySelectorAll('.pedz-bsa-btn');
    const compToggle = containerEl.querySelector('#pedzToggleComparison');
    const tabs = containerEl.querySelectorAll('.pedz-tab');
    const elSearch = containerEl.querySelector('#pedzSearch');
    const btnReport = containerEl.querySelector('#pedzBtnExport');

    const modalOverlay = containerEl.querySelector('#pedzRefModalOverlay');
    const modalClose = containerEl.querySelector('#pedzModalClose');

    if (modalClose && modalOverlay) {
      modalClose.addEventListener('click', () => modalOverlay.classList.remove('active'));
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) modalOverlay.classList.remove('active');
      });
    }

    function updateCalculations() {
      state.bsaValue = computeBSA(state.height, state.weight, state.bsaFormula);
      const bsaDisplay = containerEl.querySelector('#pedzBsaValDisplay');
      if (bsaDisplay) {
        bsaDisplay.textContent = state.bsaValue > 0 ? state.bsaValue.toFixed(2) + ' m²' : '-- m²';
      }
      renderParameters();
    }

    if (elWeight) {
      elWeight.addEventListener('input', function () {
        state.weight = parseFloat(this.value) || 0;
        updateCalculations();
      });
    }
    if (elHeight) {
      elHeight.addEventListener('input', function () {
        state.height = parseFloat(this.value) || 0;
        updateCalculations();
      });
    }

    const updateAge = () => {
      const y = parseFloat(elAgeY?.value) || 0;
      const m = parseFloat(elAgeM?.value) || 0;
      state.ageYears = y;
      state.ageMonths = (y * 12) + m;
      updateCalculations();
    };

    if (elAgeY) elAgeY.addEventListener('input', updateAge);
    if (elAgeM) elAgeM.addEventListener('input', updateAge);

    if (elMale && elFemale) {
      elMale.addEventListener('click', () => {
        elMale.classList.add('active');
        elFemale.classList.remove('active');
        state.gender = 'male';
        updateCalculations();
      });
      elFemale.addEventListener('click', () => {
        elFemale.classList.add('active');
        elMale.classList.remove('active');
        state.gender = 'female';
        updateCalculations();
      });
    }

    bsaBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        bsaBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        state.bsaFormula = this.getAttribute('data-formula');
        updateCalculations();
      });
    });

    if (compToggle) {
      compToggle.addEventListener('change', function () {
        state.comparisonMode = this.checked;
        renderParameters();
      });
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', function () {
        tabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        state.activeCategory = this.getAttribute('data-cat');
        renderParameters();
      });
    });

    if (elSearch) {
      elSearch.addEventListener('input', function () {
        state.searchQuery = this.value.toLowerCase().trim();
        renderParameters();
      });
    }

    if (btnReport) {
      btnReport.addEventListener('click', () => {
        let text = `PEDZ ECHOCARDIOGRAPHY REPORT\nDate: ${new Date().toLocaleDateString()}\nPatient: ${state.weight} kg, ${state.height} cm (${state.gender.toUpperCase()}), BSA: ${state.bsaValue.toFixed(2)} m²\n\n`;
        let count = 0;
        PARAMETERS.forEach(p => {
          const calc = calculateParam(p);
          if (state.measuredValues[p.id] && calc.zScore !== null) {
            count++;
            text += `${p.symbol} (${p.name}): ${state.measuredValues[p.id]} ${p.unit} (Mean: ${calc.mean}, Z: ${calc.zScore}, ${calc.percentile} P.)\n`;
          }
        });
        if (count === 0) {
          text += `Summary of Expected Means:\n`;
          PARAMETERS.slice(0, 10).forEach(p => {
            const calc = calculateParam(p);
            text += `${p.symbol}: Expected ${calc.mean} ${p.unit} (Range: ${calc.lln} - ${calc.uln})\n`;
          });
        }
        alert(text);
      });
    }

    function calculateParam(paramDef) {
      const W = state.weight;
      const H = state.height;
      const isMale = (state.gender === 'male');
      const measuredVal = parseFloat(state.measuredValues[paramDef.id]) || 0;
      const ageMonths = state.ageMonths;

      if (paramDef.argType !== 'age' && (W <= 0 || H <= 0)) {
        return { lln: '--', mean: '--', uln: '--', zScore: null, percentile: null, diff: null, diffPct: null };
      }
      if (paramDef.argType === 'age' && ageMonths <= 0) {
        return { lln: '--', mean: '--', uln: '--', zScore: null, percentile: null, diff: null, diffPct: null };
      }

      let calcObj = null;
      const dummyVal = 1.0;
      try {
        if (typeof window[paramDef.classConstructor] === 'function') {
          const Constructor = window[paramDef.classConstructor];
          switch (paramDef.argType) {
            case 'age': calcObj = new Constructor(dummyVal, ageMonths); break;
            case 'whm': calcObj = new Constructor(dummyVal, W, H, isMale); break;
            case 'wh': default: calcObj = new Constructor(dummyVal, W, H); break;
          }
        }
      } catch (err) { }

      if (!calcObj) {
        return { lln: '--', mean: '--', uln: '--', zScore: null, percentile: null, diff: null, diffPct: null };
      }

      const llnRaw = calcObj.getValueFromZ(-2);
      const meanRaw = calcObj.getValueFromZ(0);
      const ulnRaw = calcObj.getValueFromZ(2);

      const lln = (llnRaw === -100 || isNaN(llnRaw)) ? '--' : llnRaw.toFixed(1);
      const mean = (meanRaw === -100 || isNaN(meanRaw)) ? '--' : meanRaw.toFixed(1);
      const uln = (ulnRaw === -100 || isNaN(ulnRaw)) ? '--' : ulnRaw.toFixed(1);

      let zScore = null, percentile = null, diff = null, diffPct = null;

      if (measuredVal !== 0 && meanRaw !== -100 && !isNaN(meanRaw)) {
        let calcObjMeasured = null;
        try {
          const Constructor = window[paramDef.classConstructor];
          switch (paramDef.argType) {
            case 'age': calcObjMeasured = new Constructor(measuredVal, ageMonths); break;
            case 'whm': calcObjMeasured = new Constructor(measuredVal, W, H, isMale); break;
            case 'wh': default: calcObjMeasured = new Constructor(measuredVal, W, H); break;
          }
        } catch (e) { }

        if (calcObjMeasured) {
          const zRaw = calcObjMeasured.getZFromValue(measuredVal);
          if (zRaw !== -100 && !isNaN(zRaw)) {
            zScore = zRaw.toFixed(2);
            const auc = get_auc_from_z(zRaw);
            percentile = formatPercentile(auc);
            diff = (measuredVal - meanRaw).toFixed(1);
            diffPct = (((measuredVal - meanRaw) / meanRaw) * 100).toFixed(1);
          }
        }
      }

      return { lln, mean, uln, zScore, percentile, diff, diffPct, rawMean: meanRaw };
    }

    function renderParameters() {
      const pContainer = containerEl.querySelector('#pedzParamsContainer');
      if (!pContainer) return;

      const filtered = PARAMETERS.filter(p => {
        if (state.searchQuery) {
          const q = state.searchQuery.toLowerCase();
          return p.id.toLowerCase().includes(q) || p.symbol.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
        }
        if (state.activeCategory === 'none') return false;
        if (state.activeCategory !== 'all' && p.category !== state.activeCategory) return false;
        return true;
      });

      if (filtered.length === 0) {
        if (state.searchQuery) {
          pContainer.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-muted); font-weight:600;">No parameters match your search.</div>';
        } else if (state.activeCategory === 'none') {
          if (state.weight <= 0 && state.height <= 0) {
            pContainer.innerHTML = '<div style="text-align:center; padding:50px 20px; color:var(--text-muted); font-weight:600;"><div style="font-size:3rem; margin-bottom:12px;">⚖️</div><div style="font-size:1.1rem; color:var(--text-primary); margin-bottom:6px;">Enter Patient Biometrics</div><div style="font-size:0.9rem;">Input weight and height above to calculate body surface area.<br>Then, select a category to view expected ranges.</div></div>';
          } else {
            pContainer.innerHTML = '<div style="text-align:center; padding:50px 20px; color:var(--text-muted); font-weight:600;"><div style="font-size:3rem; margin-bottom:12px;">📊</div><div style="font-size:1.1rem; color:var(--text-primary); margin-bottom:6px;">Select a Category</div><div style="font-size:0.9rem;">Click on a tab above to view the z-scores for that specific group.</div></div>';
          }
        }
        return;
      }

      let html = '';
      filtered.forEach(p => {
        const calc = calculateParam(p);
        const refName = REF_KEY_MAP[p.refKey] || 'Reference';

        html += `
          <div class="pedz-param-card">
            <div class="pedz-param-header">
              <div class="pedz-param-title">
                <span class="pedz-param-symbol">${p.symbol}</span>
                <span class="pedz-param-name">${p.name}</span>
              </div>
              <button class="pedz-ref-tag" data-ref-key="${refName}">ℹ️ ${refName}</button>
            </div>

            <div class="pedz-range-grid">
              <div class="pedz-range-cell">
                <span class="pedz-range-lbl">LLN (-2z)</span>
                <span class="pedz-range-val">${calc.lln} ${calc.lln !== '--' ? p.unit : ''}</span>
              </div>
              <div class="pedz-range-cell pedz-mean-cell">
                <span class="pedz-range-lbl">Expected Mean (0z)</span>
                <span class="pedz-range-val pedz-mean-val">${calc.mean} ${calc.mean !== '--' ? p.unit : ''}</span>
              </div>
              <div class="pedz-range-cell">
                <span class="pedz-range-lbl">ULN (+2z)</span>
                <span class="pedz-range-val">${calc.uln} ${calc.uln !== '--' ? p.unit : ''}</span>
              </div>
              <div class="pedz-range-cell">
                <span class="pedz-range-lbl">Unit</span>
                <span class="pedz-range-val" style="color:var(--text-muted);">${p.unit}</span>
              </div>
            </div>
        `;

        if (calc.mean === '--') {
          html += `<div class="pedz-hint-bar">Enter Weight & Height above to calculate expected mean range.</div>`;
        }

        if (state.comparisonMode) {
          const val = state.measuredValues[p.id] || '';
          let zBadges = '';
          let markerPos = 50;

          if (calc.zScore !== null) {
            const zNum = parseFloat(calc.zScore);
            markerPos = Math.max(0, Math.min(100, ((zNum + 3) / 6) * 100));

            let statusCls = 'pedz-tag-norm', statusTxt = 'Normal Range';
            if (zNum > 2.0) { statusCls = 'pedz-tag-danger'; statusTxt = 'Dilated / High (+2z)'; }
            else if (zNum < -2.0) { statusCls = 'pedz-tag-warn'; statusTxt = 'Small / Low (-2z)'; }

            zBadges = `
              <span class="pedz-stat-pill zscore">${calc.zScore} z</span>
              <span class="pedz-stat-pill percentile">${calc.percentile} P.</span>
              <span class="pedz-stat-pill diff">Δ ${calc.diff > 0 ? '+' : ''}${calc.diff} ${p.unit} (${calc.diffPct > 0 ? '+' : ''}${calc.diffPct}%)</span>
              <span class="pedz-status-tag ${statusCls}">${statusTxt}</span>
            `;
          }

          html += `
            <div class="pedz-comp-row">
              <div class="pedz-comp-input-group">
                <label for="pedzInp_${p.id}">Measured</label>
                <div class="pedz-input-wrap">
                  <input type="number" step="0.1" id="pedzInp_${p.id}" class="pedz-input pedz-meas-input" data-param-id="${p.id}" value="${val}" placeholder="e.g. ${p.hint}">
                  <span class="pedz-unit">${p.unit}</span>
                </div>
              </div>
              <div class="pedz-comp-output-group">
                <div class="pedz-stat-row">${zBadges}</div>
                ${calc.zScore !== null ? `
                  <div class="pedz-bar-bg">
                    <div class="pedz-bar-marker" style="left:${markerPos}%;"></div>
                  </div>
                  <div class="pedz-bar-ticks">
                    <span>-3z</span><span>-2z</span><span>0z</span><span>+2z</span><span>+3z</span>
                  </div>
                ` : `<div style="font-size:0.75rem; color:var(--text-muted); font-style:italic;">Enter measured value to calculate Z-score spectrum.</div>`}
              </div>
            </div>
          `;
        }

        html += `</div>`;
      });

      pContainer.innerHTML = html;

      // Event Listeners for Reference Tags
      pContainer.querySelectorAll('.pedz-ref-tag').forEach(tag => {
        tag.addEventListener('click', function () {
          const rKey = this.getAttribute('data-ref-key');
          const rData = REFERENCE_DATA[rKey];
          if (!rData) return;

          containerEl.querySelector('#pedzModalTitle').textContent = rKey;
          containerEl.querySelector('#pedzModalSub').textContent = rData.title;
          containerEl.querySelector('#pedzRefAuthors').textContent = rData.authors;
          containerEl.querySelector('#pedzRefJournal').textContent = rData.journal;
          containerEl.querySelector('#pedzRefPopulation').textContent = rData.population;
          containerEl.querySelector('#pedzRefMethod').textContent = rData.method;

          const pmLink = containerEl.querySelector('#pedzRefPubmed');
          if (pmLink) pmLink.href = rData.pubmed;

          const overlay = containerEl.querySelector('#pedzRefModalOverlay');
          if (overlay) overlay.classList.add('active');
        });
      });

      // Event Listeners for Measured Inputs
      if (state.comparisonMode) {
        pContainer.querySelectorAll('.pedz-meas-input').forEach(inp => {
          inp.addEventListener('input', function () {
            const pId = this.getAttribute('data-param-id');
            state.measuredValues[pId] = this.value;
            renderParameters();
            const nextInp = containerEl.querySelector('#pedzInp_' + pId);
            if (nextInp) {
              nextInp.focus();
              nextInp.setSelectionRange(nextInp.value.length, nextInp.value.length);
            }
          });
        });
      }
    }

    updateCalculations();
  }

  global.renderPedZModal = renderPedZModal;

})(typeof window !== 'undefined' ? window : this);
