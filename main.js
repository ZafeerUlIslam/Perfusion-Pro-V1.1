/**
 * ═══════════════════════════════════════════════════════════
 *   PERFUSION PRO SUITE — Main Engine
 *   Author: Zafeer ul Islam
 *   Version: 2.2
 * ═══════════════════════════════════════════════════════════
 *
 *  Core logic and calculations unchanged from v2.0/2.1.
 *  NEW v2.2:
 *    — Kirklin PA Ring module integrated (weight-based)
 *    — Valve Size Reference module integrated (BSA-based)
 *    — Z-Score module retained from v2.1
 *    — Deep Tech dark UI design applied
 */

const zScoreModal = document.createElement('div');
zScoreModal.id = 'zscore-modal';
zScoreModal.className = 'modal-overlay';
document.body.appendChild(zScoreModal);

const cpbHctModal = document.createElement('div');
cpbHctModal.id = 'cpb-hct-modal';
cpbHctModal.className = 'modal-overlay';
document.body.appendChild(cpbHctModal);

const gdpModal = document.createElement('div');
gdpModal.id = 'gdp-modal';
gdpModal.className = 'modal-overlay';
document.body.appendChild(gdpModal);

// ── DOM References ──────────────────────────────────────────
const weightInput = document.getElementById('weight');
const heightInput = document.getElementById('height');
const ageInput = document.getElementById('age');
const ageUnitSelect = document.getElementById('age-unit');
const diseaseInput = document.getElementById('disease-input');
const diseaseHint = document.getElementById('disease-hint');
const diseaseToggle = document.getElementById('disease-toggle');
const diseaseDropdown = document.getElementById('disease-dropdown');
const resultsContainer = document.getElementById('results-container');
const statusDiv = document.getElementById('status');
const bsaFormulaHint = document.getElementById('bsa-formula-hint');
const ageHint = document.getElementById('age-hint');

function getDiseaseEntries() {
    if (typeof searchDiseases !== 'function' || typeof getDiseaseOptions !== 'function') return [];

    return getDiseaseOptions().map(option => {
        const [namePart, ...rest] = option.split(' - ');
        const name = namePart?.trim() || option;
        const fullName = rest.join(' - ').trim();
        return { name, fullName, label: option };
    });
}

function closeDiseaseDropdown() {
    if (!diseaseDropdown) return;
    diseaseDropdown.classList.remove('active');
}

function renderDiseaseDropdown(query = '') {
    if (!diseaseDropdown || typeof searchDiseases !== 'function') return;

    const trimmedQuery = query.trim();
    const matches = trimmedQuery ? searchDiseases(trimmedQuery) : getDiseaseEntries();

    if (!matches.length) {
        diseaseDropdown.innerHTML = '<div class="disease-empty">No diseases found.</div>';
        diseaseDropdown.classList.add('active');
        return;
    }

    diseaseDropdown.innerHTML = matches.map(disease => `
        <button type="button" class="disease-option" data-disease-name="${disease.name}" aria-label="Select ${disease.name}">
            <span class="disease-option-main">${disease.name}</span>
            <span class="disease-option-sub">${disease.fullName}</span>
        </button>
    `).join('');

    diseaseDropdown.classList.add('active');
}

function openDiseaseDropdown() {
    renderDiseaseDropdown('');
}

function selectDiseaseByName(name) {
    if (!diseaseInput) return;

    const disease = typeof getDiseaseByName === 'function' ? getDiseaseByName(name) : null;
    diseaseInput.value = disease ? `${disease.name} - ${disease.fullName}` : name;
    closeDiseaseDropdown();
    updateApp();
}

if (diseaseInput) {
    diseaseInput.addEventListener('focus', () => {
        renderDiseaseDropdown(diseaseInput.value);
    });

    diseaseInput.addEventListener('click', () => {
        renderDiseaseDropdown(diseaseInput.value);
    });

    diseaseInput.addEventListener('input', () => {
        renderDiseaseDropdown(diseaseInput.value);
    });
}

if (diseaseToggle) {
    diseaseToggle.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openDiseaseDropdown();
    });
}

if (diseaseDropdown) {
    diseaseDropdown.addEventListener('click', (event) => {
        const option = event.target.closest('[data-disease-name]');
        if (!option) return;
        selectDiseaseByName(option.getAttribute('data-disease-name'));
    });
}

document.addEventListener('click', (event) => {
    if (!diseaseDropdown || !diseaseInput || !diseaseToggle) return;
    const withinPicker = diseaseInput.contains(event.target) || diseaseToggle.contains(event.target) || diseaseDropdown.contains(event.target);
    if (!withinPicker) closeDiseaseDropdown();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        if (typeof closeZScore === 'function' && zScoreModal.classList.contains('active')) closeZScore();
        if (typeof closeCpbHct === 'function' && cpbHctModal.classList.contains('active')) closeCpbHct();
        closeDiseaseDropdown();
    }
});

