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

      <details class="photos-section" id="floor-photos-accordion-${id}">
        <summary class="photos-section-header">
          <span class="photos-section-title">
            Photos
            ${floor.photos.length > 0 ? `<span class="photos-count-badge">${floor.photos.length}</span>` : ''}
          </span>
          <button class="btn btn-secondary btn-sm" onclick="event.preventDefault();event.stopPropagation();document.getElementById('floor-photos-accordion-${id}').open=true;siAddFloorPhoto('${id}')">+ Photo</button>
        </summary>
        <div class="photos-section-body">
          <div id="si-photos-list"></div>
        </div>
      </details>

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

    ${floor.floorplanDataUrl ? `<div id="cp-panel-${id}-${checkId}"></div>` : ""}

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

      <details class="photos-section" id="check-photos-accordion-${id}-${checkId}">
        <summary class="photos-section-header">
          <span class="photos-section-title">
            Photos
            ${(check.photos || []).length > 0 ? `<span class="photos-count-badge">${(check.photos || []).length}</span>` : ''}
          </span>
          <button class="btn btn-secondary btn-sm" onclick="event.preventDefault();event.stopPropagation();document.getElementById('check-photos-accordion-${id}-${checkId}').open=true;siAddCheckPhoto('${id}','${checkId}')">+ Photo</button>
        </summary>
        <div class="photos-section-body">
          <div id="si-photo-scope-bar"></div>
          <div id="si-photo-scope-content"></div>
        </div>
      </details>

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
  if (floor.floorplanDataUrl) renderCheckPlanPanel(id, checkId);
}

// ===========================================================
// CHECK PLAN PANEL — floor plan with check-specific pins in Step 3
// ===========================================================

