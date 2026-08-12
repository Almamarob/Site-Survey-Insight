// ===========================================================
// STATE
// ===========================================================
const state = {
  projectName: "",
  location: {},
  participants: [],
  overview: {},
  siteInspection: {}, // floors-first: { nonPresente, activeFloorId, activeCheckId, activeStep, floors:[...] }
  plantTests: {}, // key: section id → {saved, tests:[]}
  activePtSection: null,
  siNavOpen: false,
  ptNavOpen: false,
  // versioning
  versions: [], // committed snapshots (oldest → newest)
  currentVersionNum: 1, // version number of the current working session
};

// ===========================================================
// SECTIONS & MACROS
// ===========================================================
const SI_SECTIONS = [
  { id: "site-status", label: "Site Status", icon: "SS", macro: "General" },
  {
    id: "fire-reaction",
    label: "Fire Reaction",
    icon: "FR",
    macro: "Protezione Passiv",
  },
  {
    id: "fire-resistance",
    label: "Fire Resistance",
    icon: "RS",
    macro: "Passive Fire Protection",
  },
  {
    id: "compartimentation",
    label: "Compartimentation",
    icon: "CP",
    macro: "Passive Fire Protection",
  },
  { id: "exit-path", label: "Exit Path", icon: "EP", macro: "Means of Egress" },
  {
    id: "refuge-areas",
    label: "Refuge Areas",
    icon: "RA",
    macro: "Means of Egress",
  },
  {
    id: "fire-extinguisher",
    label: "Fire Extinguisher",
    icon: "FE",
    macro: "Active Fire Protection",
  },
  {
    id: "manual-suppression",
    label: "Manual Fire Suppression",
    icon: "MS",
    macro: "Active Fire Protection",
  },
  {
    id: "auto-suppression",
    label: "Automatic Fire Suppression",
    icon: "AS",
    macro: "Active Fire Protection",
  },
  {
    id: "detection-alarm",
    label: "Detection and Alarm",
    icon: "DA",
    macro: "Active Fire Protection",
  },
  {
    id: "smoke-heat",
    label: "Smoke and Heat Control",
    icon: "SH",
    macro: "Active Fire Protection",
  },
  {
    id: "tech-system",
    label: "Technological System",
    icon: "TS",
    macro: "Systems & Management",
  },
  {
    id: "fire-safety-mgmt",
    label: "Fire Safety Management",
    icon: "FM",
    macro: "Systems & Management",
  },
];
const SI_MACROS = [
  "General",
  "Passive Fire Protection",
  "Means of Egress",
  "Active Fire Protection",
  "Systems & Management",
];

const PT_SECTIONS = [
  { id: "pt-detection", label: "Detection and Alarm", icon: "DA" },
  { id: "pt-refuge", label: "Refuge Area System", icon: "RA" },
  { id: "pt-current-tech", label: "Current Tech and Linked Sys", icon: "CT" },
  { id: "pt-manual-supp", label: "Manual Fire Suppression", icon: "MS" },
  { id: "pt-auto-supp", label: "Automatic Fire Suppression", icon: "AS" },
  { id: "pt-smoke", label: "Smoke and Heat Control", icon: "SH" },
];

// 5-column compliance verification grid
const COMPLIANCE_CATEGORIES = [
  {
    id: 'general',
    label: 'General',
    items: [{ id: 'site-status', label: 'Site Status' }]
  },
  {
    id: 'passive-fire',
    label: 'Passive Fire Protection',
    items: [
      { id: 'fire-resistance', label: 'Fire Resistance' },
      { id: 'compartimentation', label: 'Compartimentation' }
    ]
  },
  {
    id: 'means-egress',
    label: 'Means of Egress',
    items: [
      { id: 'exit-path', label: 'Exit Path' },
      { id: 'refuge-areas', label: 'Refuge Areas' }
    ]
  },
  {
    id: 'active-fire',
    label: 'Active Fire Protection',
    items: [
      { id: 'fire-extinguisher', label: 'Fire Extinguisher' },
      { id: 'manual-suppression', label: 'Manual Fire Suppression' },
      { id: 'auto-suppression', label: 'Automatic Fire Suppression' },
      { id: 'detection-alarm', label: 'Detection and Alarm' },
      { id: 'smoke-heat', label: 'Smoke and Heat Control' }
    ]
  },
  {
    id: 'systems-mgmt',
    label: 'Systems & Management',
    items: [
      { id: 'tech-system', label: 'Technological System' },
      { id: 'fire-safety-mgmt', label: 'Fire Safety Management' }
    ]
  }
];

const AREA_CATEGORIES = [
  "Ground Floor",
  "First Floor",
  "Second Floor",
  "Third Floor",
  "Basement",
  "Mezzanine",
  "Roof",
  "Exterior",
  "Zone A",
  "Zone B",
  "Zone C",
  "Zone D",
];

// ===========================================================
// SI DATA HELPERS  (floors-first model)
// ===========================================================
function createEmptyFloor() {
  return {
    id: String(Date.now()) + String(Math.random()).slice(2, 8),
    areaCategory: "",
    floorLabel: "",
    floorplanDataUrl: null,
    floorplanPins: [],
    comments: "",
    photos: [],
    notes: "",
    riverifica: false,
    savedFloor: false,
    selectedChecks: [],   // check ids chosen in Step 2
    checks: {},           // { [checkId]: { saved, comments, photos, notes, riverifica } }
  };
}

function createEmptyCheck() {
  return { saved: false, comments: "", photos: [], notes: "", riverifica: false, status: "", statusNotes: "" };
}

function getFloor(floorId) {
  return (state.siteInspection.floors || []).find(f => f.id === floorId) || null;
}

// Returns the check object for a floor, initialising it if missing
function getOrInitCheck(floorId, checkId) {
  const floor = getFloor(floorId);
  if (!floor) return null;
  if (!floor.checks[checkId]) floor.checks[checkId] = createEmptyCheck();
  return floor.checks[checkId];
}

// Fresh SI state (new inspection or new survey)
function initSiState() {
  state.siteInspection = {
    nonPresente: false,
    activeFloorId: null,
    activeCheckId: null,
    activeStep: 1,
    floors: [],
  };
}

// Migrate old section-keyed format → new floors-first format.
// Called on import and on loadVersion when old shape is detected.
function migrateSiState(old) {
  if (!old || Array.isArray(old.floors)) return old; // already new format
  const isOldFormat = SI_SECTIONS.some(s => old[s.id] !== undefined);
  if (!isOldFormat) return old;

  const freshState = {
    nonPresente: false,
    activeFloorId: null,
    activeCheckId: null,
    activeStep: 1,
    floors: [],
  };

  // Collect unique floors across all sections
  const floorMap = {}; // key: `${areaCategory}|${floorLabel}` → floor object

  SI_SECTIONS.forEach(sec => {
    const d = old[sec.id];
    if (!d) return;
    if (d.nonPresente) return; // skip non-present sections

    (d.floors || []).forEach(fl => {
      const key = `${fl.areaCategory || ""}|${fl.floorLabel || ""}`;
      if (!floorMap[key]) {
        floorMap[key] = {
          ...createEmptyFloor(),
          id: fl.id ? String(fl.id) : String(Date.now()) + String(Math.random()).slice(2),
          areaCategory: fl.areaCategory || "",
          floorLabel: fl.floorLabel || "",
          floorplanDataUrl: fl.floorplanDataUrl || null,
          floorplanPins: fl.floorplanPins || [],
          comments: fl.comments || "",
          photos: fl.photos || [],
          notes: fl.notes || "",
          riverifica: fl.riverifica || false,
          savedFloor: !!d.saved,
          selectedChecks: [],
          checks: {},
        };
      }
      const floor = floorMap[key];
      if (!floor.selectedChecks.includes(sec.id)) {
        floor.selectedChecks.push(sec.id);
        floor.checks[sec.id] = {
          saved: !!d.saved,
          comments: fl.comments || "",
          photos: [],
          notes: fl.notes || "",
          riverifica: fl.riverifica || false,
          status: "",
          statusNotes: "",
        };
      }
    });
  });

  freshState.floors = Object.values(floorMap);
  if (freshState.floors.length > 0) freshState.activeFloorId = freshState.floors[0].id;
  return freshState;
}

// ===========================================================
// SIDEBAR RENDERING
// ===========================================================
function renderSiSidebarItems() {
  const group = document.getElementById("si-nav-group");
  group.innerHTML = "";
  const si = state.siteInspection;
  const floors = si.floors || [];
  const activeFloorId = si.activeFloorId;
  const activeCheckId = si.activeCheckId;

  // "+ Add Floor/Zone" button
  const addDiv = document.createElement("div");
  addDiv.style.cssText = "padding:8px 14px 4px";
  addDiv.innerHTML = `<button class="btn btn-secondary btn-sm" style="width:100%" onclick="siAddNewFloor()">+ Add Floor / Zone</button>`;
  group.appendChild(addDiv);

  floors.forEach(fl => {
    const flLabel = fl.floorLabel || fl.areaCategory || "New Floor";
    const checkCount = fl.selectedChecks.length;
    const savedCount = fl.selectedChecks.filter(cid => fl.checks[cid]?.saved).length;
    const isFloorActive = activeFloorId === fl.id && !activeCheckId;

    const flEl = document.createElement("div");
    flEl.className = "nav-floor-item" + (isFloorActive ? " active" : "") + (fl.savedFloor ? " saved" : "");
    flEl.id = "nav-floor-" + fl.id;
    flEl.innerHTML = `
      <span class="nav-floor-dot">◈</span>
      <span class="nav-floor-label">${flLabel}</span>
      ${fl.savedFloor && checkCount > 0
        ? `<span class="nav-floor-progress">${savedCount}/${checkCount}</span>`
        : !fl.savedFloor ? '<span class="nav-floor-unsaved">draft</span>' : ""}
    `;
    flEl.onclick = () => navigateToFloor(fl.id);
    group.appendChild(flEl);

    if (fl.savedFloor && fl.selectedChecks.length > 0) {
      COMPLIANCE_CATEGORIES.forEach(cat => {
        const catChecks = cat.items.filter(item => fl.selectedChecks.includes(item.id));
        catChecks.forEach(item => {
          const check = fl.checks[item.id];
          const isCheckActive = activeFloorId === fl.id && activeCheckId === item.id;
          const chEl = document.createElement("div");
          chEl.className = "nav-sub-item nav-check-item" + (isCheckActive ? " active" : "") + (check?.saved ? " saved" : "");
          chEl.innerHTML = `
            <span class="sub-dot">●</span>
            <span style="flex:1">${item.label}</span>
            ${check?.saved ? '<span class="sub-check">✓</span>' : ""}
          `;
          chEl.onclick = () => navigateToCheck(fl.id, item.id);
          group.appendChild(chEl);
        });
      });
    }
  });
}

function renderPtSidebarItems() {
  const group = document.getElementById("pt-nav-group");
  group.innerHTML = "";
  PT_SECTIONS.forEach((s) => {
    const el = document.createElement("div");
    const isActive = state.activePtSection === s.id;
    const isSaved = state.plantTests[s.id]?.saved;
    el.className =
      "nav-sub-item" + (isActive ? " active" : "") + (isSaved ? " saved" : "");
    el.id = "nav-sub-pt-" + s.id;
    el.innerHTML = `<span class="sub-dot">●</span><span style="flex:1">${s.label}</span>${isSaved ? '<span class="sub-check">✓</span>' : ""}`;
    el.onclick = () => navigateToPtSection(s.id);
    group.appendChild(el);
  });
}

// ===========================================================
// ACCORDION TOGGLES
// ===========================================================
function toggleSiNav() {
  state.siNavOpen = !state.siNavOpen;
  const group = document.getElementById("si-nav-group");
  const toggle = document.getElementById("nav-site-inspection");
  group.style.display = state.siNavOpen ? "block" : "none";
  toggle.classList.toggle("open", state.siNavOpen);
  if (state.siNavOpen) {
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    document.getElementById("nav-plant-tests").classList.remove("active");
    toggle.classList.add("active");
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById("page-site-inspection").classList.add("active");
    renderSiPage();
  } else {
    toggle.classList.remove("active");
  }
}

function togglePtNav() {
  state.ptNavOpen = !state.ptNavOpen;
  const group = document.getElementById("pt-nav-group");
  const toggle = document.getElementById("nav-plant-tests");
  group.style.display = state.ptNavOpen ? "block" : "none";
  toggle.classList.toggle("open", state.ptNavOpen);
  if (state.ptNavOpen) {
    document
      .querySelectorAll(".nav-item")
      .forEach((n) => n.classList.remove("active"));
    document.getElementById("nav-site-inspection").classList.remove("active");
    toggle.classList.add("active");
    document
      .querySelectorAll(".page")
      .forEach((p) => p.classList.remove("active"));
    document.getElementById("page-plant-tests").classList.add("active");
    if (state.activePtSection) renderPtContent();
  } else {
    toggle.classList.remove("active");
  }
}

// ===========================================================
// NAVIGATION
// ===========================================================
function navigate(page) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  document.getElementById("nav-site-inspection").classList.remove("active");
  document.getElementById("nav-plant-tests").classList.remove("active");
  document.getElementById("page-" + page).classList.add("active");
  const navEl = document.getElementById("nav-" + page);
  if (navEl) navEl.classList.add("active");
  if (page === "preview") renderPreview();
  if (page === "export") updateExportInfo();
  if (page === "history") renderHistoryPage();
  if (page === "getting-started") renderGettingStarted();
}

function _ensureSiVisible() {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById("page-site-inspection").classList.add("active");
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  document.getElementById("nav-plant-tests").classList.remove("active");
  document.getElementById("nav-site-inspection").classList.add("active");
  if (!state.siNavOpen) {
    state.siNavOpen = true;
    document.getElementById("si-nav-group").style.display = "block";
    document.getElementById("nav-site-inspection").classList.add("open");
  }
}