// ── 3D IMAGE ANIMATION ──────────────────────────────────────
const imageWrapper = document.getElementById('imageWrapper');
const heroImage = document.getElementById('heroImage');
const lightGlow = document.getElementById('lightGlow');
const perspectiveContainer = document.querySelector('.perspective-container');

if (imageWrapper && heroImage) {
    let mouseX = 0, mouseY = 0;
    let isDesktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let isMouseOverImage = false;

    // Reset 3D transform to normal
    function resetTransform() {
        imageWrapper.style.transform = `
            perspective(1000px)
            rotateX(0deg)
            rotateY(0deg)
            translateZ(0px)
        `;
        lightGlow.style.opacity = '0';
    }

    // Desktop: Cursor movement triggers 3D tilt only over image
    if (isDesktop) {
        perspectiveContainer?.addEventListener('mouseenter', () => {
            isMouseOverImage = true;
        });

        perspectiveContainer?.addEventListener('mouseleave', () => {
            isMouseOverImage = false;
            resetTransform();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isMouseOverImage || !perspectiveContainer) return;

            const rect = perspectiveContainer.getBoundingClientRect();

            // Only apply effect if mouse is within container bounds
            if (e.clientX < rect.left || e.clientX > rect.right ||
                e.clientY < rect.top || e.clientY > rect.bottom) {
                isMouseOverImage = false;
                resetTransform();
                return;
            }

            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            mouseX = e.clientX - centerX;
            mouseY = e.clientY - centerY;

            // 3D Tilt Transform
            const rotateY = (mouseX / rect.width) * 15;
            const rotateX = -(mouseY / rect.height) * 15;

            imageWrapper.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateZ(50px)
            `;

            // Dynamic light follow cursor
            const lightX = (mouseX / rect.width) * 100 + 50;
            const lightY = (mouseY / rect.height) * 100 + 50;
            lightGlow.style.opacity = '0.8';
            lightGlow.style.left = lightX + '%';
            lightGlow.style.top = lightY + '%';
            lightGlow.style.transform = 'translate(-50%, -50%)';
        });
    }

    // Mobile: 3D effect only when image is in viewport center
    if (!isDesktop) {
        window.addEventListener('scroll', () => {
            if (!perspectiveContainer) return;

            const rect = perspectiveContainer.getBoundingClientRect();
            const elementCenter = rect.top + rect.height / 2;
            const viewportCenter = window.innerHeight / 2;
            const offset = elementCenter - viewportCenter;

            // Only apply 3D effect if image is roughly in center of viewport
            const isInViewport = Math.abs(offset) < window.innerHeight * 0.3;

            if (!isInViewport) {
                resetTransform();
                return;
            }

            // Apply subtle tilt based on scroll position
            const rotateX = (offset / window.innerHeight) * 8;
            const rotateY = (offset / window.innerHeight) * -6;

            imageWrapper.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateZ(30px)
            `;

            // Mobile light effect
            const lightIntensity = 0.7 - Math.abs(offset) / window.innerHeight;
            lightGlow.style.opacity = `${Math.max(0, lightIntensity)}`;
            lightGlow.style.left = '50%';
            lightGlow.style.top = '50%';
            lightGlow.style.transform = 'translate(-50%, -50%)';
        });
    }

    // Touch support for mobile (when finger directly on image)
    perspectiveContainer?.addEventListener('touchmove', (e) => {
        if (isDesktop) return;

        const touch = e.touches[0];
        const rect = perspectiveContainer.getBoundingClientRect();

        // Only apply effect if touch is within image bounds
        if (touch.clientX < rect.left || touch.clientX > rect.right ||
            touch.clientY < rect.top || touch.clientY > rect.bottom) {
            resetTransform();
            return;
        }

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const relX = touch.clientX - centerX;
        const relY = touch.clientY - centerY;

        const rotateY = (relX / rect.width) * 12;
        const rotateX = -(relY / rect.height) * 12;

        imageWrapper.style.transform = `
            perspective(1000px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            translateZ(40px)
        `;

        lightGlow.style.opacity = '0.7';
        lightGlow.style.left = (relX / rect.width * 100 + 50) + '%';
        lightGlow.style.top = (relY / rect.height * 100 + 50) + '%';
        lightGlow.style.transform = 'translate(-50%, -50%)';
    });

    perspectiveContainer?.addEventListener('touchend', resetTransform);
}

// ── Helper: Age to years ─────────────────────────────────────
function getAgeInYears() {
    const raw = parseFloat(ageInput.value);
    if (isNaN(raw) || raw < 0) return null;
    return ageUnitSelect.value === 'months' ? raw / 12 : raw;
}