// ── Pin overlap nudge (view-only, never mutates stored x/y) ────
function _nudgePins(visiblePins, allPins) {
  if (visiblePins.length < 2) return visiblePins.map((p, i) => ({ ...p, _dx: 0, _dy: 0, _globalIdx: allPins.indexOf(p) }));
  const mapW = 360 * (800 / 520); // ~554px at max-height 360
  const mapH = 360;
  const minDist = 26; // px centre-to-centre
  const pts = visiblePins.map(p => ({ ...p, _globalIdx: allPins.indexOf(p), _px: p.x * mapW / 100, _py: p.y * mapH / 100, _ox: 0, _oy: 0 }));
  for (let pass = 0; pass < 12; pass++) {
    let moved = false;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = (pts[j]._px + pts[j]._ox) - (pts[i]._px + pts[i]._ox);
        const dy = (pts[j]._py + pts[j]._oy) - (pts[i]._py + pts[i]._oy);
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        if (dist < minDist) {
          const push = (minDist - dist) / 2;
          const nx = dx / dist, ny = dy / dist;
          pts[i]._ox -= nx * push; pts[i]._oy -= ny * push;
          pts[j]._ox += nx * push; pts[j]._oy += ny * push;
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
  return pts.map(p => ({ ...p, _dx: p._ox / mapW * 100, _dy: p._oy / mapH * 100 }));
}

// ── Photo-tag collision: flip overlapping labels above their pin ─
function _cpResolveTagCollisions(floorId, checkId) {
  const mapEl = document.getElementById(`cp-map-${floorId}-${checkId}`);
  if (!mapEl) return;
  const tags = [...mapEl.querySelectorAll('.cp-pin-photo-tag')];
  if (tags.length < 2) return;
  tags.forEach(t => { t.style.top = ''; t.style.bottom = ''; t.style.marginTop = ''; t.style.marginBottom = ''; });
  const rects = tags.map(t => t.getBoundingClientRect());
  for (let i = 1; i < tags.length; i++) {
    for (let j = 0; j < i; j++) {
      const a = rects[j], b = rects[i];
      if (b.left < a.right && b.right > a.left && b.top < a.bottom && b.bottom > a.top) {
        tags[i].style.top = 'auto'; tags[i].style.bottom = '100%';
        tags[i].style.marginTop = '0'; tags[i].style.marginBottom = '3px';
        rects[i] = tags[i].getBoundingClientRect();
        break;
      }
    }
  }
}

// Per-panel UI state (drop mode, filter, pending pin)
const checkPlanState = {};
function _cpState(floorId, checkId) {
  const key = `${floorId}:::${checkId}`;
  if (!checkPlanState[key]) {
    checkPlanState[key] = {
      dropMode: false,
      visibleChecks: new Set([checkId]),
      pendingPin: null,   // {x, y} while user is placing a new pin
    };
  }
  return checkPlanState[key];
}

function renderCheckPlanPanel(floorId, checkId) {
  const panelEl = document.getElementById(`cp-panel-${floorId}-${checkId}`);
  if (!panelEl) return;
  const floor = getFloor(floorId);
  if (!floor || !floor.floorplanDataUrl) { panelEl.innerHTML = ""; return; }

  const st = _cpState(floorId, checkId);
  const checkPins = floor.checkPins || [];

  // Collect all checks that have at least one pin on this floor
  const checksWithPins = new Set([checkId]);
  checkPins.forEach(p => p.checkIds.forEach(c => checksWithPins.add(c)));

  // Visible pins: belong to at least one visible check
  const visiblePins = checkPins.filter(p => p.checkIds.some(c => st.visibleChecks.has(c)));

  // ── filter toggle buttons ──────────────────────────────────
  const filterBtns = [...checksWithPins].map(cid => {
    const def = _getCheckDef(cid);
    const col = CHECK_COLORS[cid] || '#888';
    const active = st.visibleChecks.has(cid);
    return `<button class="cp-filter-btn${active ? ' active' : ''}"
      style="${active ? `background:${col}22;border-color:${col};color:${col}` : ''}"
      onclick="siCpToggleFilter('${floorId}','${checkId}','${cid}')">
      <span style="color:${col}">●</span> ${def ? def.label : cid}
    </button>`;
  }).join('');

  // ── pins on map (nudged positions, global numbering) ────────
  const nudged = _nudgePins(visiblePins, checkPins);
  const pinsHtml = nudged.map((pin) => {
    const globalNum = pin._globalIdx + 1; // 1-based global index
    const primaryColor = CHECK_COLORS[pin.checkIds[0]] || '#888';
    let photoCode = '';
    if (pin.photoRef) {
      const ownerCheck = floor.checks?.[pin.photoRef.checkId];
      const lp = (ownerCheck?.photos || []).find((p, i) => (p.id ?? String(i)) === pin.photoRef.photoId);
      photoCode = lp?.code || '';
    }
    const title = [pin.note || ('Pin ' + globalNum), photoCode].filter(Boolean).join(' · ');
    return `<div class="cp-pin" title="${title}"
      style="left:${pin.x + pin._dx}%;top:${pin.y + pin._dy}%;border-color:${primaryColor};background:${primaryColor}dd"
      onclick="siCpPinClick(event,'${floorId}','${checkId}','${pin.id}')">
      <span class="cp-pin-num">${globalNum}</span>
      ${photoCode ? `<span class="cp-pin-photo-tag">${photoCode}</span>` : ''}
    </div>`;
  }).join('');

  // pending ghost pin
  const ghostHtml = st.pendingPin
    ? `<div class="cp-pin cp-pin-pending" style="left:${st.pendingPin.x}%;top:${st.pendingPin.y}%">+</div>`
    : '';

  // ── pending pin form ──────────────────────────────────────
  const check = getOrInitCheck(floorId, checkId);
  const photoOpts = (check?.photos || []).map((p, i) =>
    `<option value="${p.id || i}">${p.code || ('Photo ' + (i + 1))}</option>`
  ).join('');
  const otherChecks = (floor.selectedChecks || []).filter(c => c !== checkId);
  const crossOpts = otherChecks.map(c => {
    const def = _getCheckDef(c);
    return `<option value="${c}">${def ? def.label : c}</option>`;
  }).join('');

  const pendingHtml = st.pendingPin ? `
    <div class="cp-pending-form">
      <div class="cp-pending-title">📍 New pin at (${st.pendingPin.x.toFixed(0)}%, ${st.pendingPin.y.toFixed(0)}%)</div>
      <div class="cp-pending-row">
        <input id="cp-pending-note-${floorId}-${checkId}" class="cp-pending-input" placeholder="Pin label / note...">
      </div>
      <div class="cp-pending-row">
        <label class="cp-pending-label">Link to photo in this check:</label>
        <select id="cp-pending-photo-${floorId}-${checkId}" class="cp-pending-select">
          <option value="">— no photo —</option>
          ${photoOpts}
        </select>
      </div>
      ${otherChecks.length > 0 ? `
      <div class="cp-pending-row">
        <label class="cp-pending-label">Also visible in check:</label>
        <select id="cp-pending-cross-${floorId}-${checkId}" class="cp-pending-select">
          <option value="">— none —</option>
          ${crossOpts}
        </select>
      </div>` : ''}
      <div class="cp-pending-row" style="gap:8px;justify-content:flex-end">
        <button class="btn btn-secondary btn-sm" onclick="siCpCancelPin('${floorId}','${checkId}')">Cancel</button>
        <button class="btn btn-primary btn-sm" onclick="siCpConfirmPin('${floorId}','${checkId}')">Add Pin</button>
      </div>
    </div>` : '';

  // ── pin list (global numbering matches map) ───────────────
  const pinListHtml = checkPins.length === 0 && !st.pendingPin
    ? '<p class="cp-empty">No pins yet. Click "Drop Pin" then click the floor plan to place one.</p>'
    : checkPins.map((pin, idx) => {  // idx is global index
        const col = CHECK_COLORS[pin.checkIds[0]] || '#888';
        const checkBadges = pin.checkIds.map(c => {
          const d = _getCheckDef(c);
          const cc = CHECK_COLORS[c] || '#888';
          return `<span class="cp-pin-check-badge" style="background:${cc}22;color:${cc};border-color:${cc}22">${d ? d.label : c}</span>`;
        }).join('');

        // photo link
        let photoHtml = '';
        if (pin.photoRef) {
          const ownerCheck = floor.checks?.[pin.photoRef.checkId];
          const linkedPhoto = (ownerCheck?.photos || []).find((p, i) => (p.id ?? String(i)) === pin.photoRef.photoId);
          const fromOtherCheck = pin.photoRef.checkId !== checkId;
          const fromCheckDef = fromOtherCheck ? _getCheckDef(pin.photoRef.checkId) : null;
          photoHtml = linkedPhoto
            ? `<div class="cp-pin-photo">
                ${linkedPhoto.dataUrl ? `<img src="${linkedPhoto.dataUrl}" class="cp-pin-thumb">` : ''}
                <div class="cp-pin-photo-info">
                  <span class="cp-pin-photo-code">${linkedPhoto.code || 'Photo'}</span>
                  ${linkedPhoto.note ? `<span class="cp-pin-photo-note-label">${linkedPhoto.note}</span>` : ''}
                  ${fromCheckDef ? `<span class="cp-pin-photo-from">from ${fromCheckDef.label}</span>` : ''}
                </div>
                <button class="btn btn-danger btn-sm" onclick="siCpUnlinkPhoto('${floorId}','${pin.id}','${checkId}')">Unlink</button>
              </div>`
            : '';
        } else if (photoOpts) {
          photoHtml = `<select class="cp-pin-photo-sel" onchange="siCpLinkPhoto('${floorId}','${pin.id}','${checkId}',this.value)">
            <option value="">📷 Link photo...</option>
            ${photoOpts}
          </select>`;
        }

        // add-to-check selector (only show checks not already linked)
        const addableChecks = (floor.selectedChecks || []).filter(c => !pin.checkIds.includes(c));
        const addToHtml = addableChecks.length > 0
          ? `<select class="cp-pin-add-sel" onchange="siCpAddCheckToPin('${floorId}','${pin.id}','${checkId}',this.value);this.value=''">
              <option value="">+ link to check...</option>
              ${addableChecks.map(c => { const d = _getCheckDef(c); return `<option value="${c}">${d ? d.label : c}</option>`; }).join('')}
            </select>`
          : '';

        return `<div class="cp-pin-item" id="cp-pi-${pin.id}">
          <div class="cp-pin-item-header">
            <span class="cp-pin-dot" style="background:${col}">&#x2022;</span>
            <span class="cp-pin-idx">${idx + 1}</span>
            <input class="cp-pin-note-input" value="${pin.note || ''}" placeholder="Note..."
              onchange="siCpUpdatePinNote('${floorId}','${pin.id}',this.value)">
            <button class="btn btn-danger btn-sm" onclick="siCpRemovePin('${floorId}','${pin.id}','${checkId}')">✕</button>
          </div>
          <div class="cp-pin-item-meta">
            ${checkBadges}
            ${addToHtml}
          </div>
          ${photoHtml}
        </div>`;
      }).join('');

  panelEl.innerHTML = `
    <div class="cp-panel">
      <div class="cp-header">
        <span class="cp-title">Floor Plan Pins</span>
        <div class="cp-filters">${filterBtns}</div>
        <button class="btn btn-sm ${st.dropMode ? 'btn-warning' : 'btn-secondary'}"
          onclick="siCpToggleDropMode('${floorId}','${checkId}')">
          ${st.dropMode ? '📍 Cancel' : '📍 Drop Pin'}
        </button>
      </div>
      <div class="cp-map-wrap" id="cp-map-${floorId}-${checkId}">
        <img src="${floor.floorplanDataUrl}" class="cp-map-img" draggable="false"
          id="cp-img-${floorId}-${checkId}">
        <div class="cp-pins-layer">${pinsHtml}${ghostHtml}</div>
        <div class="cp-drop-overlay" id="cp-overlay-${floorId}-${checkId}"
          style="cursor:${st.dropMode ? 'crosshair' : 'default'};pointer-events:${st.dropMode ? 'all' : 'none'}"></div>
      </div>
      ${pendingHtml}
      <details class="cp-pin-list-accordion" ${checkPins.length > 0 ? 'open' : ''}>
        <summary class="cp-pin-list-summary">
          <span class="cp-pin-list-summary-label">
            <span class="cp-pin-list-chevron">▶</span>
            Findings &amp; Positions
          </span>
          <span class="cp-pin-list-badge">${checkPins.length}</span>
        </summary>
        <div class="cp-pin-list">${pinListHtml}</div>
      </details>
    </div>`;

  // resolve photo-tag label collisions after DOM is ready
  requestAnimationFrame(() => _cpResolveTagCollisions(floorId, checkId));

  // attach click handler for drop mode
  const overlay = document.getElementById(`cp-overlay-${floorId}-${checkId}`);
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      const img = document.getElementById(`cp-img-${floorId}-${checkId}`);
      if (!img) return;
      const rect = img.getBoundingClientRect();
      const x = parseFloat((((e.clientX - rect.left) / rect.width) * 100).toFixed(1));
      const y = parseFloat((((e.clientY - rect.top) / rect.height) * 100).toFixed(1));
      if (x < 0 || x > 100 || y < 0 || y > 100) return;
      const s = _cpState(floorId, checkId);
      s.pendingPin = { x, y };
      s.dropMode = false;
      renderCheckPlanPanel(floorId, checkId);
    });
  }
}

