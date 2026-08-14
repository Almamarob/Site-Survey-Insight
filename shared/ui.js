// ===========================================================
// SIDEBAR RENDERING
// ===========================================================
// Outcome helpers — used by sidebar and Step 3
function _siOutcomeCls(status) {
  if (status === "Compliant") return "co-ok";
  if (status === "Non Compliant") return "co-ko";
  if (status === "Partially Compliant") return "co-mid";
  if (status === "To be verified") return "co-tbv";
  return "co-none";
}
function _siOutcomeShort(status) {
  if (status === "Compliant") return "✓";
  if (status === "Non Compliant") return "✗";
  if (status === "Partially Compliant") return "~";
  if (status === "To be verified") return "—";
  return "";
}
function _siFloorWorstOutcomeCls(fl) {
  const statuses = (fl.selectedChecks || []).map(cid => fl.checks[cid]?.status).filter(Boolean);
  if (statuses.includes("Non Compliant")) return "co-ko";
  if (statuses.includes("Partially Compliant")) return "co-mid";
  if (statuses.includes("To be verified")) return "co-tbv";
  if (statuses.length > 0 && statuses.every(s => s === "Compliant")) return "co-ok";
  return "";
}

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
    const floorWorstCls = _siFloorWorstOutcomeCls(fl);

    const flEl = document.createElement("div");
    flEl.className = "nav-floor-item" + (isFloorActive ? " active" : "") + (fl.savedFloor ? " saved" : "");
    flEl.id = "nav-floor-" + fl.id;
    flEl.innerHTML = `
      <span class="nav-floor-dot">◈</span>
      <span class="nav-floor-label">${flLabel}</span>
      ${fl.savedFloor && checkCount > 0
        ? `<span class="nav-floor-progress ${floorWorstCls}">${savedCount}/${checkCount}</span>`
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
          const outcomeCls = _siOutcomeCls(check?.status);
          const outcomeLabel = _siOutcomeShort(check?.status);
          const chEl = document.createElement("div");
          chEl.className = "nav-sub-item nav-check-item" + (isCheckActive ? " active" : "") + (check?.saved ? " saved" : "");
          chEl.id = "nav-check-" + fl.id + "-" + item.id;
          chEl.innerHTML = `
            <span class="sub-dot">●</span>
            <span style="flex:1">${item.label}</span>
            ${check?.saved
              ? `<span class="check-outcome-badge ${outcomeCls}">${outcomeLabel}</span>`
              : ""}
          `;
          chEl.onclick = () => navigateToCheck(fl.id, item.id);
          group.appendChild(chEl);
        });
      });
    }
  });
}

function _ptSectionOutcome(sectionId) {
  const pt = state.plantTests[sectionId];
  if (!pt?.saved) return null;
  const tests = pt.tests || [];
  if (tests.length === 0) return "co-ok";
  if (tests.some(t => t.status === "Failed")) return "co-ko";
  if (tests.every(t => t.status === "Passed")) return "co-ok";
  return "co-tbv";
}

function renderPtSidebarItems() {
  const group = document.getElementById("pt-nav-group");
  group.innerHTML = "";
  PT_SECTIONS.forEach((s) => {
    const el = document.createElement("div");
    const isActive = state.activePtSection === s.id;
    const isSaved = state.plantTests[s.id]?.saved;
    const outcomeCls = _ptSectionOutcome(s.id);
    const outcomeLabel = outcomeCls === "co-ok" ? "✓" : outcomeCls === "co-ko" ? "✗" : "—";
    el.className =
      "nav-sub-item" + (isActive ? " active" : "") + (isSaved ? " saved" : "");
    el.id = "nav-sub-pt-" + s.id;
    el.innerHTML = `<span class="sub-dot">●</span><span style="flex:1">${s.label}</span>${isSaved ? `<span class="check-outcome-badge ${outcomeCls}">${outcomeLabel}</span>` : ""}`;
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