function getSelectedDisease() {
    if (!diseaseInput || typeof searchDiseases !== 'function') return null;

    const query = diseaseInput.value.trim();
    if (!query) return null;

    const exactName = typeof getDiseaseByName === 'function'
        ? getDiseaseByName(query)
        : null;
    if (exactName) return exactName;

    const prefix = query.split(' - ')[0]?.trim();
    if (prefix && typeof getDiseaseByName === 'function') {
        const prefixedMatch = getDiseaseByName(prefix);
        if (prefixedMatch) return prefixedMatch;
    }

    const matches = searchDiseases(query);
    return matches.length === 1 ? matches[0] : null;
}

function updateDiseaseHint() {
    if (!diseaseHint || typeof searchDiseases !== 'function') return;

    const query = diseaseInput ? diseaseInput.value.trim() : '';
    if (!query) {
        diseaseHint.textContent = 'Type a disease name and choose from the suggestions.';
        diseaseHint.style.color = '';
        return;
    }

    const selectedDisease = getSelectedDisease();
    if (selectedDisease) {
        diseaseHint.textContent = `Selected: ${selectedDisease.name} · ${selectedDisease.fullName}`;
        diseaseHint.style.color = '#15803d';
        return;
    }

    const matches = searchDiseases(query);
    if (matches.length === 0) {
        diseaseHint.textContent = 'No disease match found yet.';
        diseaseHint.style.color = '#b91c1c';
    } else {
        diseaseHint.textContent = `${matches.length} match${matches.length === 1 ? '' : 'es'} found. Pick one from the list.`;
        diseaseHint.style.color = '#1e40af';
    }

    if (diseaseDropdown?.classList.contains('active')) {
        renderDiseaseDropdown(query);
    }
}

// ── Helper: Live hints ───────────────────────────────────────
function updateHints() {
    const h = parseFloat(heightInput.value);
    if (h && h > 0) {
        bsaFormulaHint.textContent = '✓ Formula: Mosteller (Height + Weight)';
        bsaFormulaHint.style.color = '#34d399';
    } else {
        bsaFormulaHint.textContent = 'Formula: Weight-only (Simplified)';
        bsaFormulaHint.style.color = '';
    }

    const ageVal = parseFloat(ageInput.value);
    const unit = ageUnitSelect.value;
    if (!isNaN(ageVal) && ageVal >= 0) {
        const inYears = unit === 'months' ? ageVal / 12 : ageVal;
        if (inYears === 0) ageHint.textContent = '👶 Neonate — CI: 3.0 L/min/m²';
        else if (inYears <= 2) ageHint.textContent = '👶 Infant (≤2 yr) — CI: 3.0 L/min/m²';
        else if (inYears <= 4) ageHint.textContent = '🧒 Toddler (2–4 yr) — CI: 2.8 L/min/m²';
        else if (inYears <= 6) ageHint.textContent = '🧒 Child (4–6 yr) — CI: 2.6 L/min/m²';
        else ageHint.textContent = '🧑 Older child (>6 yr) — CI: 2.4 L/min/m²';
    } else {
        ageHint.textContent = 'Enter 0 for neonates';
    }
}

// ── Menu Logic ─────────────────────────────────────────────
function toggleMenu() {
    const menu = document.getElementById('dropdown-menu');
    if (menu) menu.classList.toggle('active');
}

function handleMenuClick(appId) {
    const menu = document.getElementById('dropdown-menu');
    if (menu) menu.classList.remove('active');

    if (appId === 'zscore') {
        openZScore();
    } else if (appId === 'hct-calc') {
        openCpbHct();
    } else if (appId === 'gdp-calc') {
        openGdp();
    }
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    const container = document.querySelector('.menu-container');
    const menu = document.getElementById('dropdown-menu');
    if (menu && container && !container.contains(e.target)) {
        menu.classList.remove('active');
    }
});

// ── Reference Card Toggle ────────────────────────────────────
function toggleReference(refId) {
    const card = document.getElementById(`card-${refId}`);
    const front = document.getElementById(`front-${refId}`);
    const back = document.getElementById(`back-${refId}`);

    if (!card || !front || !back) return;

    card.classList.toggle('flipped');
}