// ── interaction functions ──────────────────────────────────────
function siCpToggleFilter(floorId, checkId, toggleId) {
  const st = _cpState(floorId, checkId);
  if (st.visibleChecks.has(toggleId)) {
    if (st.visibleChecks.size > 1) st.visibleChecks.delete(toggleId);
  } else {
    st.visibleChecks.add(toggleId);
  }
  renderCheckPlanPanel(floorId, checkId);
}

function siCpToggleDropMode(floorId, checkId) {
  const st = _cpState(floorId, checkId);
  st.dropMode = !st.dropMode;
  st.pendingPin = null;
  renderCheckPlanPanel(floorId, checkId);
}

function siCpCancelPin(floorId, checkId) {
  const st = _cpState(floorId, checkId);
  st.pendingPin = null;
  renderCheckPlanPanel(floorId, checkId);
}

function siCpConfirmPin(floorId, checkId) {
  const floor = getFloor(floorId);
  const st = _cpState(floorId, checkId);
  if (!floor || !st.pendingPin) return;

  const note = document.getElementById(`cp-pending-note-${floorId}-${checkId}`)?.value || '';
  const photoVal = document.getElementById(`cp-pending-photo-${floorId}-${checkId}`)?.value || '';
  const crossVal = document.getElementById(`cp-pending-cross-${floorId}-${checkId}`)?.value || '';

  const checkIds = [checkId];
  if (crossVal) checkIds.push(crossVal);

  let photoRef = null;
  if (photoVal) {
    const check = floor.checks?.[checkId];
    const photo = (check?.photos || []).find((p, i) => (p.id ?? String(i)) === photoVal);
    if (photo) photoRef = { checkId, photoId: photoVal };
  }

  if (!floor.checkPins) floor.checkPins = [];
  floor.checkPins.push({ id: _uid(), x: st.pendingPin.x, y: st.pendingPin.y, note, checkIds, photoRef });

  st.pendingPin = null;
  renderCheckPlanPanel(floorId, checkId);
  // refresh linked photos in photo list
  renderCheckPhotos(floorId, checkId);
}