function siAddNewFloor() {
  const floor = createEmptyFloor();
  if (!state.siteInspection.floors) state.siteInspection.floors = [];
  state.siteInspection.floors.push(floor);
  state.siteInspection.activeFloorId = floor.id;
  state.siteInspection.activeCheckId = null;
  state.siteInspection.activeStep = 1;
  _ensureSiVisible();
  renderSiSidebarItems();
  renderSiPage();
}

function navigateToFloor(floorId) {
  state.siteInspection.activeFloorId = floorId;
  state.siteInspection.activeCheckId = null;
  state.siteInspection.activeStep = 1;
  _ensureSiVisible();
  renderSiSidebarItems();
  renderSiPage();
}

function navigateToCheck(floorId, checkId) {
  state.siteInspection.activeFloorId = floorId;
  state.siteInspection.activeCheckId = checkId;
  state.siteInspection.activeStep = 3;
  _ensureSiVisible();
  renderSiSidebarItems();
  renderSiPage();
}

function siGoToStep2(floorId) {
  state.siteInspection.activeFloorId = floorId;
  state.siteInspection.activeCheckId = null;
  state.siteInspection.activeStep = 2;
  renderSiSidebarItems();
  renderSiPage();
}

function navigateToPtSection(id) {
  if (!state.plantTests[id]) {
    state.plantTests[id] = { saved: false, tests: [createEmptyTest()] };
  }
  state.activePtSection = id;
  if (!state.ptNavOpen) {
    state.ptNavOpen = true;
    document.getElementById("pt-nav-group").style.display = "block";
    document.getElementById("nav-plant-tests").classList.add("open");
  }
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById("page-plant-tests").classList.add("active");
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  document.getElementById("nav-site-inspection").classList.remove("active");
  document.getElementById("nav-plant-tests").classList.add("active");
  renderPtSidebarItems();
  renderPtContent();
}

// ===========================================================
// TOAST
// ===========================================================
let toastTimer;
function showToast(msg, type = "info") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "show " + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.className = "";
  }, 2800);
}

// ===========================================================
// VERSIONING
// ===========================================================

// Deep clone excluding base64 images (keeps snapshots lightweight)
function deepCloneForVersion(obj) {
  return JSON.parse(
    JSON.stringify(obj, (key, val) => {
      if (key === "dataUrl" || key === "floorplanDataUrl") return null;
      return val;
    }),
  );
}

function snapshotCurrent() {
  return {
    versionNum: state.currentVersionNum,
    createdAt: new Date().toISOString(),
    verbale: state.location.verbale || "",
    nrSopralluogo: state.location.nrSopralluogo || "",
    projectName: state.projectName,
    location: deepCloneForVersion(state.location),
    participants: deepCloneForVersion(state.participants),
    overview: deepCloneForVersion(state.overview),
    siteInspection: deepCloneForVersion(state.siteInspection),
    plantTests: deepCloneForVersion(state.plantTests),
  };
}

function commitVersion(silent = false) {
  const snap = snapshotCurrent();
  const idx = state.versions.findIndex(
    (v) => v.versionNum === state.currentVersionNum,
  );
  if (idx >= 0) state.versions[idx] = snap;
  else state.versions.push(snap);
  state.versions.sort((a, b) => a.versionNum - b.versionNum);
  updateVersionDisplay();
  if (!silent)
    showToast(`Version ${state.currentVersionNum} saved ✓`, "success");
}

function nuovoSopralluogo() {
  if (!state.projectName) {
    showToast("Load or start an inspection first", "error");
    return;
  }
  commitVersion(true);

  const nextNum = Math.max(...state.versions.map((v) => v.versionNum), 0) + 1;
  const oldLocation = deepCloneForVersion(state.location);
  const oldNr = parseInt(oldLocation.nrSopralluogo || "0", 10);

  state.currentVersionNum = nextNum;
  state.location = {
    ...oldLocation,
    date: new Date().toISOString().split("T")[0],
    nrSopralluogo: String(oldNr + 1),
    verbale: "",
  };
  state.participants = deepCloneForVersion(state.participants);
  state.overview = {};
  initSiState();
  state.plantTests = {};
  state.activePtSection = null;

  updateBadges();
  renderSiSidebarItems();
  renderPtSidebarItems();
  populateLocationForm();
  populateOverviewForm();
  updateNumeroVerbale();
  updateVersionDisplay();
  navigate("location");
  showToast(`Inspection v${nextNum} started — same site`, "success");
}

function loadVersion(versionNum) {
  const v = state.versions.find((sv) => sv.versionNum === versionNum);
  if (!v) return;
  // commit current first so we don't lose it
  commitVersion(true);

  state.location = JSON.parse(JSON.stringify(v.location));
  state.participants = JSON.parse(JSON.stringify(v.participants));
  state.overview = JSON.parse(JSON.stringify(v.overview));
  state.siteInspection = migrateSiState(JSON.parse(JSON.stringify(v.siteInspection)));
  state.plantTests = JSON.parse(JSON.stringify(v.plantTests));
  state.currentVersionNum = versionNum;
  state.activePtSection = null;

  updateBadges();
  renderSiSidebarItems();
  renderPtSidebarItems();
  populateLocationForm();
  populateOverviewForm();
  updateVersionDisplay();
  navigate("location");
  showToast(`Version ${versionNum} loaded`, "info");
}

function updateVersionDisplay() {
  const el = document.getElementById("version-display");
  if (!el) return;
  if (state.projectName) {
    el.textContent = `v${state.currentVersionNum}`;
    el.style.display = "inline-flex";
  } else {
    el.style.display = "none";
  }
}

// Export full project (all versions + current) as JSON
function exportProject() {
  commitVersion(true);
  const data = {
    projectName: state.projectName,
    exportedAt: new Date().toISOString(),
    currentVersionNum: state.currentVersionNum,
    versions: state.versions,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(state.projectName || "project").replace(/[^a-zA-Z0-9\-_]/g, "_")}_history.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Project exported ✓", "success");
}

// Import project from JSON
function importProject() {
  const inp = document.createElement("input");
  inp.type = "file";
  inp.accept = ".json";
  inp.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.versions || !Array.isArray(data.versions))
          throw new Error("invalid format");

        state.projectName = data.projectName || "";
        state.versions = data.versions;
        state.currentVersionNum =
          data.currentVersionNum || data.versions.length;

        // load the most recent version as the working state
        const latest = [...state.versions].sort(
          (a, b) => b.versionNum - a.versionNum,
        )[0];
        state.location = JSON.parse(JSON.stringify(latest.location));
        state.participants = JSON.parse(JSON.stringify(latest.participants));
        state.overview = JSON.parse(JSON.stringify(latest.overview));
        state.siteInspection = migrateSiState(JSON.parse(JSON.stringify(latest.siteInspection)));
        state.plantTests = JSON.parse(JSON.stringify(latest.plantTests));
        state.activePtSection = null;
        state.activePtSection = null;

        document.getElementById("project-name-display").textContent =
          "— " + state.projectName;
        updateBadges();
        renderSiSidebarItems();
        renderPtSidebarItems();
        populateLocationForm();
        populateOverviewForm();
        updateVersionDisplay();
        navigate("history");
        showToast(
          `Project imported — ${state.versions.length} version${state.versions.length !== 1 ? "s" : ""}`,
          "success",
        );
      } catch (err) {
        showToast("Error reading JSON file", "error");
      }
    };
    reader.readAsText(file);
  };
  inp.click();
}

// ===========================================================
// GETTING STARTED (dynamic render)
// ===========================================================
function renderGettingStarted() {
  const el = document.getElementById("gs-content");
  if (!el) return;
  const hasProject = !!state.projectName;
  const hasVersions = state.versions.length > 0;

  el.innerHTML = `
    <div class="gs-hero">
      <p class="gs-tagline">Fire Safety · Inspection Monitoring</p>
      <div class="gs-brand">
        <img src="images/logo_icon_transparent.png" alt="Site Insight" class="gs-logo">
        <h1>Site Insight</h1>
      </div>
      <div class="gs-cards">
        <div class="gs-card" onclick="newInspection()">
          <div class="gs-icon">✨</div>
          <h3>New Inspection</h3>
          <p>Start a new inspection from scratch.</p>
        </div>
        ${
          hasProject
            ? `
        <div class="gs-card gs-card-accent" onclick="nuovoSopralluogo()">
          <div class="gs-icon">🔄</div>
          <h3>New Survey</h3>
          <p>Update same site — creates version v${state.currentVersionNum + 1} inheriting location.</p>
        </div>`
            : `
        <div class="gs-card" onclick="loadMock()">
          <div class="gs-icon">📂</div>
          <h3>Load Demo</h3>
          <p>Explore the app with pre-filled sample data.</p>
        </div>`
        }
        ${
          hasVersions
            ? `
        <div class="gs-card" onclick="navigate('history')">
          <div class="gs-icon">🕐</div>
          <h3>Version History</h3>
          <p>${state.versions.length} version${state.versions.length !== 1 ? "s" : ""} saved for <em>${state.projectName}</em>.</p>
        </div>`
            : `
        <div class="gs-card" onclick="loadMock()">
          <div class="gs-icon">📂</div>
          <h3>Load Demo</h3>
          <p>Explore the app with pre-filled sample data.</p>
        </div>`
        }
        <div class="gs-card" onclick="importProject()">
          <div class="gs-icon">📁</div>
          <h3>Import Project</h3>
          <p>Resume a previously saved project (.json).</p>
        </div>
      </div>
    </div>
  `;
}

function newInspection() {
  state.location = {};
  state.participants = [];
  state.overview = {};
  initSiState();
  state.plantTests = {};
  state.activePtSection = null;
  state.versions = [];
  state.currentVersionNum = 1;
  state.projectName = "New Inspection";
  document.getElementById("project-name-display").textContent =
    "— " + state.projectName;
  updateVersionDisplay();
  renderSiSidebarItems();
  renderPtSidebarItems();
  updateBadges();
  navigate("location");
  showToast("New inspection started", "success");
}

function loadMock() {
  const today = new Date().toISOString().split("T")[0];
  state.projectName = "Stabilimento Industriale XYZ";
  document.getElementById("project-name-display").textContent =
    "— " + state.projectName;
  state.location = {
    date: today,
    nrSopralluogo: "3",
    verbale: today.replace(/-/g, "") + "-XYZMAN-PI-003",
    luogo: "Via dell'Industria 12, 20090 Assago (MI)",
    tipo: "Periodic",
    cliente: "XYZ Manufacturing S.p.A.",
    desc: "Three-storey industrial facility with automated warehouse. Activity: manufacturing.",
  };
  state.participants = [
    {
      nome: "Eng. Marco Rossi",
      ruolo: "Safety Manager",
      azienda: "XYZ Manufacturing S.p.A.",
      email: "m.rossi@xyz.it",
    },
    {
      nome: "Arch. Giulia Bianchi",
      ruolo: "Fire Safety Inspector",
      azienda: "FireSafe Consulting",
      email: "g.bianchi@firesafe.it",
    },
    {
      nome: "Paolo Verdi",
      ruolo: "Systems Maintenance",
      azienda: "TechService S.r.l.",
      email: "p.verdi@techservice.it",
    },
  ];
  state.overview = {
    obiettivo:
      "Annual periodic inspection for fire safety compliance.",
    note: "Inspection identified some non-conformities in Means of Egress on the first floor.",
    docs: "- Fire certificate no. 12345/2020\n- Floor plans rev. 3/2023\n- Fire safety register",
    valutazione: "Partially Compliant",
    priorita: "Medium",
  };
  // Build mock floors-first SI data
  const mockChecks = ["fire-resistance", "exit-path", "detection-alarm", "fire-extinguisher"];
  const mockFloor1 = {
    ...createEmptyFloor(),
    id: "mock-floor-gf",
    floorLabel: "Ground Floor",
    areaCategory: "Zone A",
    comments: "General inspection completed with positive outcome.",
    notes: "No critical anomalies detected.",
    riverifica: false,
    savedFloor: true,
    selectedChecks: mockChecks,
    checks: {},
  };
  mockChecks.forEach((checkId, i) => {
    mockFloor1.checks[checkId] = {
      saved: true,
      comments: `${checkId.replace(/-/g,"_")} check completed — no findings.`,
      photos: [],
      notes: "No critical anomalies detected.",
      riverifica: i === 1,
      status: i === 1 ? "Partially Compliant" : "Compliant",
      statusNotes: i === 1 ? "Minor issue identified" : "",
    };
  });
  const mockFloor2 = {
    ...createEmptyFloor(),
    id: "mock-floor-ff",
    floorLabel: "First Floor",
    areaCategory: "Zone B",
    comments: "First floor inspected with no findings.",
    notes: "",
    riverifica: false,
    savedFloor: true,
    selectedChecks: ["exit-path"],
    checks: {
      "exit-path": { saved: true, comments: "Exit paths clear.", photos: [], notes: "", riverifica: false, status: "Compliant", statusNotes: "" },
    },
  };
  state.siteInspection = {
    nonPresente: false,
    activeFloorId: mockFloor1.id,
    activeCheckId: null,
    activeStep: 1,
    floors: [mockFloor1, mockFloor2],
  };
  ["pt-detection", "pt-auto-supp"].forEach((id) => {
    state.plantTests[id] = {
      saved: true,
      tests: [
        {
          test: "T-001",
          piano: "Ground Floor",
          localizzazione: "Zone A - Entrance",
          tipoAttivazione: "Automatic",
          expectedResults: "Alarm within 30s",
          risultati: "Pass — alarm triggered within 28s",
          status: "Passed",
          photoEvidence: "",
        },
        {
          test: "T-002",
          piano: "First Floor",
          localizzazione: "Zone B - Warehouse",
          tipoAttivazione: "Manual",
          expectedResults: "System activation",
          risultati: "Pass",
          status: "Passed",
          photoEvidence: "",
        },
      ],
    };
  });
  // create mock version history
  state.versions = [];
  state.currentVersionNum = 2;

  // v1 — initial inspection 6 months ago
  const v1date = new Date();
  v1date.setMonth(v1date.getMonth() - 6);
  state.versions.push({
    versionNum: 1,
    createdAt: v1date.toISOString(),
    verbale:
      v1date.toISOString().split("T")[0].replace(/-/g, "") + "-XYZMAN-SI-001",
    nrSopralluogo: "1",
    projectName: "Stabilimento Industriale XYZ",
    location: {
      date: v1date.toISOString().split("T")[0],
      nrSopralluogo: "1",
      verbale:
        v1date.toISOString().split("T")[0].replace(/-/g, "") + "-XYZMAN-II-001",
      luogo: "Via dell'Industria 12, 20090 Assago (MI)",
      tipo: "Initial",
      cliente: "XYZ Manufacturing S.p.A.",
      desc: "Three-storey industrial facility.",
    },
    participants: [],
    overview: {
      obiettivo: "Initial fire safety inspection.",
      valutazione: "Non Compliant",
      priorita: "High",
      note: "Serious non-conformities identified in Means of Egress on the first floor.",
    },
    siteInspection: {
      nonPresente: false,
      activeFloorId: null,
      activeCheckId: null,
      activeStep: 1,
      floors: [
        {
          id: "v1-gf", floorLabel: "Ground Floor", areaCategory: "Zone A",
          floorplanDataUrl: null, floorplanPins: [], comments: "Multiple non-conformities found.",
          photos: [], notes: "", riverifica: true, savedFloor: true,
          selectedChecks: ["exit-path", "fire-resistance", "detection-alarm"],
          checks: {
            "exit-path": { saved: true, comments: "Insufficient corridor width.", photos: [], notes: "", riverifica: true, status: "Non Compliant", statusNotes: "" },
            "fire-resistance": { saved: true, comments: "Uncertified materials found in warehouse.", photos: [], notes: "", riverifica: true, status: "Non Compliant", statusNotes: "" },
            "detection-alarm": { saved: true, comments: "Control panel fault detected.", photos: [], notes: "", riverifica: true, status: "Non Compliant", statusNotes: "" },
          },
        },
      ],
    },
    plantTests: {},
  });

  updateBadges();
  renderSiSidebarItems();
  renderPtSidebarItems();
  populateLocationForm();
  populateOverviewForm();
  updateVersionDisplay();
  navigate("location");
  markNavSaved("location");
  markNavSaved("overview");
  showToast("Demo inspection loaded!", "success");
}