function renderDiseaseCard(disease, weight) {
    if (!disease) return '';

    const accent = disease.type.toLowerCase() === 'cyanotic'
        ? '#8b5cf6'
        : disease.type.toLowerCase() === 'arrhythmia'
            ? '#ef4444'
            : '#06b6d4';

    const planItems = Array.isArray(disease.treatmentPlan) && disease.treatmentPlan.length > 0
        ? disease.treatmentPlan
        : ['Treatment plan details to be added.'];

    return `
        <div class="result-card" id="card-disease-result" style="--card-accent: ${accent};">
            <div id="front-disease-result" class="card-front">
                <div class="card-header">
                    <span class="card-icon">🫀</span>
                    <div class="label">Disease Profile</div>
                    <button class="ref-btn" onclick="toggleReference('disease-result')" title="Clinical Details">?</button>
                </div>
                <div class="value" style="font-size:1.7rem;">${disease.name}</div>
                <div class="disease-tag-row">
                    <span class="disease-tag">${disease.category}</span>
                    <span class="disease-tag">${disease.type}</span>
                </div>
                <p class="disease-summary">${disease.summary || disease.fullName}</p>
                <div class="disease-detail-grid">
                    <div class="disease-detail-box">
                        <div class="disease-detail-label">Full Name</div>
                        <div class="disease-detail-value">${disease.fullName}</div>
                    </div>
                    <div class="disease-detail-box">
                        <div class="disease-detail-label">Type</div>
                        <div class="disease-detail-value">${disease.category} · ${disease.type}</div>
                    </div>
                </div>
                <div class="disease-plan-title">Treatment Plan</div>
                <ul class="disease-plan">
                    ${planItems.map(item => `<li>${item}</li>`).join('')}
                </ul>
                ${weight ? '' : `
                    <div class="disease-note-box">
                        <span class="disease-note-icon">ℹ️</span>
                        <span>Enter weight to generate the perfusion calculations beneath this disease profile.</span>
                    </div>
                `}
            </div>
            <div id="back-disease-result" class="card-back">
                <div class="card-header">
                    <span class="card-icon">🫀</span>
                    <div class="label">Disease Profile</div>
                    <button class="ref-btn" onclick="toggleReference('disease-result')" title="Back to Results">?</button>
                </div>
                <div class="ref-back-text">
                    <div class="ref-back-title">Disease Reference</div>
                    <strong>Selection</strong>
                    <p>${disease.name} — ${disease.fullName}</p>
                    <strong>Category</strong>
                    <p>${disease.category} · ${disease.type}</p>
                    <strong>Notes</strong>
                    <p>Use this card as a placeholder for your institution-specific disease details, treatment plan, and post-op pathway.</p>
                    <strong>Extensibility</strong>
                    <p>You can add more fields to diseases.js later without changing the output layout.</p>
                </div>
            </div>
        </div>
    `;
}

// ── Calculate & Reset Controls ──────────────────────────────
function calculateAll() {
    updateApp();
    const weight = parseFloat(weightInput.value);
    if (!weight || weight <= 0) {
        statusDiv.innerHTML = '<span class="status-dot dot-warn"></span>Please enter patient weight to calculate.';
        statusDiv.className = 'status warn';
        return;
    }
    statusDiv.innerHTML = '<span class="status-dot dot-ready"></span>All parameters calculated successfully';
    statusDiv.className = 'status ready';

    if (window.innerWidth <= 768) {
        const resultsEl = document.querySelector('.results-section');
        if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth' });
    }
}