function siCpRemovePin(floorId, pinId, checkId) {
  const floor = getFloor(floorId);
  if (!floor) return;
  floor.checkPins = (floor.checkPins || []).filter(p => p.id !== pinId);
  renderCheckPlanPanel(floorId, checkId);
  renderCheckPhotos(floorId, checkId);
}

function siCpUpdatePinNote(floorId, pinId, val) {
  const floor = getFloor(floorId);
  const pin = (floor?.checkPins || []).find(p => p.id === pinId);
  if (pin) pin.note = val;
}

function siCpLinkPhoto(floorId, pinId, checkId, photoId) {
  const floor = getFloor(floorId);
  const pin = (floor?.checkPins || []).find(p => p.id === pinId);
  if (!pin || !photoId) return;
  pin.photoRef = { checkId, photoId };
  renderCheckPlanPanel(floorId, checkId);
  renderCheckPhotos(floorId, checkId);
}

function siCpUnlinkPhoto(floorId, pinId, checkId) {
  const floor = getFloor(floorId);
  const pin = (floor?.checkPins || []).find(p => p.id === pinId);
  if (pin) pin.photoRef = null;
  renderCheckPlanPanel(floorId, checkId);
  renderCheckPhotos(floorId, checkId);
}

function siCpAddCheckToPin(floorId, pinId, checkId, newCheckId) {
  if (!newCheckId) return;
  const floor = getFloor(floorId);
  const pin = (floor?.checkPins || []).find(p => p.id === pinId);
  if (pin && !pin.checkIds.includes(newCheckId)) pin.checkIds.push(newCheckId);
  renderCheckPlanPanel(floorId, checkId);
  renderCheckPhotos(floorId, checkId);
}

function siCpPinClick(e, floorId, checkId, pinId) {
  e.stopPropagation();
  // scroll to pin list item
  const el = document.getElementById(`cp-pi-${pinId}`);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

