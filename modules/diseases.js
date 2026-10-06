/**
 * ═══════════════════════════════════════════════════════════
 *   PERFUSION PRO SUITE — Module: Cardiac Diseases
 *   File:   modules/diseases.js
 *   Purpose: Searchable disease reference data for the main app
 * ═══════════════════════════════════════════════════════════
 */

const diseases = [
    {
        id: 1,
        name: "VSD",
        fullName: "Ventricular Septal Defect",
        category: "Congenital",
        type: "Acyanotic",
        summary: "A left-to-right shunt through the ventricular septum.",
        treatmentPlan: [
            "Surgical: Patch closure",
            "Palliative: Pulmonary artery banding (selected cases)"
        ]
    },
    {
        id: 2,
        name: "ASD",
        fullName: "Atrial Septal Defect",
        category: "Congenital",
        type: "Acyanotic",
        summary: "An interatrial communication that can cause right-sided volume load.",
        treatmentPlan: [
            "Review defect size and shunt significance.",
            "Confirm closure strategy based on anatomy and age.",
            "Add your follow-up protocol here when ready."
        ]
    },
    {
        id: 3,
        name: "PDA",
        fullName: "Patent Ductus Arteriosus",
        category: "Congenital",
        type: "Acyanotic",
        summary: "Persistent ductal flow between the aorta and pulmonary artery.",
        treatmentPlan: [
            "Interventional: Device/coil closure",
            "Surgical: Ligation"
        ]
    },
    {
        id: 4,
        name: "CoA",
        fullName: "Coarctation of Aorta",
        category: "Congenital",
        type: "Acyanotic",
        summary: "A narrowing of the aortic arch that increases left ventricular afterload.",
        treatmentPlan: [
            "Interventional: Balloon angioplasty / stent",
            "Surgical: End-to-end repair, subclavian flap, patch aortoplasty"
        ]
    },
    {
        id: 5,
        name: "TOF",
        fullName: "Tetralogy of Fallot",
        category: "Congenital",
        type: "Cyanotic",
        summary: "A conotruncal defect with RV outflow obstruction and cyanosis.",
        treatmentPlan: [
            "Palliative: BT shunt, RVOT stent, PDA stent",
            "Surgical: Complete repair (VSD closure + RVOT relief)"
        ]
    },
    {
        id: 6,
        name: "TGA",
        fullName: "Transposition of Great Arteries",
        category: "Congenital",
        type: "Cyanotic",
        summary: "The aorta and pulmonary artery arise from the wrong ventricles.",
        treatmentPlan: [
            "Interventional: Balloon atrial septostomy",
            "Surgical: Arterial switch operation"
        ]
    },
    {
        id: 7,
        name: "TAPVC",
        fullName: "Total Anomalous Pulmonary Venous Connection",
        category: "Congenital",
        type: "Cyanotic",
        summary: "Pulmonary venous return drains to the systemic venous circulation.",
        treatmentPlan: [
            "Surgical: Redirection of pulmonary veins + ASD closure"
        ]
    },
    {
        id: 8,
        name: "Truncus",
        fullName: "Truncus Arteriosus",
        category: "Congenital",
        type: "Cyanotic",
        summary: "A single arterial trunk supplies systemic, pulmonary, and coronary flow.",
        treatmentPlan: [
            "Surgical: VSD closure + RV-PA conduit + separation of pulmonary arteries"
        ]
    },
    {
        id: 9,
        name: "CAD",
        fullName: "Coronary Artery Disease",
        category: "Adult",
        type: "Ischemic",
        summary: "Atherosclerotic narrowing of the coronary arteries.",
        treatmentPlan: [
            "Review ischemic burden and coronary anatomy.",
            "Plan revascularization strategy according to surgical indication.",
            "Add your institution-specific plan here when ready."
        ]
    },
    {
        id: 10,
        name: "MI",
        fullName: "Myocardial Infarction",
        category: "Adult",
        type: "Ischemic",
        summary: "Acute myocardial injury caused by interrupted coronary perfusion.",
        treatmentPlan: [
            "Review infarct location, ventricular function, and stability.",
            "Document operative or mechanical support plan as needed.",
            "Add your treatment workflow here when ready."
        ]
    },
    {
        id: 11,
        name: "AS",
        fullName: "Aortic Stenosis",
        category: "Adult",
        type: "Valvular",
        summary: "A fixed obstruction at the aortic valve increases LV pressure load.",
        treatmentPlan: [
            "Interventional: Balloon valvuloplasty",
            "Surgical: Valvotomy, Ross procedure, valve replacement"
        ]
    },
    {
        id: 12,
        name: "AR",
        fullName: "Aortic Regurgitation",
        category: "Adult",
        type: "Valvular",
        summary: "Retrograde flow from the aorta into the left ventricle.",
        treatmentPlan: [
            "Assess regurgitant severity and LV dimensions.",
            "Plan valve repair or replacement according to anatomy.",
            "Add your follow-up plan here when ready."
        ]
    },
    {
        id: 13,
        name: "MS",
        fullName: "Mitral Stenosis",
        category: "Adult",
        type: "Valvular",
        summary: "Obstruction to blood flow across the mitral valve.",
        treatmentPlan: [
            "Review valve area, gradients, and rhythm status.",
            "Plan intervention based on severity and valve morphology.",
            "Add your treatment pathway here when ready."
        ]
    },
    {
        id: 14,
        name: "MR",
        fullName: "Mitral Regurgitation",
        category: "Adult",
        type: "Valvular",
        summary: "Backward flow from the left ventricle to the left atrium.",
        treatmentPlan: [
            "Assess leaflet pathology, annulus, and ventricular size.",
            "Plan repair or replacement strategy as indicated.",
            "Add your post-op plan here when ready."
        ]
    },
    {
        id: 15,
        name: "AF",
        fullName: "Atrial Fibrillation",
        category: "Adult",
        type: "Arrhythmia",
        summary: "An irregular atrial rhythm with loss of organized atrial contraction.",
        treatmentPlan: [
            "Assess rate, rhythm, and thromboembolic risk.",
            "Document rhythm-control, rate-control, or surgical strategy.",
            "Add your arrhythmia pathway here when ready."
        ]
    },
    {
        id: 16,
        name: "VT",
        fullName: "Ventricular Tachycardia",
        category: "Adult",
        type: "Arrhythmia",
        summary: "A rapid ventricular rhythm that may compromise hemodynamics.",
        treatmentPlan: [
            "Assess stability, trigger, and ventricular function.",
            "Document acute and definitive rhythm management steps.",
            "Add your protocol here when ready."
        ]
    },
    {
        id: 17,
        name: "DCM",
        fullName: "Dilated Cardiomyopathy",
        category: "Adult",
        type: "Cardiomyopathy",
        summary: "A dilated ventricle with impaired systolic function.",
        treatmentPlan: [
            "Assess ventricular function, dilation, and heart failure severity.",
            "Document operative, mechanical, or medical support plan.",
            "Add your long-term plan here when ready."
        ]
    },
    {
        id: 18,
        name: "HCM",
        fullName: "Hypertrophic Cardiomyopathy",
        category: "Adult",
        type: "Cardiomyopathy",
        summary: "An abnormal increase in myocardial thickness with dynamic obstruction in some patients.",
        treatmentPlan: [
            "Assess obstruction, septal thickness, and symptoms.",
            "Document surgical or medical management plan as appropriate.",
            "Add your disease-specific notes here when ready."
        ]
    },
    {
        id: 19,
        name: "AVSD",
        fullName: "Atrioventricular Septal Defect",
        category: "Congenital",
        type: "Acyanotic",
        summary: "Defects in the atrial and ventricular septa and the AV valves.",
        treatmentPlan: [
            "Surgical: Complete repair + AV valve repair"
        ]
    },
    {
        id: 20,
        name: "PS",
        fullName: "Pulmonary Stenosis",
        category: "Congenital",
        type: "Acyanotic",
        summary: "Narrowing of the pulmonary valve or outflow tract.",
        treatmentPlan: [
            "Interventional: Balloon valvuloplasty",
            "Surgical: Valvotomy / RVOT reconstruction"
        ]
    },
    {
        id: 21,
        name: "Tricuspid Atresia",
        fullName: "Tricuspid Atresia",
        category: "Congenital",
        type: "Cyanotic",
        summary: "Absence of the tricuspid valve with a hypoplastic right ventricle.",
        treatmentPlan: [
            "Palliative/Staged: BT shunt or PA band -> Glenn -> Fontan"
        ]
    },
    {
        id: 22,
        name: "Pulmonary Atresia",
        fullName: "Pulmonary Atresia",
        category: "Congenital",
        type: "Cyanotic",
        summary: "Complete obstruction of the pulmonary valve.",
        treatmentPlan: [
            "Palliative: PDA stent, BT shunt, RVOT stent",
            "Surgical: RV-PA conduit, unifocalization, VSD closure"
        ]
    },
    {
        id: 23,
        name: "HLHS",
        fullName: "Hypoplastic Left Heart Syndrome",
        category: "Congenital",
        type: "Cyanotic",
        summary: "Underdevelopment of the left side of the heart.",
        treatmentPlan: [
            "Staged surgery: Norwood -> Glenn -> Fontan",
            "Alternative: Heart transplant"
        ]
    },
    {
        id: 24,
        name: "DORV",
        fullName: "Double Outlet Right Ventricle",
        category: "Congenital",
        type: "Cyanotic",
        summary: "Both the aorta and pulmonary artery arise from the right ventricle.",
        treatmentPlan: [
            "Surgical: Tunnel repair, Rastelli, arterial switch, single ventricle pathway"
        ]
    },
    {
        id: 25,
        name: "Ebstein",
        fullName: "Ebstein Anomaly",
        category: "Congenital",
        type: "Cyanotic",
        summary: "Downward displacement of the tricuspid valve leaflets.",
        treatmentPlan: [
            "Surgical: Cone repair, tricuspid repair/replacement, Glenn"
        ]
    }
];

function getAllDiseases() {
    return diseases;
}

function getDiseaseByName(name) {
    if (!name) return null;
    return diseases.find(d => d.name.toLowerCase() === name.toLowerCase() || d.fullName.toLowerCase() === name.toLowerCase()) || null;
}

function getDiseaseById(id) {
    return diseases.find(d => d.id === id) || null;
}

function getByCategory(category) {
    return diseases.filter(d => d.category.toLowerCase() === category.toLowerCase());
}

function getByType(type) {
    return diseases.filter(d => d.type.toLowerCase() === type.toLowerCase());
}

function searchDiseases(keyword) {
    if (!keyword) return [];
    const lowerKeyword = keyword.toLowerCase();
    return diseases.filter(d =>
        d.name.toLowerCase().includes(lowerKeyword) ||
        d.fullName.toLowerCase().includes(lowerKeyword) ||
        d.category.toLowerCase().includes(lowerKeyword) ||
        d.type.toLowerCase().includes(lowerKeyword)
    );
}

function getDiseaseOptions() {
    return diseases.map(d => `${d.name} - ${d.fullName}`);
}
