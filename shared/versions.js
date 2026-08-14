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

