// PedZ App Prototype Logic & Interface Manager
(function () {
  'use strict';

  // Ensure window.lang translation fallback exists BEFORE anything else
  if (typeof window.lang === 'undefined') {
    window.lang = {
      convert: function (str) { return str; }
    };
  }

  // Call setStrings() from mmode.js to initialize all INFO_* variables
  // This MUST happen before any constructor is called
  if (typeof setStrings === 'function') {
    setStrings();
  }

  // Application State — start with EMPTY inputs (no auto-fill)
  const state = {
    weight: 0,        // kg (empty = 0)
    height: 0,        // cm (empty = 0)
    gender: 'male',   // 'male' or 'female'
    ageMonths: 0,     // age in months
    bsaFormula: 'dubois', // 'mosteller', 'dubois', 'haycock', 'boyd'
    bsaValue: 0,
    comparisonMode: false,
    activeCategory: 'all',
    searchQuery: '',
    measuredValues: {} // stores user measured values by paramId
  };

  // Reference Sources Metadata Dictionary
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

  // Master Parameter Definitions List
  // argType: 'whm' = (value, weight, height, isMale), 'wh' = (value, weight, height), 'age' = (value, ageMonths)
  const PARAMETERS = [
    // PLAX M-Mode Ventricles — kampmann takes (value, weight, height) — 3 args
    { id: 'Rvawd', symbol: 'RVAWD', name: 'Right Ventricle Anterior Wall (Diastole)', category: 'mmode', unit: 'mm', refKey: 'REF_KAMPMANN', classConstructor: 'kampmannRvawd', argType: 'wh', hint: '2.8' },
    { id: 'Rvdd', symbol: 'RVDD', name: 'Right Ventricular Diameter (Diastole)', category: 'mmode', unit: 'mm', refKey: 'REF_KAMPMANN', classConstructor: 'kampmannRvdd', argType: 'wh', hint: '12' },
    { id: 'Ivsd', symbol: 'IVSD', name: 'Interventricular Septum (Diastole)', category: 'mmode', unit: 'mm', refKey: 'REF_KAMPMANN', classConstructor: 'kampmannIvsd', argType: 'wh', hint: '5' },
    { id: 'Ivss', symbol: 'IVSS', name: 'Interventricular Septum (Systole)', category: 'mmode', unit: 'mm', refKey: 'REF_KAMPMANN', classConstructor: 'kampmannIvss', argType: 'wh', hint: '7' },
    { id: 'Lvedd', symbol: 'LVEDD', name: 'Left Ventricular End-Diastolic Diameter', category: 'mmode', unit: 'mm', refKey: 'REF_KAMPMANN', classConstructor: 'kampmannLvedd', argType: 'wh', hint: '35' },
    { id: 'Lvesd', symbol: 'LVESD', name: 'Left Ventricular End-Systolic Diameter', category: 'mmode', unit: 'mm', refKey: 'REF_KAMPMANN', classConstructor: 'kampmannLvesd', argType: 'wh', hint: '22' },
    { id: 'Lvpwd', symbol: 'LVPWD', name: 'Left Ventricular Posterior Wall (Diastole)', category: 'mmode', unit: 'mm', refKey: 'REF_KAMPMANN', classConstructor: 'kampmannLvpwd', argType: 'wh', hint: '5' },
    { id: 'Lvpws', symbol: 'LVPWS', name: 'Left Ventricular Posterior Wall (Systole)', category: 'mmode', unit: 'mm', refKey: 'REF_KAMPMANN', classConstructor: 'kampmannLvpws', argType: 'wh', hint: '8' },

    // Aorta & Arch — gautier takes (value, weight, height, isMale) — 4 args
    { id: 'Anulus', symbol: 'Ao Annulus', name: 'Aortic Valve Annulus Diameter', category: 'aorta', unit: 'mm', refKey: 'REF_GAUTIER', classConstructor: 'gautierAnulus', argType: 'whm', hint: '13' },
    { id: 'Sov', symbol: 'SoV', name: 'Sinus of Valsalva Diameter', category: 'aorta', unit: 'mm', refKey: 'REF_GAUTIER', classConstructor: 'gautierSov', argType: 'whm', hint: '18' },
    { id: 'Stj', symbol: 'STJ', name: 'Sino-Tubular Junction Diameter', category: 'aorta', unit: 'mm', refKey: 'REF_GAUTIER', classConstructor: 'gautierStj', argType: 'whm', hint: '15' },
    { id: 'Aao', symbol: 'AAo', name: 'Ascending Aorta Diameter', category: 'aorta', unit: 'mm', refKey: 'REF_GAUTIER', classConstructor: 'gautierAao', argType: 'whm', hint: '17' },
    // peterssen takes (value, weight, height) — 3 args
    { id: 'Taa', symbol: 'Transv Arch', name: 'Transverse Aortic Arch Diameter', category: 'aorta', unit: 'mm', refKey: 'REF_PETERSSEN', classConstructor: 'peterssenTaa', argType: 'wh', hint: '12' },
    { id: 'Isthmus', symbol: 'Isthmus', name: 'Aortic Isthmus Diameter', category: 'aorta', unit: 'mm', refKey: 'REF_PETERSSEN', classConstructor: 'peterssenIsthmus', argType: 'wh', hint: '8' },
    { id: 'Distarch', symbol: 'Dist Arch', name: 'Distal Aortic Arch Diameter', category: 'aorta', unit: 'mm', refKey: 'REF_PETERSSEN', classConstructor: 'peterssenDistarch', argType: 'wh', hint: '10' },
    { id: 'Dao', symbol: 'DAo', name: 'Descending Aorta Diameter', category: 'aorta', unit: 'mm', refKey: 'REF_PETERSSEN', classConstructor: 'peterssenDao', argType: 'wh', hint: '9' },

    // Pulmonary Arteries — peterssen takes (value, weight, height) — 3 args
    { id: 'Mpa', symbol: 'MPA', name: 'Main Pulmonary Artery Diameter', category: 'pulmo', unit: 'mm', refKey: 'REF_PETERSSEN', classConstructor: 'peterssenMpa', argType: 'wh', hint: '16' },
    { id: 'Rpa', symbol: 'RPA', name: 'Right Pulmonary Artery Diameter', category: 'pulmo', unit: 'mm', refKey: 'REF_PETERSSEN', classConstructor: 'peterssenRpa', argType: 'wh', hint: '8' },
    { id: 'Lpa', symbol: 'LPA', name: 'Left Pulmonary Artery Diameter', category: 'pulmo', unit: 'mm', refKey: 'REF_PETERSSEN', classConstructor: 'peterssenLpa', argType: 'wh', hint: '7' },

    // Cardiac Valves — zilberman takes (value, weight, height) — 3 args
    { id: 'Pv', symbol: 'PV', name: 'Pulmonary Valve Annulus', category: 'valves', unit: 'mm', refKey: 'REF_ZILBERMAN', classConstructor: 'zilbermanPv', argType: 'wh', hint: '14' },
    { id: 'Aov', symbol: 'AoV', name: 'Aortic Valve Annulus (Zilberman)', category: 'valves', unit: 'mm', refKey: 'REF_ZILBERMAN', classConstructor: 'zilbermanAov', argType: 'wh', hint: '12' },
    { id: 'Tv', symbol: 'TV', name: 'Tricuspid Valve Annulus', category: 'valves', unit: 'mm', refKey: 'REF_ZILBERMAN', classConstructor: 'zilbermanTv', argType: 'wh', hint: '18' },
    { id: 'Mv', symbol: 'MV', name: 'Mitral Valve Annulus', category: 'valves', unit: 'mm', refKey: 'REF_ZILBERMAN', classConstructor: 'zilbermanMv', argType: 'wh', hint: '16' },

    // Coronaries — dallaire takes (value, weight, height) — 3 args
    { id: 'Lmca', symbol: 'LMCA', name: 'Left Main Coronary Artery', category: 'coro', unit: 'mm', refKey: 'REF_DALLAIRE', classConstructor: 'dallaireLmca', argType: 'wh', hint: '2.5' },
    { id: 'Lad', symbol: 'LAD', name: 'Left Anterior Descending Coronary', category: 'coro', unit: 'mm', refKey: 'REF_DALLAIRE', classConstructor: 'dallaireLad', argType: 'wh', hint: '2.0' },
    { id: 'Cx', symbol: 'Cx', name: 'Circumflex Coronary Artery', category: 'coro', unit: 'mm', refKey: 'REF_DALLAIRE', classConstructor: 'dallaireCx', argType: 'wh', hint: '1.8' },
    { id: 'Rcaprox', symbol: 'RCA Prox', name: 'Right Coronary Artery (Proximal)', category: 'coro', unit: 'mm', refKey: 'REF_DALLAIRE', classConstructor: 'dallaireRcaprox', argType: 'wh', hint: '2.2' },
    { id: 'Rcamed', symbol: 'RCA Mid', name: 'Right Coronary Artery (Mid)', category: 'coro', unit: 'mm', refKey: 'REF_DALLAIRE', classConstructor: 'dallaireRcamed', argType: 'wh', hint: '1.8' },
    { id: 'Rcadist', symbol: 'RCA Dist', name: 'Right Coronary Artery (Distal)', category: 'coro', unit: 'mm', refKey: 'REF_DALLAIRE', classConstructor: 'dallaireRcadist', argType: 'wh', hint: '1.5' },

    // Ventricular Function & Strain — koestenberger takes (value, ageMonths)
    { id: 'Tapse', symbol: 'TAPSE', name: 'Tricuspid Annular Plane Systolic Excursion', category: 'function', unit: 'cm', refKey: 'REF_KOESTENBERGER_TAPSE', classConstructor: 'koestenbergerTapse', argType: 'age', hint: '1.8' },
    { id: 'Tapsv', symbol: 'TAPSV', name: 'Tricuspid Annular Peak Systolic Velocity', category: 'function', unit: 'cm/s', refKey: 'REF_KOESTENBERGER_TAPSV', classConstructor: 'koestenbergerTapsv', argType: 'age', hint: '12' },
    { id: 'Mapse', symbol: 'MAPSE', name: 'Mitral Annular Plane Systolic Excursion', category: 'function', unit: 'cm', refKey: 'REF_KOESTENBERGER_MAPSE', classConstructor: 'koestenbergerMapse', argType: 'age', hint: '1.2' },
    { id: 'Mapsv', symbol: 'MAPSV', name: 'Mitral Annular Peak Systolic Velocity', category: 'function', unit: 'cm/s', refKey: 'REF_KOESTENBERGER_MAPSV', classConstructor: 'koestenbergerMapsv', argType: 'age', hint: '10' },
    // dallaire2 strain — takes (value, weight, height) — 3 args
    { id: 'Basalcs', symbol: 'Basal CS', name: 'Basal Circumferential Strain', category: 'function', unit: '%', refKey: 'REF_DALLAIRE2', classConstructor: 'dallaireBasalcs', argType: 'wh', hint: '-22' },
    { id: 'Midcs', symbol: 'Mid CS', name: 'Mid Circumferential Strain', category: 'function', unit: '%', refKey: 'REF_DALLAIRE2', classConstructor: 'dallaireMidcs', argType: 'wh', hint: '-20' },
    { id: 'Apicalcs', symbol: 'Apical CS', name: 'Apical Circumferential Strain', category: 'function', unit: '%', refKey: 'REF_DALLAIRE2', classConstructor: 'dallaireApicalcs', argType: 'wh', hint: '-25' },
    { id: 'Meanls', symbol: 'LS', name: 'Mean Longitudinal Strain', category: 'function', unit: '%', refKey: 'REF_DALLAIRE2', classConstructor: 'dallaireMeanls', argType: 'wh', hint: '-20' }
  ];

  // Map JS variable reference names to human readable strings
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

  // Helper function to compute BSA using 4 formulas
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

  // Calculate Z-Score & Reference Values for a parameter
  // This function calls the EXACT constructor from mmode.js with the CORRECT argument signature
  // and does NOT modify any internal properties — it lets each class handle its own BSA calculation
  function calculateParameter(paramDef) {
    const W = state.weight;
    const H = state.height;
    const isMale = (state.gender === 'male');
    const measuredVal = parseFloat(state.measuredValues[paramDef.id]) || 0;
    const ageMonths = state.ageMonths;

    // If weight and height are 0, skip calculation for BSA-dependent params
    if (paramDef.argType !== 'age' && (W <= 0 || H <= 0)) {
      return { lln: '--', mean: '--', uln: '--', zScore: null, percentile: null, diff: null, diffPct: null };
    }
    // If age is 0 for age-dependent params, skip
    if (paramDef.argType === 'age' && ageMonths <= 0) {
      return { lln: '--', mean: '--', uln: '--', zScore: null, percentile: null, diff: null, diffPct: null };
    }

    let calcObj = null;
    // Use a dummy value of 1.0 for computing reference ranges (LLN, Mean, ULN)
    // The actual measured value is only needed for Z-score computation
    var dummyVal = 1.0;

    try {
      if (typeof window[paramDef.classConstructor] === 'function') {
        var Constructor = window[paramDef.classConstructor];

        // Call constructor with EXACT argument signature from mmode.js
        switch (paramDef.argType) {
          case 'age':
            // (value, ageMonths)
            calcObj = new Constructor(dummyVal, ageMonths);
            break;
          case 'whm':
            // (value, weight, height, isMale)
            calcObj = new Constructor(dummyVal, W, H, isMale);
            break;
          case 'wh':
          default:
            // (value, weight, height)
            calcObj = new Constructor(dummyVal, W, H);
            break;
        }
      }
    } catch (err) {
      console.warn("Calculation error for " + paramDef.id + ": ", err);
    }

    if (!calcObj) {
      return { lln: '--', mean: '--', uln: '--', zScore: null, percentile: null, diff: null, diffPct: null };
    }

    // Get reference range values — DO NOT modify calcObj.bsa or any internal state
    var llnRaw = calcObj.getValueFromZ(-2);
    var meanRaw = calcObj.getValueFromZ(0);
    var ulnRaw = calcObj.getValueFromZ(2);

    var lln = (llnRaw === -100 || isNaN(llnRaw)) ? '--' : llnRaw.toFixed(1);
    var mean = (meanRaw === -100 || isNaN(meanRaw)) ? '--' : meanRaw.toFixed(1);
    var uln = (ulnRaw === -100 || isNaN(ulnRaw)) ? '--' : ulnRaw.toFixed(1);

    var zScore = null;
    var percentile = null;
    var diff = null;
    var diffPct = null;

    // If user entered a measured value, compute Z-score and discrepancy
    if (measuredVal !== 0 && meanRaw !== -100 && !isNaN(meanRaw)) {
      // Create a FRESH object with the actual measured value for Z-score computation
      var calcObjMeasured = null;
      try {
        switch (paramDef.argType) {
          case 'age':
            calcObjMeasured = new Constructor(measuredVal, ageMonths);
            break;
          case 'whm':
            calcObjMeasured = new Constructor(measuredVal, W, H, isMale);
            break;
          case 'wh':
          default:
            calcObjMeasured = new Constructor(measuredVal, W, H);
            break;
        }
      } catch(e) { /* ignore */ }

      if (calcObjMeasured) {
        var zRaw = calcObjMeasured.getZFromValue(measuredVal);
        if (zRaw !== -100 && !isNaN(zRaw)) {
          zScore = zRaw.toFixed(2);
          var auc = get_auc_from_z(zRaw);
          percentile = formatPercentile(auc);
          diff = (measuredVal - meanRaw).toFixed(1);
          diffPct = (((measuredVal - meanRaw) / meanRaw) * 100).toFixed(1);
        }
      }
    }

    return { lln: lln, mean: mean, uln: uln, zScore: zScore, percentile: percentile, diff: diff, diffPct: diffPct, rawMean: meanRaw };
  }

  // DOM Elements Initialization
  document.addEventListener('DOMContentLoaded', function () {
    initUI();
    updateCalculations();
  });

  function initUI() {
    // Weight & Height Inputs — start empty
    var inputWeight = document.getElementById('inputWeight');
    var inputHeight = document.getElementById('inputHeight');
    var inputAgeYears = document.getElementById('inputAgeYears');
    var inputAgeMonths = document.getElementById('inputAgeMonths');

    if (inputWeight) {
      inputWeight.value = '';
      inputWeight.addEventListener('input', function () {
        state.weight = parseFloat(this.value) || 0;
        updateCalculations();
      });
    }

    if (inputHeight) {
      inputHeight.value = '';
      inputHeight.addEventListener('input', function () {
        state.height = parseFloat(this.value) || 0;
        updateCalculations();
      });
    }

    if (inputAgeYears && inputAgeMonths) {
      inputAgeYears.value = '';
      inputAgeMonths.value = '';
      var updateAge = function() {
        var y = parseFloat(inputAgeYears.value) || 0;
        var m = parseFloat(inputAgeMonths.value) || 0;
        state.ageMonths = (y * 12) + m;
        updateCalculations();
      };
      inputAgeYears.addEventListener('input', updateAge);
      inputAgeMonths.addEventListener('input', updateAge);
    }

    // Gender Buttons
    var genderBtns = document.querySelectorAll('.segmented-btn');
    genderBtns.forEach(function(btn) {
      btn.addEventListener('click', function () {
        genderBtns.forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        state.gender = this.id === 'btnGenderMale' ? 'male' : 'female';
        updateCalculations();
      });
    });

    // BSA Formula Selector
    var bsaOptionBtns = document.querySelectorAll('.bsa-opt-btn');
    bsaOptionBtns.forEach(function(btn) {
      btn.addEventListener('click', function () {
        bsaOptionBtns.forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        state.bsaFormula = this.getAttribute('data-formula');
        updateCalculations();
      });
    });

    // Comparison Toggle
    var compToggle = document.getElementById('toggleComparison');
    if (compToggle) {
      compToggle.addEventListener('change', function () {
        state.comparisonMode = this.checked;
        renderParameters();
      });
    }

    // Category Tabs
    var tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(function(btn) {
      btn.addEventListener('click', function () {
        tabBtns.forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        state.activeCategory = this.getAttribute('data-category');
        renderParameters();
      });
    });

    // Search Input Filter
    var searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        state.searchQuery = this.value.toLowerCase().trim();
        renderParameters();
      });
    }

    // Reference Modal Controls
    var modalOverlay = document.getElementById('refModalOverlay');
    var modalClose = document.getElementById('refModalClose');
    if (modalClose && modalOverlay) {
      modalClose.addEventListener('click', function() { modalOverlay.classList.remove('active'); });
      modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) modalOverlay.classList.remove('active');
      });
    }

    // Report Generator Button
    var btnReport = document.getElementById('btnExportReport');
    if (btnReport) {
      btnReport.addEventListener('click', generateReportModal);
    }
  }

  // Update All BSA & Parameter Calculations
  function updateCalculations() {
    state.bsaValue = computeBSA(state.height, state.weight, state.bsaFormula);

    // Update BSA display element
    var bsaDisplay = document.getElementById('displayBsaValue');
    var bsaFormulaBadge = document.getElementById('displayBsaFormula');

    if (bsaDisplay) {
      bsaDisplay.textContent = state.bsaValue > 0 ? state.bsaValue.toFixed(2) + ' m²' : '-- m²';
    }

    if (bsaFormulaBadge) {
      var formulaNames = {
        'mosteller': 'Mosteller: √(W×H/3600)',
        'dubois': 'DuBois: 0.007184×W^0.425×H^0.725',
        'haycock': 'Haycock: 0.024265×H^0.3964×W^0.5378',
        'boyd': 'Boyd: 0.0003207×H^0.3×(W*1000)^exp'
      };
      bsaFormulaBadge.textContent = formulaNames[state.bsaFormula] || state.bsaFormula;
    }

    renderParameters();
  }

  // Render Parameters Grid / List
  function renderParameters() {
    var container = document.getElementById('parametersContainer');
    if (!container) return;

    var filtered = PARAMETERS.filter(function(param) {
      // Category filter
      if (state.activeCategory !== 'all' && param.category !== state.activeCategory) {
        return false;
      }
      // Search query filter
      if (state.searchQuery) {
        var query = state.searchQuery;
        return param.id.toLowerCase().indexOf(query) !== -1 ||
          param.symbol.toLowerCase().indexOf(query) !== -1 ||
          param.name.toLowerCase().indexOf(query) !== -1;
      }
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);"><p style="font-size: 16px; font-weight: 600;">No parameters match your filter.</p></div>';
      return;
    }

    var html = '';
    filtered.forEach(function(param) {
      var calc = calculateParameter(param);
      var refName = REF_KEY_MAP[param.refKey] || 'Reference';

      html += '<div class="param-card" data-param-id="' + param.id + '">';
      html += '  <div class="param-header">';
      html += '    <div class="param-title-group">';
      html += '      <span class="param-symbol">' + param.symbol + '</span>';
      html += '      <span class="param-fullname">' + param.name + '</span>';
      html += '    </div>';
      html += '    <button class="ref-btn" data-ref-key="' + refName + '">';
      html += '      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
      html += '      ' + refName;
      html += '    </button>';
      html += '  </div>';

      html += '  <div class="range-grid">';
      html += '    <div class="range-item">';
      html += '      <span class="range-label">LLN (-2z)</span>';
      html += '      <span class="range-val">' + calc.lln + (calc.lln !== '--' ? ' ' + param.unit : '') + '</span>';
      html += '    </div>';
      html += '    <div class="range-item">';
      html += '      <span class="range-label">Expected Mean (0z)</span>';
      html += '      <span class="range-val mean">' + calc.mean + (calc.mean !== '--' ? ' ' + param.unit : '') + '</span>';
      html += '    </div>';
      html += '    <div class="range-item">';
      html += '      <span class="range-label">ULN (+2z)</span>';
      html += '      <span class="range-val">' + calc.uln + (calc.uln !== '--' ? ' ' + param.unit : '') + '</span>';
      html += '    </div>';
      html += '    <div class="range-item">';
      html += '      <span class="range-label">Unit</span>';
      html += '      <span class="range-val" style="color: var(--text-subtle);">' + param.unit + '</span>';
      html += '    </div>';
      html += '  </div>';

      // Quick reference hint when no patient data entered
      if (calc.mean === '--') {
        html += '<div style="padding: 6px 14px; font-size: 12px; color: var(--accent-blue); opacity: 0.7; font-style: italic;">Enter patient Weight & Height to see expected values (e.g. ' + param.hint + ' ' + param.unit + ')</div>';
      }

      // Optional Comparison Box
      if (state.comparisonMode) {
        var val = state.measuredValues[param.id] || '';
        var zBadge = '';
        var pctBadge = '';
        var diffBadge = '';
        var statusTag = '';
        var markerPos = 50;

        if (calc.zScore !== null) {
          var zNum = parseFloat(calc.zScore);
          markerPos = Math.max(0, Math.min(100, ((zNum + 3) / 6) * 100));

          var statusClass = 'normal';
          var statusText = 'Normal Range';

          if (zNum > 2.0) {
            statusClass = 'danger';
            statusText = 'Dilated / High (+2z)';
          } else if (zNum < -2.0) {
            statusClass = 'warning';
            statusText = 'Small / Low (-2z)';
          }

          zBadge = '<span class="stat-badge zscore">' + calc.zScore + ' z</span>';
          pctBadge = '<span class="stat-badge percentile">' + calc.percentile + ' P.</span>';
          diffBadge = '<span class="stat-badge diff">Δ ' + (calc.diff > 0 ? '+' : '') + calc.diff + ' ' + param.unit + ' (' + (calc.diffPct > 0 ? '+' : '') + calc.diffPct + '%)</span>';
          statusTag = '<span class="status-tag ' + statusClass + '">' + statusText + '</span>';
        }

        html += '<div class="measured-comparison-box">';
        html += '  <div class="measured-input-group">';
        html += '    <label for="input_' + param.id + '">Measured Value</label>';
        html += '    <div class="input-wrapper">';
        html += '      <input type="number" step="0.1" id="input_' + param.id + '" class="input-field measured-param-input" data-param-id="' + param.id + '" value="' + val + '" placeholder="e.g. ' + param.hint + '">';
        html += '      <span class="input-unit">' + param.unit + '</span>';
        html += '    </div>';
        html += '  </div>';
        html += '  <div class="comparison-results-group">';
        html += '    <div class="comparison-stats">';
        html += '      ' + zBadge;
        html += '      ' + pctBadge;
        html += '      ' + diffBadge;
        html += '      ' + statusTag;
        html += '    </div>';

        if (calc.zScore !== null) {
          html += '<div class="zscore-bar-container">';
          html += '  <div class="zscore-marker" style="left: ' + markerPos + '%;"></div>';
          html += '</div>';
          html += '<div class="zscore-ticks">';
          html += '  <span>-3z</span><span>-2z</span><span>0z</span><span>+2z</span><span>+3z</span>';
          html += '</div>';
        } else {
          html += '<div style="font-size: 12px; color: var(--text-subtle); font-style: italic;">Enter measured value above to evaluate discrepancy and Z-score.</div>';
        }
        html += '  </div>';
        html += '</div>';
      }

      html += '</div>';
    });

    container.innerHTML = html;

    // Attach Event Listeners to Reference Buttons
    container.querySelectorAll('.ref-btn').forEach(function(btn) {
      btn.addEventListener('click', function () {
        var refName = this.getAttribute('data-ref-key');
        openReferenceModal(refName);
      });
    });

    // Attach Event Listeners to Measured Input Fields
    if (state.comparisonMode) {
      container.querySelectorAll('.measured-param-input').forEach(function(input) {
        input.addEventListener('input', function () {
          var paramId = this.getAttribute('data-param-id');
          state.measuredValues[paramId] = this.value;
          renderParameters();
          // Restore cursor/focus
          var nextInput = document.getElementById('input_' + paramId);
          if (nextInput) {
            nextInput.focus();
            nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
          }
        });
      });
    }
  }

  // Open Reference Information Modal
  function openReferenceModal(refName) {
    var refData = REFERENCE_DATA[refName];
    if (!refData) return;

    document.getElementById('modalRefTitle').textContent = refName;
    document.getElementById('modalRefSubtitle').textContent = refData.title;
    document.getElementById('modalRefAuthors').textContent = refData.authors;
    document.getElementById('modalRefJournal').textContent = refData.journal;
    document.getElementById('modalRefPopulation').textContent = refData.population;
    document.getElementById('modalRefMethod').textContent = refData.method;

    var pubmedLink = document.getElementById('modalRefPubmed');
    if (pubmedLink) {
      pubmedLink.href = refData.pubmed;
    }

    var overlay = document.getElementById('refModalOverlay');
    if (overlay) overlay.classList.add('active');
  }

  // Generate Medical Echo Report Summary
  function generateReportModal() {
    var reportText = 'PEDZ ECHOCARDIOGRAPHY REPORT\n';
    reportText += 'Date: ' + new Date().toLocaleDateString() + '\n';
    reportText += 'Patient: Weight ' + state.weight + ' kg, Height ' + state.height + ' cm (' + state.gender.toUpperCase() + ')\n';
    reportText += 'BSA: ' + state.bsaValue.toFixed(2) + ' m² (' + state.bsaFormula.toUpperCase() + ')\n\n';
    reportText += 'MEASUREMENT RESULTS & REFERENCE Z-SCORES:\n';
    reportText += '--------------------------------------------------\n';

    var activeCount = 0;
    PARAMETERS.forEach(function(param) {
      var calc = calculateParameter(param);
      if (state.measuredValues[param.id] && calc.zScore !== null) {
        activeCount++;
        var val = state.measuredValues[param.id];
        var refName = REF_KEY_MAP[param.refKey] || '';
        reportText += param.symbol + ' (' + param.name + '): ' + val + ' ' + param.unit + ' (Mean: ' + calc.mean + ', Z: ' + calc.zScore + ', ' + calc.percentile + ' P.) [Ref: ' + refName + ']\n';
      }
    });

    if (activeCount === 0) {
      reportText += '(No individual measurements entered. Enable comparison mode to enter values.)\n\n';
      reportText += 'SUMMARY OF REFERENCE RANGES (-2z to +2z):\n';
      PARAMETERS.slice(0, 10).forEach(function(param) {
        var calc = calculateParameter(param);
        reportText += param.symbol + ': ' + calc.lln + ' - ' + calc.uln + ' ' + param.unit + ' (Mean: ' + calc.mean + ')\n';
      });
    }

    alert(reportText);
  }

})();
