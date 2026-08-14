// ===========================================================
// SI DATA HELPERS  (floors-first model)
// ===========================================================
function _uid() {
  return Math.random().toString(36).slice(2, 10);
}

function createEmptyFloor() {
  return {
    id: String(Date.now()) + String(Math.random()).slice(2, 8),
    areaCategory: "",
    floorLabel: "",
    floorplanDataUrl: null,
    floorplanPins: [],
    checkPins: [],        // [{id, x, y, note, checkIds:[], photoRef:{checkId,photoId}|null}]
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

// Lookup a check definition by id
function _getCheckDef(checkId) {
  for (const cat of COMPLIANCE_CATEGORIES) {
    const found = cat.items.find(i => i.id === checkId);
    if (found) return found;
  }
  return null;
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