// ===========================================================
// LOCATION FORM + AUTO VERBALE
// ===========================================================
function populateLocationForm() {
  const l = state.location;
  document.getElementById("loc-date").value = l.date || "";
  document.getElementById("loc-verbale").value = l.verbale || "";
  document.getElementById("loc-nr-sopralluogo").value = l.nrSopralluogo || "";
  document.getElementById("loc-luogo").value = l.luogo || "";
  document.getElementById("loc-tipo").value = l.tipo || "";
  document.getElementById("loc-cliente").value = l.cliente || "";
  document.getElementById("loc-desc").value = l.desc || "";
  renderParticipants();
}

function populateOverviewForm() {
  const o = state.overview;
  document.getElementById("ov-obiettivo").value = o.obiettivo || "";
  document.getElementById("ov-note").value = o.note || "";
  document.getElementById("ov-docs").value = o.docs || autoDocumentation();
  document.getElementById("ov-valutazione").value = o.valutazione || "";
  document.getElementById("ov-priorita").value = o.priorita || "";
}

function autoDocumentation() {
  const lines = [];
  const floors = state.siteInspection.floors || [];
  floors.forEach(fl => {
    if (!fl.savedFloor) return;
    const flLabel = fl.floorLabel || fl.areaCategory || "Floor";
    fl.selectedChecks.forEach(checkId => {
      const check = fl.checks[checkId];
      if (!check?.saved) return;
      const cat = COMPLIANCE_CATEGORIES.find(c => c.items.some(i => i.id === checkId));
      const item = cat?.items.find(i => i.id === checkId);
      if (item) lines.push(`- ${item.label} (${cat.label}) — ${flLabel}`);
    });
  });
  PT_SECTIONS.forEach(s => {
    if (state.plantTests[s.id]?.saved) lines.push(`- Plant Test: ${s.label}`);
  });
  return lines.join("\n");
}

function updateNumeroVerbale() {
  const date = document.getElementById("loc-date").value;
  const tipo = document.getElementById("loc-tipo").value;
  const cliente = document.getElementById("loc-cliente").value;
  const nr = document.getElementById("loc-nr-sopralluogo").value;

  const dateStr = date ? date.replace(/-/g, "") : "YYYYMMDD";
  const clienteStr = cliente
    ? cliente
        .replace(/[^a-zA-Z0-9]/g, "")
        .substring(0, 6)
        .toUpperCase()
    : "CLI";
  const tipoMap = {
    "Initial": "II",
    "Periodic": "PI",
    "Extraordinary": "EI",
    "Post-Intervention": "PV",
    "System Commissioning": "SC",
  };
  const tipoStr = tipoMap[tipo] || "XX";
  const nrStr = nr ? String(parseInt(nr, 10) || 1).padStart(3, "0") : "001";
  document.getElementById("loc-verbale").value =
    `${dateStr}-${clienteStr}-${tipoStr}-${nrStr}`;
}