function resetAll() {
    weightInput.value = '';
    heightInput.value = '';
    ageInput.value = '';
    ageUnitSelect.value = 'years';
    if (diseaseInput) diseaseInput.value = '';
    closeDiseaseDropdown();

    resultsContainer.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">
                <svg viewBox="0 0 60 60" fill="none" width="56" height="56">
                    <circle cx="30" cy="30" r="28" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3" opacity="0.3"/>
                    <path d="M20 30 Q30 18 40 30 Q30 42 20 30Z" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.5"/>
                    <circle cx="30" cy="30" r="3" fill="currentColor" opacity="0.4"/>
                </svg>
            </div>
            <p>Enter patient data to generate<br>the complete perfusion profile.</p>
        </div>`;

    statusDiv.innerHTML = '<span class="status-dot"></span>Awaiting input...';
    statusDiv.className = 'status';
    bsaFormulaHint.textContent = 'Formula: Weight-only (Simplified)';
    bsaFormulaHint.style.color = '';
    ageHint.textContent = 'Enter 0 for neonates';
    if (diseaseHint) {
        diseaseHint.textContent = 'Type a disease name and choose from the suggestions.';
        diseaseHint.style.color = '';
    }

    if (typeof syncHubPatientSummary === 'function') {
        syncHubPatientSummary();
    }
}

// ── Patient Metrics Hub Synchronization ─────────────────────
function syncHubPatientSummary() {
    const summaryEl = document.getElementById('hub-patient-summary');
    if (!summaryEl) return;

    const weightVal = weightInput ? parseFloat(weightInput.value) : NaN;
    const heightVal = heightInput ? parseFloat(heightInput.value) : NaN;
    const ageVal = ageInput ? parseFloat(ageInput.value) : NaN;
    const unitVal = ageUnitSelect ? ageUnitSelect.value : 'years';

    const tags = [];
    if (!isNaN(weightVal) && weightVal > 0) {
        tags.push(`Weight: <strong>${weightVal.toFixed(1)} kg</strong>`);
    }
    if (!isNaN(heightVal) && heightVal > 0) {
        tags.push(`Height: <strong>${heightVal.toFixed(0)} cm</strong>`);
    }
    if (!isNaN(ageVal) && ageVal >= 0) {
        tags.push(`Age: <strong>${ageVal} ${unitVal}</strong>`);
    }

    if (!isNaN(weightVal) && weightVal > 0 && typeof calculateBSA === 'function') {
        const bsa = calculateBSA(weightVal, isNaN(heightVal) ? 0 : heightVal);
        if (bsa) tags.push(`BSA: <strong>${bsa} m²</strong>`);
    }

    if (tags.length > 0) {
        summaryEl.innerHTML = tags.join(' &nbsp;·&nbsp; ');
    } else {
        summaryEl.innerHTML = 'No active patient metrics &nbsp;·&nbsp; Click any calculator to enter data';
    }
}

// ── App Modals State Management ──────────────────────────────
function updateModalState() {
    const activeModals = document.querySelectorAll('.modal-overlay.active');
    if (activeModals.length === 0) {
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
    } else {
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
    }
}

// ── General Perfusion & Circuit Modal ────────────────────────
function openGeneral() {
    const generalModal = document.getElementById('general-calc-modal');
    if (generalModal) {
        generalModal.classList.add('active');
        updateModalState();
        if (weightInput && !weightInput.value) {
            setTimeout(() => weightInput.focus(), 150);
        }
    }
}

function closeGeneral() {
    const generalModal = document.getElementById('general-calc-modal');
    if (generalModal) {
        generalModal.classList.remove('active');
        updateModalState();
        syncHubPatientSummary();
    }
}

// ── Z-Score Separate Identity ───────────────────────────────
function openZScore() {
    const weight = parseFloat(weightInput.value);
    const height = parseFloat(heightInput.value);
    const ageYears = getAgeInYears();

    zScoreModal.innerHTML = `
        <div class="modal-content" style="max-width: 1080px;">
            <button class="modal-close" onclick="closeZScore()" title="Close Z-Score Calculator">✕</button>
            <div id="zscore-modal-body"></div>
        </div>
    `;
    zScoreModal.classList.add('active');
    updateModalState();

    const bodyEl = document.getElementById('zscore-modal-body');
    if (bodyEl && typeof renderPedZModal === 'function') {
        renderPedZModal(bodyEl, weight, height, ageYears);
    }
}

function closeZScore() {
    zScoreModal.classList.remove('active');
    updateModalState();
    syncHubPatientSummary();
}

// ── CPB Hematocrit Calculator Modal ─────────────────
function openCpbHct() {
    const weight = parseFloat(weightInput.value);
    const ageYears = getAgeInYears();

    cpbHctModal.innerHTML = `
        <div class="modal-content" style="max-width: 860px;">
            <button class="modal-close" onclick="closeCpbHct()" title="Close CPB Hct Calculator">✕</button>
            ${renderCpbHctContent(weight, ageYears)}
        </div>
    `;
    cpbHctModal.classList.add('active');
    updateModalState();
}

function closeCpbHct() {
    cpbHctModal.classList.remove('active');
    updateModalState();
    syncHubPatientSummary();
}

// ── Goal-Directed Perfusion (GDP) DO2i Calculator Modal ──────
function openGdp() {
    const weight = parseFloat(weightInput.value);
    const height = parseFloat(heightInput.value);
    const bsa = (weight && weight > 0 && typeof calculateBSA === 'function') ? calculateBSA(weight, height) : '';

    gdpModal.innerHTML = `
        <div class="modal-content" style="max-width: 960px;">
            <button class="modal-close" onclick="closeGdp()" title="Close GDP DO₂i Calculator">✕</button>
            ${typeof renderGdpContent === 'function' ? renderGdpContent(weight, height, bsa) : '<p>GDP Module not loaded.</p>'}
        </div>
    `;
    gdpModal.classList.add('active');
    updateModalState();

    if (typeof GDPEngine === 'function') {
        window.gdpApp = new GDPEngine();
    }
}

function closeGdp() {
    gdpModal.classList.remove('active');
    updateModalState();
    syncHubPatientSummary();
}

// Close active modals on backdrop click outside content
document.addEventListener('click', (e) => {
    const generalModal = document.getElementById('general-calc-modal');
    [generalModal, zScoreModal, cpbHctModal, gdpModal].forEach(modal => {
        if (modal && e.target === modal) {
            modal.classList.remove('active');
            updateModalState();
            syncHubPatientSummary();
        }
    });
});

// Close active modals on Escape key press
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const generalModal = document.getElementById('general-calc-modal');
        [generalModal, zScoreModal, cpbHctModal, gdpModal].forEach(modal => {
            if (modal && modal.classList.contains('active')) {
                modal.classList.remove('active');
            }
        });
        updateModalState();
        syncHubPatientSummary();
    }
});

// ── Main Calculation Engine ──────────────────────────────────
function updateApp() {
    updateHints();
    updateDiseaseHint();

    const weight = parseFloat(weightInput.value);
    const height = parseFloat(heightInput.value);
    const ageYears = getAgeInYears();
    const disease = getSelectedDisease();

    const diseaseCard = disease ? renderDiseaseCard(disease, weight) : '';

    // Validation
    if (!weight || weight <= 0) {
        if (diseaseCard) {
            resultsContainer.innerHTML = `
                ${diseaseCard}
                <div class="empty-state">
                    <div class="empty-icon">
                        <svg viewBox="0 0 60 60" fill="none" width="56" height="56">
                            <circle cx="30" cy="30" r="28" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3" opacity="0.3"/>
                            <path d="M20 30 Q30 18 40 30 Q30 42 20 30Z" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.5"/>
                            <circle cx="30" cy="30" r="3" fill="currentColor" opacity="0.4"/>
                        </svg>
                    </div>
                    <p>Enter patient weight to generate the perfusion profile beneath the selected disease.</p>
                </div>`;
            statusDiv.innerHTML = '<span class="status-dot dot-warn"></span>Select weight to continue perfusion calculations.';
            statusDiv.className = 'status warn';
            return;
        }

        resultsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <svg viewBox="0 0 60 60" fill="none" width="56" height="56">
                        <circle cx="30" cy="30" r="28" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3" opacity="0.3"/>
                        <path d="M20 30 Q30 18 40 30 Q30 42 20 30Z" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.5"/>
                        <circle cx="30" cy="30" r="3" fill="currentColor" opacity="0.4"/>
                    </svg>
                </div>
                <p>Enter patient data to generate<br>the complete perfusion profile.</p>
            </div>`;
        statusDiv.innerHTML = '<span class="status-dot"></span>Enter Weight to begin...';
        statusDiv.className = 'status';
        return;
    }

    if (ageYears === null) {
        if (diseaseCard) {
            resultsContainer.innerHTML = `
                ${diseaseCard}
                <div class="empty-state">
                    <div class="empty-icon">
                        <svg viewBox="0 0 60 60" fill="none" width="56" height="56">
                            <circle cx="30" cy="30" r="28" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3" opacity="0.3"/>
                            <path d="M20 30 Q30 18 40 30 Q30 42 20 30Z" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.5"/>
                            <circle cx="30" cy="30" r="3" fill="currentColor" opacity="0.4"/>
                        </svg>
                    </div>
                    <p>Enter patient age to continue the perfusion calculations for the selected disease.</p>
                </div>`;
        }
        statusDiv.innerHTML = '<span class="status-dot dot-warn"></span>Please enter patient age to continue.';
        statusDiv.className = 'status warn';
        return;
    }

    // Run core modules (unchanged logic)
    const bsa = calculateBSA(weight, height);
    const bfData = calculateBloodFlow(bsa, ageYears);
    const oxyData = recommendOxygenator(weight);
    const cannData = recommendCannula(weight);

    if (!bsa || !bfData || !oxyData || !cannData) {
        statusDiv.innerHTML = '<span class="status-dot dot-warn"></span>Calculation error. Check values.';
        statusDiv.className = 'status warn';
        return;
    }

    const heightUsed = height && height > 0;
    const ageDisplay = ageUnitSelect.value === 'months'
        ? `${ageInput.value} months (${ageYears.toFixed(1)} yr)`
        : `${ageYears} yr`;

    resultsContainer.innerHTML = `

        <!-- Patient Summary -->
        <div class="patient-summary">
            <span class="ps-item">⚖️ <strong>${weight} kg</strong></span>
            ${heightUsed ? `<span class="ps-item">📏 <strong>${height} cm</strong></span>` : ''}
            <span class="ps-item">🎂 <strong>${ageDisplay}</strong></span>
        </div>

        ${diseaseCard}

        <!-- ① BSA -->
        <div class="result-card" id="card-bsa-result" style="--card-accent: #3b82f6;">
            <div id="front-bsa-result" class="card-front">
                <div class="card-header">
                    <span class="card-icon">📐</span>
                    <div class="label">Body Surface Area</div>
                    <button class="ref-btn" onclick="toggleReference('bsa-result')" title="Clinical References">?</button>
                </div>
                <div class="value">${bsa} <span class="unit">m²</span></div>
                <div class="note">${heightUsed ? '✓ Mosteller Formula (Height + Weight)' : 'Weight-only Formula'}</div>
            </div>
            <div id="back-bsa-result" class="card-back">
                <div class="card-header">
                    <span class="card-icon">📐</span>
                    <div class="label">Body Surface Area</div>
                    <button class="ref-btn" onclick="toggleReference('bsa-result')" title="Back to Results">?</button>
                </div>
                <div class="ref-back-text">
                    <div class="ref-back-title">Body Surface Area Calculation</div>
                    <strong>Mosteller Formula (with Height):</strong>
                    <div class="ref-back-formula">BSA (m²) = √(Height cm × Weight kg / 3600)</div>
                    <strong>Weight-Only Formula:</strong>
                    <div class="ref-back-formula">BSA = (Weight × 4 + 7) / (Weight + 90)</div>
                    <strong>Primary Source</strong>
                    <p>Mosteller RD. Simplified calculation of body surface area. N Engl J Med. 1987;317(17):1098.</p>
                    <strong>Clinical Application</strong>
                    <p>Used to determine indexed cardiac parameters, oxygenator selection, and valve sizing in pediatric perfusion.</p>
                </div>
            </div>
        </div>

        <!-- ② Blood Flow -->
        <div class="result-card" id="card-bloodflow-result" style="--card-accent: #8b5cf6;">
            <div id="front-bloodflow-result" class="card-front">
                <div class="card-header">
                    <span class="card-icon">🩸</span>
                    <div class="label">Target CPB Blood Flow</div>
                    <button class="ref-btn" onclick="toggleReference('bloodflow-result')" title="Clinical References">?</button>
                </div>
                <div class="value">${bfData.flow} <span class="unit">L/min</span></div>
                <div class="note">CI: ${bfData.ci} L/min/m² · Age-adjusted</div>
                <div class="sub-note">Range: ${(bfData.flow * 0.9).toFixed(2)} – ${(bfData.flow * 1.1).toFixed(2)} L/min (±10%)</div>
                <button type="button" class="gdp-card-launcher" onclick="openGdp()" title="Evaluate Goal-Directed Perfusion and DO2i for this flow">🎯 GDP DO₂i Optimization</button>
            </div>
            <div id="back-bloodflow-result" class="card-back">
                <div class="card-header">
                    <span class="card-icon">🩸</span>
                    <div class="label">Target CPB Blood Flow</div>
                    <button class="ref-btn" onclick="toggleReference('bloodflow-result')" title="Back to Results">?</button>
                </div>
                <div class="ref-back-text">
                    <div class="ref-back-title">Cardiac Index & Blood Flow</div>
                    <strong>Age-Based Cardiac Index (CI):</strong>
                    <p>• Neonates (0–2 yr): CI = <strong>3.0</strong> L/min/m²</p>
                    <p>• Infants (2–4 yr): CI = <strong>2.8</strong> L/min/m²</p>
                    <p>• Young Children (4–6 yr): CI = <strong>2.6</strong> L/min/m²</p>
                    <p>• Older Children (>6 yr): CI = <strong>2.4</strong> L/min/m²</p>
                    <strong>Formula</strong>
                    <div class="ref-back-formula">Flow (L/min) = BSA (m²) × CI (L/min/m²)</div>
                    <strong>Source</strong>
                    <p>Barratt-Boyes BG, Kirklin JW. Cardiac Surgery, 2nd Edition. Pediatric perfusion guidelines based on age-indexed cardiac indices.</p>
                </div>
            </div>
        </div>

        <!-- ③ Oxygenator -->
        <div class="result-card" id="card-oxygenator-result" style="--card-accent: #10b981;">
            <div id="front-oxygenator-result" class="card-front">
                <div class="card-header">
                    <span class="card-icon">🫁</span>
                    <div class="label">Recommended Oxygenator</div>
                    <button class="ref-btn" onclick="toggleReference('oxygenator-result')" title="Clinical References">?</button>
                </div>
                <div class="value oxy-name">${oxyData.model}</div>
                <div class="note">Circuit Prime: ${oxyData.totalPrime} mL</div>
                <div class="sub-note">Static Prime: ${oxyData.staticPrime} mL</div>
            </div>
            <div id="back-oxygenator-result" class="card-back">
                <div class="card-header">
                    <span class="card-icon">🫁</span>
                    <div class="label">Recommended Oxygenator</div>
                    <button class="ref-btn" onclick="toggleReference('oxygenator-result')" title="Back to Results">?</button>
                </div>
                <div class="ref-back-text">
                    <div class="ref-back-title">Oxygenator Selection & Priming</div>
                    <strong>&lt;9 kg → BabyFX 05:</strong>
                    <p>Total Prime 350–450 mL (Static ~31 mL)</p>
                    <strong>9–30 kg → Trilly:</strong>
                    <p>Total Prime 550–600 mL (Static ~45 mL)</p>
                    <strong>&gt;30 kg → Skipper:</strong>
                    <p>Total Prime 1200–1400 mL (Static ~70 mL)</p>
                    <strong>Source</strong>
                    <p>Manufacturer specifications (Sorin Group, Medtronic). Prime volumes include tubing volume estimates for standard CPB circuits.</p>
                    <strong>Note</strong>
                    <p>Adjust based on circuit configuration, temperature gradient, and priming strategy.</p>
                </div>
            </div>
        </div>

        <!-- ④ Cannula -->
        <div class="result-card cannula-card" id="card-cannula-result" style="--card-accent: #ef4444;">
            <div id="front-cannula-result" class="card-front">
                <div class="card-header">
                    <span class="card-icon">🩺</span>
                    <div class="label">Cannula Sizes — Bi-Caval + Aortic</div>
                    <button class="ref-btn" onclick="toggleReference('cannula-result')" title="Clinical References">?</button>
                </div>
                <div class="cannula-section-title">Venous Cannulation (Bi-Caval)</div>
                <div class="cannula-grid">
                    <div class="cannula-item">
                        <div class="cannula-label">SVC</div>
                        <div class="cannula-value">${cannData.svc}</div>
                        <div class="cannula-unit">French</div>
                    </div>
                    <div class="cannula-item">
                        <div class="cannula-label">IVC</div>
                        <div class="cannula-value">${cannData.ivc}</div>
                        <div class="cannula-unit">French</div>
                    </div>
                    <div class="cannula-item cannula-flow">
                        <div class="cannula-label">Est. Flow</div>
                        <div class="cannula-value cannula-flow-val">${cannData.flowRange}</div>
                    </div>
                </div>
                <div class="cannula-section-title" style="margin-top:10px;">Aortic Cannulation</div>
                <div class="cannula-grid cannula-grid-2">
                    <div class="cannula-item cannula-aortic">
                        <div class="cannula-label">Size (mm)</div>
                        <div class="cannula-value">${cannData.aorticMm || cannData.aortic}</div>
                        <div class="cannula-unit">mm OD</div>
                    </div>
                    <div class="cannula-item cannula-aortic">
                        <div class="cannula-label">Size (Fr) — DLP</div>
                        <div class="cannula-value">${cannData.aorticFr}</div>
                        <div class="cannula-unit">French</div>
                    </div>
                </div>
                <div class="cannula-note-box">
                    <span class="cannula-note-icon">📋</span>
                    <span>${cannData.note}</span>
                </div>
                <div class="cannula-note-box" style="margin-top:6px;border-left-color:#ea580c;">
                    <span class="cannula-note-icon">📐</span>
                    <span>${cannData.tipNote}</span>
                </div>
                <div class="sub-note" style="margin-top:6px;">⚠️ Final selection by operating surgeon & perfusionist based on intraoperative anatomy</div>
            </div>
            <div id="back-cannula-result" class="card-back">
                <div class="card-header">
                    <span class="card-icon">🩺</span>
                    <div class="label">Cannula Sizes — Bi-Caval + Aortic</div>
                    <button class="ref-btn" onclick="toggleReference('cannula-result')" title="Back to Results">?</button>
                </div>
                <div class="ref-back-text">
                    <div class="ref-back-title">Cannula Sizing References</div>
                    <strong>Venous (Bi-Caval)</strong>
                    <p>SVC & IVC sizes derived from weight-based protocols per The Children's Hospital, Lahore OT Chart and RCH Melbourne CPB Protocol.</p>
                    <strong>Arterial (Aortic)</strong>
                    <p>DLP Medtronic and Edwards cannulae sizing per Textbook Table 12 - Arterial cannula sizes based on required flow rate (L/min).</p>
                    <strong>Data Sources</strong>
                    <p>Multi-source verified (1) Teacher's OT Chart, (2) Textbook Reference Tables 12–13, (3) RCH Melbourne CPB Protocol.</p>
                    <strong>Disclaimer</strong>
                    <p>Final cannula selection by operating surgeon & perfusionist based on intraoperative anatomy and vessel assessment.</p>
                </div>
            </div>
        </div>

        <!-- ⑤ Kirklin PA Ring (weight-based) -->
        ${renderKirklinCard(weight)}

        <!-- ⑥ Valve Size Reference (BSA-based) -->
        ${renderValveSizeCard(weight, height)}

    `;

    // Z-Score modal is updated independently when opened


    statusDiv.innerHTML = '<span class="status-dot dot-ready"></span>All parameters calculated successfully';
    statusDiv.className = 'status ready';

    if (typeof syncHubPatientSummary === 'function') {
        syncHubPatientSummary();
    }
}

// ── Event Listeners (Live Auto-Calculation for Main Dashboard) ──────
[weightInput, heightInput, ageInput].forEach(input => {
    if (input) {
        input.addEventListener('input', () => {
            updateApp();
            syncHubPatientSummary();
        });
    }
});
if (ageUnitSelect) ageUnitSelect.addEventListener('change', () => {
    updateApp();
    syncHubPatientSummary();
});
if (diseaseInput) {
    diseaseInput.addEventListener('input', updateApp);
    diseaseInput.addEventListener('change', updateApp);
}

// ── Flip Card Animation ──────────────────────────────────────
document.querySelectorAll('.help-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const cardId = button.getAttribute('data-flip');
        const card = document.getElementById(cardId);
        if (card) {
            card.classList.toggle('active');
            // Change button text to indicate state
            button.textContent = card.classList.contains('active') ? '✕' : '?';
            button.style.transition = 'all 0.3s ease';
        }
    });
});

if (typeof syncHubPatientSummary === 'function') {
    syncHubPatientSummary();
}

console.log('✅ Perfusion Pro Suite v2.2 — Engine Loaded');
