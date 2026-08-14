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
      floor.photos.push({ id: _uid(), dataUrl: ev.target.result, code, note: "", pins: [], fpPinRef: null });
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
      check.photos.push({ id: _uid(), dataUrl: ev.target.result, code, note: "", pins: [], fpPinRef: null });
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
  _renderLinkedPhotos(floorId, checkId);
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

function _renderLinkedPhotos(floorId, checkId) {
  const container = document.getElementById("si-linked-photos-list");
  if (!container) return;
  const floor = getFloor(floorId);
  if (!floor) { container.innerHTML = ""; return; }

  // Find pins that include this check but whose photo belongs to a DIFFERENT check
  const linkedPins = (floor.checkPins || []).filter(pin =>
    pin.checkIds.includes(checkId) &&
    pin.photoRef &&
    pin.photoRef.checkId !== checkId
  );
  if (linkedPins.length === 0) { container.innerHTML = ""; return; }

  const cards = linkedPins.map(pin => {
    const ownerCheck = floor.checks?.[pin.photoRef.checkId];
    const photo = (ownerCheck?.photos || []).find(p => p.id === pin.photoRef.photoId);
    if (!photo) return "";
    const ownerDef = _getCheckDef(pin.photoRef.checkId);
    const col = CHECK_COLORS[pin.photoRef.checkId] || '#888';
    return `<div class="linked-photo-card">
      <div class="linked-photo-header">
        <span class="linked-from-badge" style="background:${col}22;color:${col};border-color:${col}33">
          ⬡ from ${ownerDef ? ownerDef.label : pin.photoRef.checkId}
        </span>
        <span class="linked-photo-code">${photo.code || ''}</span>
        ${pin.note ? `<span class="linked-photo-note">${pin.note}</span>` : ''}
      </div>
      ${photo.dataUrl ? `<img src="${photo.dataUrl}" class="linked-photo-img">` : ''}
    </div>`;
  }).join("");

  container.innerHTML = `
    <div class="linked-photos-section">
      <div class="linked-photos-title">📎 Linked from other checks</div>
      ${cards}
    </div>`;
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