// ===========================================================
// PARTICIPANTS
// ===========================================================
function renderParticipants() {
  const tbody = document.getElementById("participants-body");
  tbody.innerHTML = "";
  state.participants.forEach((p, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input value="${p.nome}"    onchange="state.participants[${i}].nome=this.value"    placeholder="Full Name"></td>
      <td><input value="${p.ruolo}"   onchange="state.participants[${i}].ruolo=this.value"   placeholder="Role"></td>
      <td><input value="${p.azienda}" onchange="state.participants[${i}].azienda=this.value" placeholder="Company"></td>
      <td><input value="${p.email}"   onchange="state.participants[${i}].email=this.value"   placeholder="email@..."></td>
      <td><button class="btn btn-danger btn-sm" onclick="removeParticipant(${i})">✕</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function addParticipant() {
  state.participants.push({ nome: "", ruolo: "", azienda: "", email: "" });
  renderParticipants();
}

function removeParticipant(i) {
  state.participants.splice(i, 1);
  renderParticipants();
}

function saveLocation() {
  state.location = {
    date: document.getElementById("loc-date").value,
    verbale: document.getElementById("loc-verbale").value,
    nrSopralluogo: document.getElementById("loc-nr-sopralluogo").value,
    luogo: document.getElementById("loc-luogo").value,
    tipo: document.getElementById("loc-tipo").value,
    cliente: document.getElementById("loc-cliente").value,
    desc: document.getElementById("loc-desc").value,
  };
  if (!state.projectName || state.projectName === "New Inspection") {
    state.projectName = state.location.luogo || "Inspection";
    document.getElementById("project-name-display").textContent =
      "— " + state.projectName;
  }
  markNavSaved("location");
  showToast("Location & Participants saved ✓", "success");
}

function saveOverview() {
  state.overview = {
    obiettivo: document.getElementById("ov-obiettivo").value,
    note: document.getElementById("ov-note").value,
    docs: document.getElementById("ov-docs").value,
    valutazione: document.getElementById("ov-valutazione").value,
    priorita: document.getElementById("ov-priorita").value,
  };
  markNavSaved("overview");
  showToast("Inspection Overview saved ✓", "success");
}

function markNavSaved(page) {
  const el = document.getElementById("nav-" + page);
  if (el) el.classList.add("saved");
}

// ===========================================================
// SITE INSPECTION – FLOOR READ FORM
// ===========================================================
function siReadStep1Form(floor) {
  if (!floor) return;
  const areaEl = document.getElementById("si-area-cat");
  const labelEl = document.getElementById("si-floor-label");
  const commentsEl = document.getElementById("si-floor-comments");
  const notesEl = document.getElementById("si-floor-notes");
  const riverEl = document.getElementById("si-floor-riverifica");
  if (areaEl) floor.areaCategory = areaEl.value;
  if (labelEl) floor.floorLabel = labelEl.value;
  if (commentsEl) floor.comments = commentsEl.value;
  if (notesEl) floor.notes = notesEl.value;
  if (riverEl) floor.riverifica = riverEl.checked;
}

function siRemoveFloor(floorId) {
  const floors = state.siteInspection.floors;
  if (!confirm("Remove this floor and all its data?")) return;
  const idx = floors.findIndex(f => f.id === floorId);
  if (idx < 0) return;
  floors.splice(idx, 1);
  state.siteInspection.activeFloorId = floors.length > 0 ? floors[0].id : null;
  state.siteInspection.activeCheckId = null;
  state.siteInspection.activeStep = 1;
  updateBadges();
  renderSiSidebarItems();
  renderSiPage();
}

// ===========================================================
// SITE INSPECTION – CONTENT DISPATCH (Steps 1 / 2 / 3)
// ===========================================================
function renderSiPage() {
  const c = document.getElementById("si-active-content");
  const si = state.siteInspection;
  const floorId = si.activeFloorId;
  const checkId = si.activeCheckId;

  if (!floorId) {
    c.innerHTML = `<div class="empty-state"><p>Select a floor from the sidebar or add a new floor / zone to get started.</p></div>`;
    return;
  }
  const floor = getFloor(floorId);
  if (!floor) {
    c.innerHTML = `<div class="empty-state"><p>Floor not found.</p></div>`;
    return;
  }
  if (checkId) {
    renderStep3(c, floor, checkId);
  } else if (si.activeStep === 2) {
    renderStep2(c, floor);
  } else {
    renderStep1(c, floor);
  }
}

// ── Step 1: Floor / Area Identification ─────────────────────
function renderStep1(c, floor) {
  const id = floor.id;
  const vs = siViewerState[id];
  const areaCatOptions = AREA_CATEGORIES.map(
    a => `<option${floor.areaCategory === a ? " selected" : ""}>${a}</option>`
  ).join("");
  const checkCount = floor.selectedChecks.length;
  const savedCount = floor.selectedChecks.filter(cid => floor.checks[cid]?.saved).length;

  const checksOverviewHtml = floor.savedFloor && checkCount > 0 ? `
    <div class="card">
      <div class="card-title"><span class="icon">☑</span> Selected Checks (${checkCount})</div>
      <div class="si-checks-overview">
        ${COMPLIANCE_CATEGORIES.flatMap(cat =>
          cat.items.filter(i => floor.selectedChecks.includes(i.id)).map(item => {
            const check = floor.checks[item.id];
            return `<div class="si-check-ov-item" onclick="navigateToCheck('${id}','${item.id}')">
              <span class="si-check-cat-tag">${cat.label}</span>
              <span class="si-check-ov-label">${item.label}</span>
              <span class="si-check-ov-status ${check?.saved ? "done" : ""}">${check?.saved ? "✓ Done" : "Pending"}</span>
            </div>`;
          })
        ).join("")}
      </div>
    </div>` : "";

  c.innerHTML = `
    <div class="section-header">
      <div>
        <div class="si-step-indicator">Step 1 — Floor / Area Identification</div>
        <h2>${floor.floorLabel || floor.areaCategory || "New Floor / Zone"}</h2>
        <p>Identify this floor or area, add floorplan and photos, then save to configure checks.</p>
      </div>
      ${floor.savedFloor ? `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <button class="btn btn-outline" onclick="siGoToStep2('${id}')">Edit Checks (${checkCount})</button>
        ${checkCount > 0 ? `<span style="font-size:12px;color:var(--text-3)">${savedCount}/${checkCount} done</span>` : ""}
      </div>` : ""}
    </div>

    <div class="card">
      <div class="form-row">
        <div class="form-group">
          <label>Area Category</label>
          <select id="si-area-cat">
            <option value="">-- Select --</option>
            ${areaCatOptions}
          </select>
        </div>
        <div class="form-group">
          <label>Floor / Zone Description</label>
          <input type="text" id="si-floor-label" value="${floor.floorLabel || ""}" placeholder="e.g. Ground Floor - Production Area">
        </div>
      </div>

      <div class="fp-section">
        <div class="fp-section-header">
          <label class="field-label">Floor Plan</label>
          <div style="display:flex;gap:8px">
            <button class="btn btn-secondary btn-sm" onclick="siUploadFloorplan('${id}')">Load Image</button>
            ${floor.floorplanDataUrl ? `<button class="btn btn-secondary btn-sm" onclick="siClearFloorplan('${id}')">Remove</button>` : ""}
          </div>
        </div>
        <input type="file" id="si-fp-input-${id}" accept="image/*" style="display:none" onchange="siFloorplanLoaded('${id}',this)">
        ${floor.floorplanDataUrl
          ? `<div class="img-viewer-wrap" id="fp-viewer-${id}">
               <div class="img-viewer-inner" id="fp-inner-${id}">
                 <img src="${floor.floorplanDataUrl}" id="fp-img-${id}" draggable="false">
                 <div class="img-pins" id="fp-pins-${id}"></div>
               </div>
             </div>
             <div class="img-viewer-toolbar">
               <button class="btn btn-secondary btn-sm" onclick="fpZoom('${id}',0.25)">+ Zoom</button>
               <button class="btn btn-secondary btn-sm" onclick="fpZoom('${id}',-0.25)">- Zoom</button>
               <button class="btn btn-secondary btn-sm" onclick="fpResetZoom('${id}')">Reset</button>
               <button class="btn btn-sm ${vs && vs.pinMode ? "btn-warning" : "btn-outline"}" onclick="fpTogglePinMode('${id}')">
                 ${vs && vs.pinMode ? "Cancel Pin" : "Add Pin"}
               </button>
             </div>
             ${floor.floorplanPins.length > 0 ? renderPinListHtml(floor.floorplanPins, "fp-pin", id) : ""}`
          : `<div class="upload-area" onclick="siUploadFloorplan('${id}')">
               <div class="upload-icon"></div>
               <p>Click to load the area floor plan (JPG, PNG, etc.)</p>
             </div>`
        }
      </div>

      <div class="form-row cols-1" style="margin-top:20px">
        <div class="form-group">
          <label>Comments</label>
          <textarea id="si-floor-comments" placeholder="Enter comments about this floor/area...">${floor.comments || ""}</textarea>
        </div>
      </div>

      <div class="photos-section">
        <div class="photos-section-header">
          <label class="field-label">Photos</label>
          <button class="btn btn-secondary btn-sm" onclick="siAddFloorPhoto('${id}')">+ Photo</button>
        </div>
        <div id="si-photos-list"></div>
      </div>

      <div class="form-row cols-1">
        <div class="form-group">
          <label>Notes</label>
          <textarea id="si-floor-notes" placeholder="Additional notes...">${floor.notes || ""}</textarea>
        </div>
      </div>

      <div class="riverifica-box">
        <input type="checkbox" id="si-floor-riverifica" ${floor.riverifica ? "checked" : ""}>
        <label for="si-floor-riverifica">⚠️ Re-inspection required for this floor</label>
      </div>

      <div class="btn-row">
        <button class="btn btn-danger btn-sm" onclick="siRemoveFloor('${id}')">Remove Floor</button>
        <button class="btn btn-primary" onclick="saveFloor('${id}')">Save Floor → Configure Checks</button>
      </div>
    </div>
    ${checksOverviewHtml}
  `;

  renderFloorPhotos(id);
  if (floor.floorplanDataUrl) {
    setupFloorplanViewer(id);
    renderFloorplanPins(id);
  }
}

// ── Step 2: Check Selection ──────────────────────────────────
function renderStep2(c, floor) {
  const id = floor.id;
  const flLabel = floor.floorLabel || floor.areaCategory || "This Floor";

  c.innerHTML = `
    <div class="section-header">
      <div>
        <div class="si-step-indicator">Step 2 — Compliance Check Selection</div>
        <h2>${flLabel}</h2>
        <p>Select which compliance checks to perform for this floor, then confirm.</p>
      </div>
      <button class="btn btn-secondary" onclick="navigateToFloor('${id}')">← Back to Floor</button>
    </div>

    <div class="si-check-sel-grid">
      ${COMPLIANCE_CATEGORIES.map(cat => `
        <div class="si-check-cat-card">
          <div class="si-check-cat-header">${cat.label}</div>
          ${cat.items.map(item => {
            const isSelected = floor.selectedChecks.includes(item.id);
            return `
            <label class="si-check-sel-item${isSelected ? " selected" : ""}" id="check-item-${id}-${item.id}">
              <input type="checkbox" id="check-cb-${id}-${item.id}" ${isSelected ? "checked" : ""}
                onchange="siToggleCheck('${id}','${item.id}',this.checked)">
              <span>${item.label}</span>
              ${floor.checks[item.id]?.saved ? '<span class="si-check-done-badge">✓</span>' : ""}
            </label>`;
          }).join("")}
        </div>
      `).join("")}
    </div>

    <div class="btn-row">
      <button class="btn btn-secondary" onclick="navigateToFloor('${id}')">← Back</button>
      <button class="btn btn-primary" onclick="siConfirmChecks('${id}')">Confirm Selection</button>
    </div>
  `;
}

// ── Step 3: Check Compilation ────────────────────────────────
function renderStep3(c, floor, checkId) {
  const id = floor.id;
  let checkDef = null;
  let catLabel = "";
  for (const cat of COMPLIANCE_CATEGORIES) {
    const found = cat.items.find(i => i.id === checkId);
    if (found) { checkDef = found; catLabel = cat.label; break; }
  }
  if (!checkDef) {
    c.innerHTML = `<div class="empty-state"><p>Check definition not found.</p></div>`;
    return;
  }

  const check = getOrInitCheck(id, checkId);
  const statusOpts = ["Compliant", "Partially Compliant", "Non Compliant", "To be verified"];
  const flLabel = floor.floorLabel || floor.areaCategory || "Floor";
  const statusCls = check.status === "Compliant" ? "cs-ok"
    : check.status === "Non Compliant" ? "cs-ko"
    : check.status === "Partially Compliant" ? "cs-mid" : "";

  c.innerHTML = `
    <div class="section-header">
      <div>
        <div class="si-step-indicator">Step 3 — Compliance Check</div>
        <div class="macro-tag">${catLabel} · ${flLabel}</div>
        <h2>${checkDef.label}</h2>
        <p>Fill in observations, photos, and compliance status, then save.</p>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        ${check.saved ? '<span style="color:var(--success);font-weight:700;font-size:14px">✓ Saved</span>' : ""}
        <button class="btn btn-secondary" onclick="navigateToFloor('${id}')">← Back to Floor</button>
      </div>
    </div>

    <div class="card">
      <div class="form-row">
        <div class="form-group">
          <label>Compliance Status</label>
          <select id="si-check-status" class="compliance-status-sel ${statusCls}">
            <option value="">— Select Status —</option>
            ${statusOpts.map(o => `<option ${check.status === o ? "selected" : ""}>${o}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label>Status Notes</label>
          <input type="text" id="si-check-status-notes" value="${check.statusNotes || ""}" placeholder="Brief compliance note...">
        </div>
      </div>

      <div class="form-row cols-1">
        <div class="form-group">
          <label>Observations / Comments</label>
          <textarea id="si-check-comments" placeholder="Enter observations for this compliance check...">${check.comments || ""}</textarea>
        </div>
      </div>

      <div class="photos-section">
        <div class="photos-section-header">
          <label class="field-label">Photos</label>
          <button class="btn btn-secondary btn-sm" onclick="siAddCheckPhoto('${id}','${checkId}')">+ Photo</button>
        </div>
        <div id="si-check-photos-list"></div>
      </div>

      <div class="form-row cols-1">
        <div class="form-group">
          <label>Notes</label>
          <textarea id="si-check-notes" placeholder="Additional notes...">${check.notes || ""}</textarea>
        </div>
      </div>

      <div class="riverifica-box">
        <input type="checkbox" id="si-check-riverifica" ${check.riverifica ? "checked" : ""}>
        <label for="si-check-riverifica">⚠️ Re-inspection required for this check</label>
      </div>

      <div class="btn-row">
        <button class="btn btn-primary" onclick="saveCheck('${id}','${checkId}')">Save Check</button>
      </div>
    </div>
  `;

  renderCheckPhotos(id, checkId);
}

// ===========================================================
// FLOORPLAN VIEWER
// ===========================================================
const siViewerState = {}; // keyed by section id: {zoom, panX, panY, dragging, pinMode}

function siUploadFloorplan(id) {
  document.getElementById("si-fp-input-" + id)?.click();
}

function siFloorplanLoaded(id, input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const floor = getFloor(id);
    if (!floor) return;
    siReadStep1Form(floor);
    floor.floorplanDataUrl = e.target.result;
    siViewerState[id] = { zoom: 1, panX: 0, panY: 0, dragging: false, startX: 0, startY: 0, pinMode: false };
    renderSiPage();
  };
  reader.readAsDataURL(file);
}

function siClearFloorplan(id) {
  const fl = getFloor(id);
  if (!fl) return;
  siReadStep1Form(fl);
  fl.floorplanDataUrl = null;
  fl.floorplanPins = [];
  delete siViewerState[id];
  renderSiPage();
}

function setupFloorplanViewer(id) {
  const wrap = document.getElementById("fp-viewer-" + id);
  const inner = document.getElementById("fp-inner-" + id);
  if (!wrap || !inner) return;

  if (!siViewerState[id]) {
    siViewerState[id] = {
      zoom: 1,
      panX: 0,
      panY: 0,
      dragging: false,
      startX: 0,
      startY: 0,
      pinMode: false,
    };
  }
  const vs = siViewerState[id];

  function applyTransform() {
    inner.style.transform = `translate(${vs.panX}px,${vs.panY}px) scale(${vs.zoom})`;
  }
  applyTransform();

  // Wheel zoom
  wrap.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      vs.zoom = Math.min(
        6,
        Math.max(0.2, vs.zoom * (e.deltaY < 0 ? 1.1 : 0.9)),
      );
      applyTransform();
    },
    { passive: false },
  );

  // Pan drag
  let hasDragged = false;
  wrap.addEventListener("mousedown", (e) => {
    if (vs.pinMode) return;
    vs.dragging = true;
    hasDragged = false;
    vs.startX = e.clientX - vs.panX;
    vs.startY = e.clientY - vs.panY;
    wrap.style.cursor = "grabbing";
  });
  const onMouseMove = (e) => {
    if (!vs.dragging) return;
    const nx = e.clientX - vs.startX;
    const ny = e.clientY - vs.startY;
    if (Math.abs(nx - vs.panX) > 2 || Math.abs(ny - vs.panY) > 2)
      hasDragged = true;
    vs.panX = nx;
    vs.panY = ny;
    applyTransform();
  };
  const onMouseUp = () => {
    vs.dragging = false;
    wrap.style.cursor = vs.pinMode ? "crosshair" : "grab";
  };
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);

  // Click to place pin
  wrap.addEventListener("click", (e) => {
    if (!vs.pinMode || hasDragged) return;
    const img = document.getElementById("fp-img-" + id);
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const x = parseFloat(
      (((e.clientX - rect.left) / rect.width) * 100).toFixed(1),
    );
    const y = parseFloat(
      (((e.clientY - rect.top) / rect.height) * 100).toFixed(1),
    );
    if (x < 0 || x > 100 || y < 0 || y > 100) return;
    const note = prompt("Add a note for this pin (optional):") ?? "";
    getFloor(id).floorplanPins.push({ x, y, note });
    renderFloorplanPins(id);
    // refresh pin list below without full re-render
    const listEl = document.getElementById("fp-pin-list");
    const fl = getFloor(id);
    if (listEl) {
      listEl.outerHTML = renderPinListHtml(fl.floorplanPins, "fp-pin", id);
    } else {
      // append after toolbar
      const toolbar = document.querySelector(".img-viewer-toolbar");
      if (toolbar)
        toolbar.insertAdjacentHTML(
          "afterend",
          renderPinListHtml(fl.floorplanPins, "fp-pin", id),
        );
    }
  });

  wrap.style.cursor = "grab";
}

function fpZoom(id, delta) {
  const vs = siViewerState[id];
  if (!vs) return;
  vs.zoom = Math.min(6, Math.max(0.2, vs.zoom + delta));
  const inner = document.getElementById("fp-inner-" + id);
  if (inner)
    inner.style.transform = `translate(${vs.panX}px,${vs.panY}px) scale(${vs.zoom})`;
}

function fpResetZoom(id) {
  const vs = siViewerState[id];
  if (!vs) return;
  vs.zoom = 1;
  vs.panX = 0;
  vs.panY = 0;
  const inner = document.getElementById("fp-inner-" + id);
  if (inner) inner.style.transform = "translate(0,0) scale(1)";
}

function fpTogglePinMode(id) {
  const vs = siViewerState[id];
  if (!vs) return;
  vs.pinMode = !vs.pinMode;
  renderSiPage();
}

function renderFloorplanPins(id) {
  const fl = getFloor(id);
  const container = document.getElementById("fp-pins-" + id);
  if (!container || !fl) return;
  container.innerHTML = fl.floorplanPins
    .map(
      (p, i) => `
    <div class="img-pin" style="left:${p.x}%;top:${p.y}%" title="${p.note || "Pin " + (i + 1)}">
      <span class="img-pin-num">${i + 1}</span>
    </div>
  `,
    )
    .join("");
}

function removeFpPin(id, idx) {
  const fl = getFloor(id);
  if (!fl) return;
  siReadStep1Form(fl);
  fl.floorplanPins.splice(idx, 1);
  renderFloorplanPins(id);
  const listEl = document.getElementById("fp-pin-list");
  if (listEl)
    listEl.outerHTML = fl.floorplanPins.length
      ? renderPinListHtml(fl.floorplanPins, "fp-pin", id)
      : '<div id="fp-pin-list"></div>';
}

function renderPinListHtml(pins, prefix, id) {
  if (!pins.length) return "";
  const fl = getFloor(id);
  return `<div class="pin-list" id="${prefix}-list">
    ${pins
      .map((p, i) => {
        const linked = fl ? fl.photos.filter((ph) => ph.fpPinRef === i) : [];
        const badges = linked
          .map(
            (ph) =>
              `<span class="pin-photo-badge" title="${ph.note || ph.code}">${ph.code || "Foto"}</span>`,
          )
          .join("");
        return `
        <div class="pin-list-item">
          <span class="pin-list-num">${i + 1}</span>
          <input class="pin-list-note" value="${p.note || ""}"
            onchange="updateFpPinNote('${id}',${i},this.value)" placeholder="Add note...">
          ${badges ? `<div class="pin-photo-refs">${badges}</div>` : ""}
          <span class="pin-list-coords">${p.x}%, ${p.y}%</span>
          <button class="btn btn-danger btn-sm" onclick="removeFpPin('${id}',${i})">✕</button>
        </div>`;
      })
      .join("")}
  </div>`;
}

function updateFpPinNote(id, idx, val) {
  const fl = getFloor(id);
  if (fl && fl.floorplanPins[idx]) fl.floorplanPins[idx].note = val;
}

function siLinkPhotoToPin(id, photoIdx, value) {
  const fl = getFloor(id);
  if (!fl) return;
  fl.photos[photoIdx].fpPinRef = value === "" ? null : parseInt(value, 10);
  // refresh just the pin list so linked-photo badges update
  const listEl = document.getElementById("fp-pin-list");
  if (listEl)
    listEl.outerHTML = renderPinListHtml(fl.floorplanPins, "fp-pin", id);
}

// ===========================================================
// SITE INSPECTION – PHOTOS WITH ANNOTATIONS
// ===========================================================

// Generic photo renderer (used for both floor and check photos)
function _renderPhotoList(containerId, photos, floorplanPins, scopeId, removeCallback, pinCallback) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (photos.length === 0) {
    container.innerHTML = '<p style="color:var(--text-3);font-size:13px;padding:8px 0">No photos added yet.</p>';
    return;
  }
  container.innerHTML = photos.map((p, i) => {
    const pinSelector = floorplanPins && floorplanPins.length > 0 ? `
      <select class="photo-pin-select" title="Link to floor plan pin"
        onchange="siLinkPhotoToPin('${scopeId}',${i},this.value)">
        <option value="">📍 —</option>
        ${floorplanPins.map((fp, pi) =>
          `<option value="${pi}" ${p.fpPinRef === pi ? "selected" : ""}>Pin ${pi + 1}${fp.note ? " · " + fp.note.substring(0, 22) : ""}</option>`
        ).join("")}
      </select>` : "";
    return `
    <div class="photo-card">
      <div class="photo-card-header">
        <input class="photo-code-input" value="${p.code}"
          onchange="${pinCallback ? `siUpdateFloorPhotoCode('${scopeId}',${i},this.value)` : `siUpdateCheckPhotoCode('${scopeId}','${containerId}',${i},this.value)`}" placeholder="Code">
        <input class="photo-note-input" value="${p.note}"
          onchange="${pinCallback ? `siUpdateFloorPhotoNote('${scopeId}',${i},this.value)` : `siUpdateCheckPhotoNote('${scopeId}','${containerId}',${i},this.value)`}" placeholder="Description...">
        ${pinSelector}
        ${p.fpPinRef !== null && p.fpPinRef !== undefined ? `<span class="photo-pin-badge">Pin ${p.fpPinRef + 1}</span>` : ""}
        <button id="photo-pin-btn-${scopeId}-${i}" class="btn btn-outline btn-sm"
          onclick="${pinCallback}('${scopeId}',${i})">Annotate</button>
        <button class="btn btn-danger btn-sm" onclick="${removeCallback}('${scopeId}',${i})">✕</button>
      </div>
      ${p.dataUrl ? `
        <div class="photo-viewer-wrap">
          <div class="photo-img-wrap" id="photo-wrap-${scopeId}-${i}">
            <img src="${p.dataUrl}" class="photo-img" id="photo-img-${scopeId}-${i}" draggable="false" alt="Photo ${i+1}">
            <div class="img-pins" id="photo-pins-${scopeId}-${i}">
              ${p.pins.map((pin, pi) => `
                <div class="img-pin" style="left:${pin.x}%;top:${pin.y}%" title="${pin.note || "Pin " + (pi + 1)}">
                  <span class="img-pin-num">${pi + 1}</span>
                </div>`).join("")}
            </div>
            <div class="photo-overlay" id="photo-overlay-${scopeId}-${i}" data-pin-mode="false" style="pointer-events:none"></div>
          </div>
          ${p.pins.length > 0 ? `
            <div class="pin-list" style="margin-top:6px">
              ${p.pins.map((pin, pi) => `
                <div class="pin-list-item">
                  <span class="pin-list-num">${pi + 1}</span>
                  <input class="pin-list-note" value="${pin.note || ""}"
                    onchange="${pinCallback ? `updateFloorPhotoPinNote('${scopeId}',${i},${pi},this.value)` : `updateCheckPhotoPinNote('${scopeId}','${containerId}',${i},${pi},this.value)`}" placeholder="Note...">
                  <button class="btn btn-danger btn-sm" onclick="${pinCallback ? `siRemoveFloorPhotoPin('${scopeId}',${i},${pi})` : `siRemoveCheckPhotoPin('${scopeId}','${containerId}',${i},${pi})`}">✕</button>
                </div>`).join("")}
            </div>` : ""}
        </div>` : '<div class="photo-no-img">📷 No image loaded</div>'}
    </div>`;
  }).join("");

  // Attach click-to-pin handlers
  photos.forEach((p, i) => {
    if (!p.dataUrl) return;
    const overlay = document.getElementById(`photo-overlay-${scopeId}-${i}`);
    if (!overlay) return;
    overlay.addEventListener("click", (e) => {
      if (overlay.dataset.pinMode !== "true") return;
      const img = document.getElementById(`photo-img-${scopeId}-${i}`);
      if (!img) return;
      const rect = img.getBoundingClientRect();
      const x = parseFloat((((e.clientX - rect.left) / rect.width) * 100).toFixed(1));
      const y = parseFloat((((e.clientY - rect.top) / rect.height) * 100).toFixed(1));
      if (x < 0 || x > 100 || y < 0 || y > 100) return;
      const note = prompt("Add a note for this pin (optional):") ?? "";
      photos[i].pins.push({ x, y, note });
      _renderPhotoList(containerId, photos, floorplanPins, scopeId, removeCallback, pinCallback);
    });
  });
}

// ── Floor photos (Step 1) ────────────────────────────────────
function siAddFloorPhoto(floorId) {
  const floor = getFloor(floorId);
  if (!floor) return;
  siReadStep1Form(floor);
  const n = floor.photos.length + 1;
  const code = "FL-" + floorId.substring(0, 6).toUpperCase() + "-" + String(n).padStart(3, "0");
  const inp = document.createElement("input");
  inp.type = "file"; inp.accept = "image/*";
  inp.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      floor.photos.push({ dataUrl: ev.target.result, code, note: "", pins: [], fpPinRef: null });
      renderFloorPhotos(floorId);
    };
    reader.readAsDataURL(file);
  };
  inp.click();
}

function siRemoveFloorPhoto(floorId, idx) {
  const floor = getFloor(floorId);
  if (!floor) return;
  siReadStep1Form(floor);
  floor.photos.splice(idx, 1);
  renderFloorPhotos(floorId);
}

function siUpdateFloorPhotoCode(floorId, idx, val) { const fl = getFloor(floorId); if (fl) fl.photos[idx].code = val; }
function siUpdateFloorPhotoNote(floorId, idx, val) { const fl = getFloor(floorId); if (fl) fl.photos[idx].note = val; }

function siAddFloorPhotoPin(floorId, photoIdx) {
  const overlay = document.getElementById(`photo-overlay-${floorId}-${photoIdx}`);
  if (!overlay) return;
  const active = overlay.dataset.pinMode !== "true";
  overlay.dataset.pinMode = active ? "true" : "false";
  overlay.style.cursor = active ? "crosshair" : "default";
  overlay.style.pointerEvents = active ? "all" : "none";
  const btn = document.getElementById(`photo-pin-btn-${floorId}-${photoIdx}`);
  if (btn) { btn.className = `btn btn-sm ${active ? "btn-warning" : "btn-outline"}`; btn.textContent = active ? "📍 Cancel" : "📍 Annotate"; }
}

function siRemoveFloorPhotoPin(floorId, photoIdx, pinIdx) {
  const fl = getFloor(floorId);
  if (fl) fl.photos[photoIdx].pins.splice(pinIdx, 1);
  renderFloorPhotos(floorId);
}

function updateFloorPhotoPinNote(floorId, photoIdx, pinIdx, val) {
  const fl = getFloor(floorId);
  if (fl) fl.photos[photoIdx].pins[pinIdx].note = val;
}

function renderFloorPhotos(floorId) {
  const fl = getFloor(floorId);
  if (!fl) return;
  _renderPhotoList("si-photos-list", fl.photos, fl.floorplanPins, floorId, "siRemoveFloorPhoto", "siAddFloorPhotoPin");
}

// ── Check photos (Step 3) ────────────────────────────────────
function siAddCheckPhoto(floorId, checkId) {
  const check = getOrInitCheck(floorId, checkId);
  if (!check) return;
  const scopeId = `${floorId}__${checkId}`;
  const n = check.photos.length + 1;
  const code = checkId.toUpperCase().replace(/-/g,"").substring(0,8) + "-" + String(n).padStart(3,"0");
  const inp = document.createElement("input");
  inp.type = "file"; inp.accept = "image/*";
  inp.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      check.photos.push({ dataUrl: ev.target.result, code, note: "", pins: [], fpPinRef: null });
      renderCheckPhotos(floorId, checkId);
    };
    reader.readAsDataURL(file);
  };
  inp.click();
}

function siRemoveCheckPhoto(floorId, checkId, idx) {
  const check = getOrInitCheck(floorId, checkId);
  if (check) { check.photos.splice(idx, 1); renderCheckPhotos(floorId, checkId); }
}

// Note: these use composite scopeId pattern "floorId__checkId" to allow lookup
function siUpdateCheckPhotoCode(floorId, checkId, idx, val) {
  const check = getOrInitCheck(floorId, checkId);
  if (check) check.photos[idx].code = val;
}
function siUpdateCheckPhotoNote(floorId, checkId, idx, val) {
  const check = getOrInitCheck(floorId, checkId);
  if (check) check.photos[idx].note = val;
}
function siAddCheckPhotoPin(floorId, checkId, photoIdx) {
  const scopeId = `${floorId}__${checkId}`;
  const overlay = document.getElementById(`photo-overlay-${scopeId}-${photoIdx}`);
  if (!overlay) return;
  const active = overlay.dataset.pinMode !== "true";
  overlay.dataset.pinMode = active ? "true" : "false";
  overlay.style.cursor = active ? "crosshair" : "default";
  overlay.style.pointerEvents = active ? "all" : "none";
  const btn = document.getElementById(`photo-pin-btn-${scopeId}-${photoIdx}`);
  if (btn) { btn.className = `btn btn-sm ${active ? "btn-warning" : "btn-outline"}`; btn.textContent = active ? "📍 Cancel" : "📍 Annotate"; }
}
function siRemoveCheckPhotoPin(floorId, checkId, photoIdx, pinIdx) {
  const check = getOrInitCheck(floorId, checkId);
  if (check) { check.photos[photoIdx].pins.splice(pinIdx, 1); renderCheckPhotos(floorId, checkId); }
}
function updateCheckPhotoPinNote(floorId, checkId, photoIdx, pinIdx, val) {
  const check = getOrInitCheck(floorId, checkId);
  if (check) check.photos[photoIdx].pins[pinIdx].note = val;
}

function renderCheckPhotos(floorId, checkId) {
  _renderCheckPhotosInline(floorId, checkId);
}

function _renderCheckPhotosInline(floorId, checkId) {
  const check = getOrInitCheck(floorId, checkId);
  const container = document.getElementById("si-check-photos-list");
  if (!container || !check) return;
  if (check.photos.length === 0) {
    container.innerHTML = '<p style="color:var(--text-3);font-size:13px;padding:8px 0">No photos added yet.</p>';
    return;
  }
  const scopeId = `${floorId}__${checkId}`;
  container.innerHTML = check.photos.map((p, i) => `
    <div class="photo-card">
      <div class="photo-card-header">
        <input class="photo-code-input" value="${p.code}"
          onchange="(function(v){const c=getOrInitCheck('${floorId}','${checkId}');if(c)c.photos[${i}].code=v;})(this.value)" placeholder="Code">
        <input class="photo-note-input" value="${p.note}"
          onchange="(function(v){const c=getOrInitCheck('${floorId}','${checkId}');if(c)c.photos[${i}].note=v;})(this.value)" placeholder="Description...">
        <button id="photo-pin-btn-${scopeId}-${i}" class="btn btn-outline btn-sm"
          onclick="siAddCheckPhotoPin('${floorId}','${checkId}',${i})">Annotate</button>
        <button class="btn btn-danger btn-sm" onclick="siRemoveCheckPhoto('${floorId}','${checkId}',${i})">✕</button>
      </div>
      ${p.dataUrl ? `
        <div class="photo-viewer-wrap">
          <div class="photo-img-wrap" id="photo-wrap-${scopeId}-${i}">
            <img src="${p.dataUrl}" class="photo-img" id="photo-img-${scopeId}-${i}" draggable="false" alt="Photo ${i+1}">
            <div class="img-pins" id="photo-pins-${scopeId}-${i}">
              ${p.pins.map((pin, pi) => `
                <div class="img-pin" style="left:${pin.x}%;top:${pin.y}%" title="${pin.note || "Pin " + (pi + 1)}">
                  <span class="img-pin-num">${pi + 1}</span>
                </div>`).join("")}
            </div>
            <div class="photo-overlay" id="photo-overlay-${scopeId}-${i}" data-pin-mode="false" style="pointer-events:none"></div>
          </div>
          ${p.pins.length > 0 ? `
            <div class="pin-list" style="margin-top:6px">
              ${p.pins.map((pin, pi) => `
                <div class="pin-list-item">
                  <span class="pin-list-num">${pi + 1}</span>
                  <input class="pin-list-note" value="${pin.note || ""}"
                    onchange="(function(v){const c=getOrInitCheck('${floorId}','${checkId}');if(c)c.photos[${i}].pins[${pi}].note=v;})(this.value)" placeholder="Note...">
                  <button class="btn btn-danger btn-sm" onclick="siRemoveCheckPhotoPin('${floorId}','${checkId}',${i},${pi})">✕</button>
                </div>`).join("")}
            </div>` : ""}
        </div>` : '<div class="photo-no-img">📷 No image loaded</div>'}
    </div>`).join("");

  // Attach click-to-pin handlers
  check.photos.forEach((p, i) => {
    if (!p.dataUrl) return;
    const overlay = document.getElementById(`photo-overlay-${scopeId}-${i}`);
    if (!overlay) return;
    overlay.addEventListener("click", (e) => {
      if (overlay.dataset.pinMode !== "true") return;
      const img = document.getElementById(`photo-img-${scopeId}-${i}`);
      if (!img) return;
      const rect = img.getBoundingClientRect();
      const x = parseFloat((((e.clientX - rect.left) / rect.width) * 100).toFixed(1));
      const y = parseFloat((((e.clientY - rect.top) / rect.height) * 100).toFixed(1));
      if (x < 0 || x > 100 || y < 0 || y > 100) return;
      const note = prompt("Add a note for this pin (optional):") ?? "";
      check.photos[i].pins.push({ x, y, note });
      _renderCheckPhotosInline(floorId, checkId);
    });
  });
}

// ===========================================================
// SI STEP 2 ACTIONS + SAVE FUNCTIONS
// ===========================================================
function siToggleCheck(floorId, checkId, checked) {
  const floor = getFloor(floorId);
  if (!floor) return;
  if (checked) {
    if (!floor.selectedChecks.includes(checkId)) floor.selectedChecks.push(checkId);
    if (!floor.checks[checkId]) floor.checks[checkId] = createEmptyCheck();
  } else {
    floor.selectedChecks = floor.selectedChecks.filter(id => id !== checkId);
  }
  const item = document.getElementById(`check-item-${floorId}-${checkId}`);
  if (item) item.classList.toggle("selected", checked);
}

function siConfirmChecks(floorId) {
  const floor = getFloor(floorId);
  if (!floor) return;
  floor.selectedChecks.forEach(checkId => {
    if (!floor.checks[checkId]) floor.checks[checkId] = createEmptyCheck();
  });
  state.siteInspection.activeStep = 1;
  state.siteInspection.activeCheckId = null;
  updateBadges();
  renderSiSidebarItems();
  renderSiPage();
  showToast(`${floor.selectedChecks.length} check${floor.selectedChecks.length !== 1 ? "s" : ""} configured ✓`, "success");
}

function saveFloor(floorId) {
  const floor = getFloor(floorId);
  if (!floor) return;
  siReadStep1Form(floor);
  floor.savedFloor = true;
  state.siteInspection.activeStep = 2;
  updateBadges();
  renderSiSidebarItems();
  renderSiPage();
  showToast("Floor saved ✓ — now select checks", "success");
}

function saveCheck(floorId, checkId) {
  const floor = getFloor(floorId);
  if (!floor) return;
  const check = getOrInitCheck(floorId, checkId);
  const commentsEl = document.getElementById("si-check-comments");
  const notesEl = document.getElementById("si-check-notes");
  const riverEl = document.getElementById("si-check-riverifica");
  const statusEl = document.getElementById("si-check-status");
  const statusNotesEl = document.getElementById("si-check-status-notes");
  if (commentsEl) check.comments = commentsEl.value;
  if (notesEl) check.notes = notesEl.value;
  if (riverEl) check.riverifica = riverEl.checked;
  if (statusEl) check.status = statusEl.value;
  if (statusNotesEl) check.statusNotes = statusNotesEl.value;
  check.saved = true;
  updateBadges();
  renderSiSidebarItems();
  renderSiPage();
  showToast("Check saved ✓", "success");
}

// ===========================================================
// PLANT TESTS
// ===========================================================
function createEmptyTest() {
  return {
    test: "",
    piano: "",
    localizzazione: "",
    tipoAttivazione: "",
    expectedResults: "",
    risultati: "",
    status: "",
    photoEvidence: "",
  };
}

function renderPtContent() {
  const id = state.activePtSection;
  if (!id || !state.plantTests[id]) return;
  const sec = PT_SECTIONS.find((s) => s.id === id);
  const data = state.plantTests[id];
  const c = document.getElementById("pt-active-content");

  const testsHtml = data.tests
    .map(
      (t, i) => `
    <div class="test-item">
      <div class="test-item-header">
        <span class="test-item-title">Test #${i + 1}</span>
        ${data.tests.length > 1 ? `<button class="btn btn-danger btn-sm" onclick="removePtTest('${id}',${i})">✕ Remove</button>` : ""}
      </div>
      <div class="form-row cols-3">
        <div class="form-group">
          <label>Test Code</label>
          <input value="${t.test}" onchange="state.plantTests['${id}'].tests[${i}].test=this.value" placeholder="e.g. T-001">
        </div>
        <div class="form-group">
          <label>Floor</label>
          <input value="${t.piano}" onchange="state.plantTests['${id}'].tests[${i}].piano=this.value" placeholder="e.g. Ground Floor">
        </div>
        <div class="form-group">
          <label>Location</label>
          <input value="${t.localizzazione}" onchange="state.plantTests['${id}'].tests[${i}].localizzazione=this.value" placeholder="e.g. Zone A">
        </div>
      </div>
      <div class="form-row cols-2">
        <div class="form-group">
          <label>Activation Type</label>
          <select onchange="state.plantTests['${id}'].tests[${i}].tipoAttivazione=this.value">
            <option ${!t.tipoAttivazione ? "selected" : ""} value="">-- Select --</option>
            <option ${t.tipoAttivazione === "Automatic" ? "selected" : ""}>Automatic</option>
            <option ${t.tipoAttivazione === "Manual" ? "selected" : ""}>Manual</option>
            <option ${t.tipoAttivazione === "Remote" ? "selected" : ""}>Remote</option>
            <option ${t.tipoAttivazione === "Semi-auto" ? "selected" : ""}>Semi-auto</option>
          </select>
        </div>
        <div class="form-group">
          <label>Expected Results</label>
          <input value="${t.expectedResults || ""}" onchange="state.plantTests['${id}'].tests[${i}].expectedResults=this.value" placeholder="e.g. Alarm within 30s">
        </div>
      </div>
      <div class="form-row cols-3">
        <div class="form-group">
          <label>Results</label>
          <input value="${t.risultati}" onchange="state.plantTests['${id}'].tests[${i}].risultati=this.value" placeholder="e.g. Alarm triggered within 28s">
        </div>
        <div class="form-group">
          <label>Status</label>
          <select onchange="state.plantTests['${id}'].tests[${i}].status=this.value">
            <option ${!t.status ? "selected" : ""} value="">-- Select --</option>
            <option ${t.status === "Passed" ? "selected" : ""}>Passed</option>
            <option ${t.status === "Failed" ? "selected" : ""}>Failed</option>
          </select>
        </div>
        <div class="form-group">
          <label>Photographic Evidence</label>
          <input value="${t.photoEvidence || ""}" onchange="state.plantTests['${id}'].tests[${i}].photoEvidence=this.value" placeholder="Photo code or reference">
        </div>
      </div>
    </div>
  `,
    )
    .join("");

  c.innerHTML = `
    <div class="section-header">
      <div>
        <h2><span class="sec-icon">${sec.icon}</span>${sec.label}</h2>
        <p>Plant Tests — add completed tests and save</p>
      </div>
      ${data.saved ? '<span style="color:var(--success);font-weight:700;font-size:14px">✓ Saved</span>' : ""}
    </div>
    <div class="card">
      ${testsHtml}
      <div class="btn-row">
        <button class="btn btn-secondary" onclick="addPtTest('${id}')">+ Add Test</button>
        <button class="btn btn-primary"   onclick="savePtSection('${id}')">Save Section</button>
      </div>
    </div>
  `;
}

function addPtTest(id) {
  state.plantTests[id].tests.push(createEmptyTest());
  renderPtContent();
}

function removePtTest(id, i) {
  state.plantTests[id].tests.splice(i, 1);
  renderPtContent();
}

function savePtSection(id) {
  state.plantTests[id].saved = true;
  updateBadges();
  renderPtSidebarItems();
  renderPtContent();
  showToast("Test section saved ✓", "success");
}

// ===========================================================
// BADGES
// ===========================================================
function updateBadges() {
  const floors = state.siteInspection.floors || [];
  const savedChecks = floors.reduce((n, fl) =>
    n + Object.values(fl.checks).filter(c => c.saved).length, 0);
  document.getElementById("badge-site").textContent = savedChecks;
  document.getElementById("badge-plant").textContent = Object.values(
    state.plantTests,
  ).filter((v) => v.saved).length;
}

// ===========================================================
// PREVIEW
// ===========================================================
function renderPreview() {
  const el = document.getElementById("preview-content");
  const l = state.location;
  const o = state.overview;
  const floors = state.siteInspection.floors || [];
  const savedFloors = floors.filter(f => f.savedFloor);
  const savedPt = PT_SECTIONS.filter(s => state.plantTests[s.id]?.saved);

  let html = `<div class="preview-doc">
    <h1>FIRE SAFETY INSPECTION REPORT</h1>
    <p class="preview-subtitle">${l.verbale || "N/A"} — ${l.date || ""}</p>`;

  // 1. Location
  html += `<div class="preview-section"><h2>1. Location &amp; Participants</h2>
    <div class="preview-kv">
      <span class="k">Date:</span>            <span class="v">${l.date || "—"}</span>
      <span class="k">Report No.:</span>      <span class="v">${l.verbale || "—"}</span>
      <span class="k">Inspection No.:</span>  <span class="v">${l.nrSopralluogo || "—"}</span>
      <span class="k">Location:</span>        <span class="v">${l.luogo || "—"}</span>
      <span class="k">Type:</span>            <span class="v">${l.tipo || "—"}</span>
      <span class="k">Client:</span>          <span class="v">${l.cliente || "—"}</span>
      <span class="k">Activity:</span>        <span class="v">${l.desc || "—"}</span>
    </div>`;
  if (state.participants.length > 0) {
    html += `<h3>Participants</h3>
    <table class="preview-table">
      <tr><th>Name</th><th>Role</th><th>Company</th><th>Email</th></tr>
      ${state.participants.map(p => `<tr><td>${p.nome}</td><td>${p.ruolo}</td><td>${p.azienda}</td><td>${p.email}</td></tr>`).join("")}
    </table>`;
  }
  html += "</div>";

  // 2. Overview
  if (o.obiettivo || o.note) {
    html += `<div class="preview-section"><h2>2. Inspection Overview</h2>
      <div class="preview-kv">
        ${o.obiettivo ? `<span class="k">Objective:</span><span class="v">${o.obiettivo}</span>` : ""}
        ${o.valutazione ? `<span class="k">Assessment:</span><span class="v"><strong>${o.valutazione}</strong></span>` : ""}
        ${o.priorita ? `<span class="k">Priority:</span><span class="v">${o.priorita}</span>` : ""}
        ${o.note ? `<span class="k">Notes:</span><span class="v">${o.note}</span>` : ""}
        ${o.docs ? `<span class="k">Documentation:</span><span class="v" style="white-space:pre-line">${o.docs}</span>` : ""}
      </div></div>`;
  }

  // 3. Site Inspection — floors-first
  if (savedFloors.length > 0) {
    html += `<div class="preview-section"><h2>3. Site Inspection</h2>`;
    savedFloors.forEach(fl => {
      const flLabel = fl.floorLabel || fl.areaCategory || "Floor";
      const flSub = fl.areaCategory && fl.floorLabel ? " — " + fl.areaCategory : "";
      html += `<h3>${flLabel}${flSub}</h3>`;
      // Floor identification
      html += `<div class="preview-floor-block">`;
      html += `<div class="preview-kv">`;
      if (fl.comments) html += `<span class="k">Comments:</span><span class="v">${fl.comments}</span>`;
      if (fl.notes) html += `<span class="k">Notes:</span><span class="v">${fl.notes}</span>`;
      if (fl.riverifica) html += `<span class="k">Re-inspection:</span><span class="v riverifica-flag">⚠️ RE-INSPECTION REQUIRED</span>`;
      html += `</div>`;
      if (fl.floorplanPins.length > 0) {
        html += `<div class="preview-pins-summary">Floor plan pins: ${fl.floorplanPins.map((p, i) => {
          const linked = fl.photos.filter(ph => ph.fpPinRef === i).map(ph => ph.code).join(", ");
          return `(${i + 1}) ${p.note || "—"}${linked ? " → " + linked : ""}`;
        }).join(" · ")}</div>`;
      }
      if (fl.photos.length > 0) {
        html += `<table class="preview-table" style="margin-top:8px">
          <tr><th>Code</th><th>Pin</th><th>Description</th><th>Annotations</th></tr>
          ${fl.photos.map(p => `<tr>
            <td><strong>${p.code}</strong></td>
            <td>${p.fpPinRef !== null && p.fpPinRef !== undefined
              ? `<span class="preview-xref">⬡ ${p.fpPinRef + 1}</span>${fl.floorplanPins[p.fpPinRef]?.note ? " " + fl.floorplanPins[p.fpPinRef].note : ""}`
              : "—"}</td>
            <td>${p.note}</td>
            <td>${p.pins.length > 0 ? p.pins.map((pp, pi) => `(${pi + 1}) ${pp.note || "—"}`).join(" · ") : "—"}</td>
          </tr>`).join("")}
        </table>`;
      }

      // Compliance checks grouped by macro
      if (fl.selectedChecks.length > 0) {
        COMPLIANCE_CATEGORIES.forEach(cat => {
          const catChecks = cat.items.filter(i => fl.selectedChecks.includes(i.id));
          if (!catChecks.length) return;
          html += `<div class="preview-macro-label">${cat.label}</div>`;
          catChecks.forEach(item => {
            const check = fl.checks[item.id];
            if (!check?.saved) return;
            const statusCls = check.status === "Compliant" ? "color:var(--success)"
              : check.status === "Non Compliant" ? "color:var(--danger)"
              : check.status === "Partially Compliant" ? "color:var(--warning)" : "";
            html += `<h3 style="font-size:12px;margin:10px 0 5px">${item.label}</h3>
              <div class="preview-kv">
                ${check.status ? `<span class="k">Status:</span><span class="v" style="${statusCls};font-weight:600">${check.status}</span>` : ""}
                ${check.statusNotes ? `<span class="k">Status Note:</span><span class="v">${check.statusNotes}</span>` : ""}
                ${check.comments ? `<span class="k">Comments:</span><span class="v">${check.comments}</span>` : ""}
                ${check.notes ? `<span class="k">Notes:</span><span class="v">${check.notes}</span>` : ""}
                ${check.riverifica ? `<span class="k">Re-inspection:</span><span class="v riverifica-flag">⚠️ REQUIRED</span>` : ""}
              </div>`;
            if (check.photos?.length > 0) {
              html += `<table class="preview-table" style="margin-top:4px">
                <tr><th>Code</th><th>Description</th></tr>
                ${check.photos.map(p => `<tr><td><strong>${p.code}</strong></td><td>${p.note}</td></tr>`).join("")}
              </table>`;
            }
          });
        });
      }
      html += `</div>`;
    });
    html += `</div>`;
  }

  // 4. Plant Tests
  if (savedPt.length > 0) {
    html += `<div class="preview-section"><h2>4. Plant Tests</h2>`;
    savedPt.forEach((s, idx) => {
      const d = state.plantTests[s.id];
      html += `<h3>${idx + 1}. ${s.icon} ${s.label}</h3>
        <table class="preview-table">
          <tr><th>Test Code</th><th>Floor</th><th>Location</th><th>Activation</th><th>Expected Results</th><th>Results</th><th>Status</th><th>Photo Evidence</th></tr>
          ${d.tests.map(t => {
            const statusCls = t.status === "Passed" ? "color:var(--success);font-weight:600"
              : t.status === "Failed" ? "color:var(--danger);font-weight:600" : "";
            return `<tr>
              <td>${t.test}</td><td>${t.piano}</td><td>${t.localizzazione}</td>
              <td>${t.tipoAttivazione}</td><td>${t.expectedResults||"—"}</td>
              <td>${t.risultati}</td>
              <td style="${statusCls}">${t.status||"—"}</td>
              <td>${t.photoEvidence||"—"}</td>
            </tr>`;
          }).join("")}
        </table>`;
    });
    html += "</div>";
  }

  if (savedFloors.length === 0 && savedPt.length === 0 && !o.obiettivo) {
    html += `<div class="empty-state"><div class="empty-icon">📝</div><p>No sections saved yet.<br>Fill in and save sections to see them here.</p></div>`;
  }

  html += `<div style="margin-top:40px;padding-top:16px;border-top:1px solid var(--border);text-align:center;color:var(--text-3);font-size:11px">
    Report generated with Site Insight — ${new Date().toLocaleDateString("en-GB")}
  </div></div>`;

  el.innerHTML = html;
}

// ===========================================================
// PDF EXPORT
// ===========================================================
function updateExportInfo() {
  const floors = state.siteInspection.floors || [];
  const savedFloors = floors.filter(f => f.savedFloor).length;
  const savedChecks = floors.reduce((n, fl) => n + Object.values(fl.checks || {}).filter(c => c.saved).length, 0);
  const pt = Object.values(state.plantTests).filter(v => v.saved).length;
  document.getElementById("export-info").innerHTML =
    `Report will include: <strong>${savedFloors}</strong> floor${savedFloors !== 1 ? "s" : ""}, <strong>${savedChecks}</strong> compliance check${savedChecks !== 1 ? "s" : ""}, and <strong>${pt}</strong> Plant Test section${pt !== 1 ? "s" : ""}.`;
}

function generatePDF() {
  const { jsPDF } = window.jspdf;
  if (!jsPDF) {
    showToast("jsPDF not available", "error");
    return;
  }

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const l = state.location;
  const o = state.overview;
  const allFloors = state.siteInspection.floors || [];
  const savedFloors = allFloors.filter(f => f.savedFloor);
  const savedPt = PT_SECTIONS.filter(s => state.plantTests[s.id]?.saved);

  const pageW = 210,
    margin = 18,
    contentW = pageW - margin * 2;
  let y = margin;
  const lineH = 6;

  function checkPage(needed = 10) {
    if (y + needed > 280) {
      doc.addPage();
      y = margin;
    }
  }

  function drawHeader() {
    doc.setFillColor(15, 39, 68);
    doc.rect(0, 0, pageW, 16, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("FIRE SAFETY INSPECTION REPORT", margin, 10);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Site Insight", pageW - margin, 10, { align: "right" });
    doc.setTextColor(30, 41, 59);
    y = 24;
  }

  function sectionTitle(title) {
    checkPage(14);
    doc.setFillColor(15, 39, 68);
    doc.rect(margin, y, contentW, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(title.toUpperCase(), margin + 4, y + 5.5);
    doc.setTextColor(30, 41, 59);
    y += 12;
  }

  function macroTitle(title) {
    checkPage(10);
    doc.setFillColor(37, 99, 235);
    doc.rect(margin, y, contentW, 7, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(title.toUpperCase(), margin + 4, y + 4.8);
    doc.setTextColor(30, 41, 59);
    y += 10;
  }

  function subTitle(title) {
    checkPage(10);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 58, 92);
    doc.text(title, margin, y);
    doc.setDrawColor(200, 210, 220);
    doc.line(margin, y + 1.5, margin + contentW, y + 1.5);
    doc.setTextColor(30, 41, 59);
    y += 7;
  }

  function floorRow(label) {
    checkPage(8);
    doc.setFillColor(240, 244, 255);
    doc.rect(margin, y - 3, contentW, 6.5, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 58, 92);
    doc.text(label, margin + 3, y + 1);
    doc.setTextColor(30, 41, 59);
    y += 8;
  }

  function kv(key, value) {
    if (!value) return;
    checkPage(8);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(key + ":", margin, y);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(String(value), contentW - 52);
    doc.text(lines, margin + 52, y);
    y += lines.length * lineH;
  }

  function tableRow(cols, widths, isHeader = false) {
    checkPage(8);
    doc.setFillColor(
      isHeader ? 15 : 248,
      isHeader ? 39 : 250,
      isHeader ? 68 : 252,
    );
    doc.rect(margin, y - 4, contentW, 7, "F");
    let x = margin;
    doc.setFontSize(7.5);
    doc.setFont("helvetica", isHeader ? "bold" : "normal");
    doc.setTextColor(
      isHeader ? 255 : 30,
      isHeader ? 255 : 41,
      isHeader ? 255 : 59,
    );
    cols.forEach((col, i) => {
      const txt = doc.splitTextToSize(String(col || ""), widths[i] - 3);
      doc.text(txt[0] || "", x + 2, y);
      x += widths[i];
    });
    doc.setTextColor(30, 41, 59);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 3, margin + contentW, y + 3);
    y += 7;
  }

  // Build PDF
  drawHeader();
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 39, 68);
  doc.text("FIRE SAFETY INSPECTION REPORT", pageW / 2, y, {
    align: "center",
  });
  y += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`${l.verbale || "N/A"}  |  ${l.date || ""}`, pageW / 2, y, {
    align: "center",
  });
  doc.setTextColor(30, 41, 59);
  y += 12;

  sectionTitle("1. Location & Participants");
  kv("Date", l.date);
  kv("Report No.", l.verbale);
  kv("Inspection No.", l.nrSopralluogo);
  kv("Location", l.luogo);
  kv("Inspection Type", l.tipo);
  kv("Client", l.cliente);
  if (l.desc) kv("Activity / Intended Use", l.desc);
  y += 4;
  if (state.participants.length > 0) {
    subTitle("Participants");
    const w = [55, 42, 50, 27];
    tableRow(["Full Name", "Role", "Company", "Email"], w, true);
    state.participants.forEach((p) =>
      tableRow([p.nome, p.ruolo, p.azienda, p.email], w),
    );
    y += 4;
  }

  if (o.obiettivo || o.note) {
    sectionTitle("2. Inspection Overview");
    if (o.obiettivo) kv("Objective", o.obiettivo);
    if (o.valutazione) kv("Overall Assessment", o.valutazione);
    if (o.priorita) kv("Intervention Priority", o.priorita);
    if (o.note) kv("General Notes", o.note);
    if (o.docs) kv("Documentation Reviewed", o.docs);
    y += 4;
  }

  if (savedFloors.length > 0) {
    sectionTitle("3. Site Inspection");
    savedFloors.forEach(fl => {
      const fLabel = fl.floorLabel || fl.areaCategory || "Floor";
      const fSub = fl.areaCategory && fl.floorLabel ? " — " + fl.areaCategory : "";
      checkPage(12);
      subTitle(fLabel + fSub);
      if (fl.comments) kv("Comments", fl.comments);
      if (fl.notes) kv("Notes", fl.notes);
      if (fl.riverifica) {
        checkPage(8);
        doc.setFillColor(254, 243, 199);
        doc.rect(margin, y - 4, contentW, 7, "F");
        doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(146, 64, 14);
        doc.text("⚠ RE-INSPECTION REQUIRED FOR THIS FLOOR", margin + 4, y);
        doc.setTextColor(30, 41, 59); y += 8;
      }
      if (fl.floorplanPins.length > 0) {
        kv("Floor plan pins", fl.floorplanPins.map((p, i) => `(${i + 1}) ${p.note || "—"}`).join(", "));
      }
      if (fl.photos.length > 0) {
        checkPage(10);
        doc.setFontSize(8); doc.setFont("helvetica", "bold");
        doc.text("Floor Photos:", margin, y); y += 6;
        const wf = [36, 22, 28, 88];
        tableRow(["Code", "Pin ref.", "Annot.", "Description"], wf, true);
        fl.photos.forEach(p => {
          const pinLabel = p.fpPinRef !== null && p.fpPinRef !== undefined
            ? `Pin ${p.fpPinRef + 1}${fl.floorplanPins[p.fpPinRef]?.note ? " · " + fl.floorplanPins[p.fpPinRef].note.substring(0, 18) : ""}` : "—";
          tableRow([p.code, pinLabel, p.pins.length ? p.pins.length + " pin" : "—", p.note], wf);
        });
      }
      // Compliance checks per floor grouped by category
      if (fl.selectedChecks.length > 0) {
        COMPLIANCE_CATEGORIES.forEach(cat => {
          const catChecks = cat.items.filter(i => fl.selectedChecks.includes(i.id));
          if (!catChecks.length) return;
          checkPage(10);
          macroTitle(cat.label);
          catChecks.forEach(item => {
            const check = fl.checks[item.id];
            if (!check?.saved) return;
            checkPage(10);
            subTitle(item.label);
            if (check.status) kv("Status", check.status);
            if (check.statusNotes) kv("Status Note", check.statusNotes);
            if (check.comments) kv("Comments", check.comments);
            if (check.notes) kv("Notes", check.notes);
            if (check.riverifica) {
              checkPage(8);
              doc.setFillColor(254, 243, 199);
              doc.rect(margin, y - 4, contentW, 7, "F");
              doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(146, 64, 14);
              doc.text("⚠ RE-INSPECTION REQUIRED", margin + 4, y);
              doc.setTextColor(30, 41, 59); y += 8;
            }
            if (check.photos?.length > 0) {
              const wc = [50, 124];
              tableRow(["Code", "Description"], wc, true);
              check.photos.forEach(p => tableRow([p.code, p.note], wc));
            }
            y += 3;
          });
        });
      }
      y += 4;
    });
  }

  if (savedPt.length > 0) {
    sectionTitle("4. Plant Tests");
    savedPt.forEach((s, idx) => {
      const d = state.plantTests[s.id];
      checkPage(12);
      subTitle(`${idx + 1}. ${s.label}`);
      const w = [18, 22, 30, 22, 30, 18, 8];
      tableRow(
        ["Test Code", "Floor", "Location", "Activation", "Expected Results", "Results", "Status"],
        w,
        true,
      );
      d.tests.forEach((t) =>
        tableRow(
          [t.test, t.piano, t.localizzazione, t.tipoAttivazione, t.expectedResults||"—", t.risultati, t.status||"—"],
          w,
        ),
      );
      y += 4;
    });
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${pageCount}  |  ${l.verbale || ""}  |  Site Insight`,
      pageW / 2,
      293,
      { align: "center" },
    );
  }

  const filename = `Report_${(l.verbale || "inspection").replace(/[^a-zA-Z0-9\-_]/g, "_")}.pdf`;
  doc.save(filename);
  showToast("PDF generated ✓", "success");
}

// ===========================================================
// HISTORY PAGE
// ===========================================================
function renderHistoryPage() {
  const el = document.getElementById("history-content");
  if (!el) return;

  const sorted = [...state.versions].sort(
    (a, b) => b.versionNum - a.versionNum,
  );

  const headerHtml = `
    <div class="section-header">
      <div>
        <h2>Version History</h2>
        <p>${state.projectName || ""}${sorted.length ? ` — ${sorted.length} version${sorted.length !== 1 ? "s" : ""} saved` : " — no versions saved yet"}</p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-secondary btn-sm" onclick="importProject()">Import JSON</button>
        <button class="btn btn-outline btn-sm" onclick="exportProject()">Export JSON</button>
        <button class="btn btn-primary btn-sm" onclick="commitVersion()">Save current version</button>
        <button class="btn btn-primary" onclick="nuovoSopralluogo()">+ New Survey</button>
      </div>
    </div>`;

  if (!sorted.length) {
    el.innerHTML =
      headerHtml +
      `
      <div class="empty-state">
        <div class="empty-icon"></div>
        <p>No versions saved yet.<br>Use "Save current version" to create the first snapshot.</p>
      </div>`;
    return;
  }

  const cardsHtml = sorted
    .map((v, idx) => {
      const isCurrent = v.versionNum === state.currentVersionNum;
      const d = new Date(v.createdAt);
      const dateStr = d.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const timeStr = d.toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const vFloors = (v.siteInspection?.floors || []);
      const savedSi = vFloors.filter(f => f.savedFloor).length;
      const savedChecks = vFloors.reduce((n, f) => n + Object.values(f.checks || {}).filter(c => c.saved).length, 0);
      const savedPt = Object.values(v.plantTests || {}).filter(s => s.saved).length;
      const valut = v.overview?.valutazione || "";
      const valClass =
        valut === "Compliant"
          ? "valut-ok"
          : valut === "Non Compliant" || valut === "Non-Compliant"
            ? "valut-ko"
            : "valut-mid";

      // diff with previous (older) version
      const olderV = sorted[idx + 1]; // sorted desc, so idx+1 = older
      const diffHtml = olderV ? renderVersionDiffHtml(olderV, v) : "";

      return `
      <div class="version-card${isCurrent ? " current" : ""}">
        <div class="version-card-header">
          <div class="version-num">v${v.versionNum}</div>
          <div class="version-meta">
            <div class="version-verbale">${v.verbale || "—"}</div>
            <div class="version-date">${dateStr} ${timeStr} · ${v.location?.tipo || "—"}</div>
            <div class="version-stats">
              <span>${savedSi} floor${savedSi !== 1 ? "s" : ""}</span>
              <span>${savedChecks} check${savedChecks !== 1 ? "s" : ""}</span>
              <span>${savedPt} PT test${savedPt !== 1 ? "s" : ""}</span>
              ${valut ? `<span class="version-valut ${valClass}">${valut}</span>` : ""}
            </div>
          </div>
          <div class="version-actions">
            ${
              isCurrent
                ? `<span class="version-current-badge">Current</span>`
                : `<button class="btn btn-secondary btn-sm" onclick="loadVersion(${v.versionNum})">Load</button>`
            }
          </div>
        </div>
        ${diffHtml}
      </div>`;
    })
    .join("");

  el.innerHTML = headerHtml + `<div class="version-list">${cardsHtml}</div>`;
}

function renderVersionDiffHtml(oldV, newV) {
  const rows = [];
  const oFloors = oldV.siteInspection?.floors || [];
  const nFloors = newV.siteInspection?.floors || [];

  // Compare floors by id
  const allFloorIds = [...new Set([...oFloors.map(f => f.id), ...nFloors.map(f => f.id)])];
  allFloorIds.forEach(fid => {
    const o = oFloors.find(f => f.id === fid);
    const n = nFloors.find(f => f.id === fid);
    const oSaved = !!o?.savedFloor;
    const nSaved = !!n?.savedFloor;
    const label = n?.floorLabel || n?.areaCategory || o?.floorLabel || o?.areaCategory || fid;
    const oRiv = !!o?.riverifica;
    const nRiv = !!n?.riverifica;
    const oChecks = Object.values(o?.checks || {}).filter(c => c.saved).length;
    const nChecks = Object.values(n?.checks || {}).filter(c => c.saved).length;

    if (!oSaved && !nSaved) return;
    let status, note;
    if (!oSaved && nSaved)       { status = "new";       note = "Added"; }
    else if (oSaved && !nSaved)  { status = "removed";   note = "Removed"; }
    else if (oRiv && !nRiv)      { status = "improved";  note = "Re-inspection resolved"; }
    else if (!oRiv && nRiv)      { status = "warning";   note = "Re-inspection required"; }
    else if (nChecks > oChecks)  { status = "expanded";  note = `+${nChecks - oChecks} check${nChecks - oChecks !== 1 ? "s" : ""}`; }
    else                         { status = "unchanged"; note = "Unchanged"; }
    rows.push({ label, status, note });
  });

  if (!rows.length) return "";
  const changed = rows.filter(r => r.status !== "unchanged");
  if (!changed.length) {
    return `<div class="version-diff"><span class="diff-no-change">No changes from previous version</span></div>`;
  }
  return `
    <div class="version-diff">
      <div class="version-diff-title">Changes from v${oldV.versionNum}</div>
      <div class="version-diff-grid">
        ${changed.map(r => `
          <div class="diff-item diff-${r.status}">
            <span class="diff-label">${r.label}</span>
            <span class="diff-note">${r.note}</span>
          </div>`).join("")}
      </div>
    </div>`;
}

// ===========================================================
// WORD EXPORT
// ===========================================================
async function generateWord() {
  if (!window.docx) {
    showToast("Word library not available", "error");
    return;
  }

  const {
    Document,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    HeadingLevel,
    AlignmentType,
    WidthType,
    ShadingType,
    Packer,
  } = window.docx;

  const l = state.location;
  const o = state.overview;
  const allFloorsW = state.siteInspection.floors || [];
  const savedFloorsW = allFloorsW.filter(f => f.savedFloor);
  const savedPt = PT_SECTIONS.filter(s => state.plantTests[s.id]?.saved);

  // ── helpers ──────────────────────────────────────────────
  const sp = (before = 0, after = 80) => ({ spacing: { before, after } });

  function kv(key, value) {
    if (!value) return null;
    return new Paragraph({
      ...sp(0, 60),
      children: [
        new TextRun({ text: key + ": ", bold: true, size: 21 }),
        new TextRun({ text: String(value), size: 21 }),
      ],
    });
  }

  function pushKV(arr, pairs) {
    pairs.forEach(([k, v]) => {
      const p = kv(k, v);
      if (p) arr.push(p);
    });
  }

  function makeTable(headers, rows, colPcts) {
    const mkCell = (text, isHeader = false) =>
      new TableCell({
        shading: isHeader
          ? { fill: "0B1A2E", type: ShadingType.CLEAR }
          : undefined,
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: String(text ?? ""),
                size: isHeader ? 19 : 20,
                bold: isHeader,
                color: isHeader ? "FFFFFF" : "0B1A2E",
              }),
            ],
          }),
        ],
      });

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: headers.map((h) => mkCell(h, true)),
        }),
        ...rows.map(
          (row) =>
            new TableRow({
              children: row.map((cell) => mkCell(cell)),
            }),
        ),
      ],
    });
  }

  function sectionRule() {
    return new Paragraph({
      border: {
        bottom: { style: "single", size: 6, color: "B8922A", space: 4 },
      },
      ...sp(320, 120),
    });
  }

  // ── document children ─────────────────────────────────────
  const children = [];

  // Title
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      ...sp(0, 80),
      children: [
        new TextRun({
          text: "FIRE SAFETY INSPECTION REPORT",
          size: 40,
          bold: true,
          color: "0B1A2E",
        }),
      ],
    }),
  );
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      ...sp(0, 400),
      children: [
        new TextRun({
          text: `${l.verbale || "N/A"}  —  ${l.date || ""}`,
          size: 22,
          color: "8899B0",
        }),
      ],
    }),
  );

  // 1. Location & Participants
  children.push(sectionRule());
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      ...sp(0, 120),
      children: [
        new TextRun({
          text: "1. Location & Participants",
          size: 28,
          bold: true,
          color: "0B1A2E",
        }),
      ],
    }),
  );
  pushKV(children, [
    ["Date", l.date],
    ["Report No.", l.verbale],
    ["Inspection No.", l.nrSopralluogo],
    ["Location", l.luogo],
    ["Inspection Type", l.tipo],
    ["Client", l.cliente],
    ["Activity / Intended Use", l.desc],
  ]);
  if (state.participants.length > 0) {
    children.push(
      new Paragraph({
        ...sp(160, 60),
        children: [
          new TextRun({
            text: "Participants",
            bold: true,
            size: 22,
            color: "4C5E74",
          }),
        ],
      }),
    );
    children.push(
      makeTable(
        ["Full Name", "Role", "Company", "Email"],
        state.participants.map((p) => [p.nome, p.ruolo, p.azienda, p.email]),
      ),
    );
  }

  // 2. Inspection Overview
  if (o.obiettivo || o.note || o.valutazione) {
    children.push(sectionRule());
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        ...sp(0, 120),
        children: [
          new TextRun({
            text: "2. Inspection Overview",
            size: 28,
            bold: true,
            color: "0B1A2E",
          }),
        ],
      }),
    );
    pushKV(children, [
      ["Inspection Objective", o.obiettivo],
      ["Overall Assessment", o.valutazione],
      ["Intervention Priority", o.priorita],
      ["General Notes", o.note],
      ["Documentation Reviewed", o.docs],
    ]);
  }

  // 3. Site Inspection — floors-first
  if (savedFloorsW.length > 0) {
    children.push(sectionRule());
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_2, ...sp(0, 120),
      children: [new TextRun({ text: "3. Site Inspection", size: 28, bold: true, color: "0B1A2E" })],
    }));

    savedFloorsW.forEach(fl => {
      const fLabel = fl.floorLabel || fl.areaCategory || "Floor";
      const fSub = fl.areaCategory && fl.floorLabel ? " — " + fl.areaCategory : "";

      // Floor heading
      children.push(new Paragraph({
        ...sp(240, 80),
        children: [new TextRun({ text: `  ${fLabel}${fSub}  `, size: 24, bold: true, color: "B8922A", shading: { type: ShadingType.CLEAR, fill: "FAF5E8" } })],
      }));

      pushKV(children, [["Comments", fl.comments], ["Notes", fl.notes]]);

      if (fl.riverifica) {
        children.push(new Paragraph({ ...sp(60, 60), children: [new TextRun({ text: "⚠ RE-INSPECTION REQUIRED FOR THIS FLOOR", size: 21, bold: true, color: "C07A10" })] }));
      }
      if (fl.floorplanPins.length > 0) {
        children.push(new Paragraph({ ...sp(40, 60), children: [
          new TextRun({ text: "Floor plan pins: ", bold: true, size: 20, color: "4C5E74" }),
          new TextRun({ text: fl.floorplanPins.map((p, i) => `(${i + 1}) ${p.note || "—"}`).join(" · "), size: 20, color: "8899B0" }),
        ]}));
      }
      if (fl.photos.length > 0) {
        children.push(new Paragraph({ ...sp(80, 40), children: [new TextRun({ text: "Floor Photos", bold: true, size: 20, color: "4C5E74" })] }));
        children.push(makeTable(
          ["Code", "Pin ref.", "Description", "Annotations"],
          fl.photos.map(p => {
            const pinLabel = p.fpPinRef !== null && p.fpPinRef !== undefined
              ? `Pin ${p.fpPinRef + 1}${fl.floorplanPins[p.fpPinRef]?.note ? " · " + fl.floorplanPins[p.fpPinRef].note : ""}` : "—";
            return [p.code, pinLabel, p.note, p.pins.length ? p.pins.map((pp, pi) => `(${pi + 1}) ${pp.note || "—"}`).join(", ") : "—"];
          }),
        ));
      }

      // Compliance checks per category
      COMPLIANCE_CATEGORIES.forEach(cat => {
        const catChecks = cat.items.filter(i => fl.selectedChecks.includes(i.id));
        if (!catChecks.length) return;

        children.push(new Paragraph({
          ...sp(200, 80),
          children: [new TextRun({ text: cat.label.toUpperCase(), size: 20, bold: true, color: "B8922A", allCaps: true })],
          border: { bottom: { style: "single", size: 4, color: "C8D4E6", space: 3 } },
        }));

        catChecks.forEach(item => {
          const check = fl.checks[item.id];
          if (!check?.saved) return;
          children.push(new Paragraph({ ...sp(120, 60), children: [new TextRun({ text: item.label, size: 22, bold: true, color: "102038" })] }));
          pushKV(children, [
            ["Status", check.status],
            ["Status Note", check.statusNotes],
            ["Comments", check.comments],
            ["Notes", check.notes],
          ]);
          if (check.riverifica) {
            children.push(new Paragraph({ ...sp(60, 60), children: [new TextRun({ text: "⚠ RE-INSPECTION REQUIRED", size: 21, bold: true, color: "C07A10" })] }));
          }
          if (check.photos?.length > 0) {
            children.push(makeTable(["Code", "Description"], check.photos.map(p => [p.code, p.note])));
          }
        });
      });
    });
  }

  // 4. Plant Tests
  if (savedPt.length > 0) {
    children.push(sectionRule());
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        ...sp(0, 120),
        children: [
          new TextRun({
            text: "4. Plant Tests",
            size: 28,
            bold: true,
            color: "0B1A2E",
          }),
        ],
      }),
    );

    savedPt.forEach((s) => {
      const d = state.plantTests[s.id];
      children.push(
        new Paragraph({
          ...sp(180, 60),
          children: [
            new TextRun({
              text: s.label,
              size: 22,
              bold: true,
              color: "102038",
            }),
          ],
        }),
      );
      children.push(
        makeTable(
          ["Test Code", "Floor", "Location", "Activation", "Expected Results", "Results", "Status", "Photo Evidence"],
          d.tests.map((t) => [
            t.test,
            t.piano,
            t.localizzazione,
            t.tipoAttivazione,
            t.expectedResults || "—",
            t.risultati,
            t.status || "—",
            t.photoEvidence || "—",
          ]),
        ),
      );
    });
  }

  // Footer
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      ...sp(600, 0),
      children: [
        new TextRun({
          text: `Document generated with Site Insight — ${new Date().toLocaleDateString("en-GB")}`,
          size: 18,
          color: "8899B0",
        }),
      ],
    }),
  );

  // ── build & save ─────────────────────────────────────────
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
          },
        },
        children,
      },
    ],
  });

  try {
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Report_${(l.verbale || "inspection").replace(/[^a-zA-Z0-9\-_]/g, "_")}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Word document generated ✓", "success");
  } catch (err) {
    console.error(err);
    showToast("Error generating Word document", "error");
  }
}

// ===========================================================
// INIT
// ===========================================================
renderSiSidebarItems();
renderPtSidebarItems();
renderParticipants();
renderGettingStarted();
updateVersionDisplay();
