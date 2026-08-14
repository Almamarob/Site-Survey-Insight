// ===========================================================
// LIGHTBOX
// ===========================================================
function ptOpenLightbox(src) {
  document.getElementById("pt-lightbox-img").src = src;
  document.getElementById("pt-lightbox").classList.add("open");
}

function ptCloseLightbox() {
  document.getElementById("pt-lightbox").classList.remove("open");
  document.getElementById("pt-lightbox-img").src = "";
}

document.addEventListener("keydown", e => { if (e.key === "Escape") ptCloseLightbox(); });

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
    photoDataUrl: null,
  };
}

function ptUploadTestPhoto(id, i) {
  const inp = document.createElement("input");
  inp.type = "file"; inp.accept = "image/*";
  inp.onchange = ev => {
    const f = ev.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = e => { state.plantTests[id].tests[i].photoDataUrl = e.target.result; renderPtContent(); };
    r.readAsDataURL(f);
  };
  inp.click();
}

function ptRemoveTestPhoto(id, i) {
  state.plantTests[id].tests[i].photoDataUrl = null;
  renderPtContent();
}

// ── Floor-group helpers ─────────────────────────────────────
function _ptGetFloorGroup(id, pianoKey) {
  const data = state.plantTests[id];
  if (!data.floorGroups) data.floorGroups = {};
  if (!data.floorGroups[pianoKey]) data.floorGroups[pianoKey] = { floorplanDataUrl: null, photos: [] };
  return data.floorGroups[pianoKey];
}

function movePtTest(id, i, dir) {
  const tests = state.plantTests[id].tests;
  const j = i + dir;
  if (j < 0 || j >= tests.length) return;
  [tests[i], tests[j]] = [tests[j], tests[i]];
  renderPtContent();
}

function ptUploadFloorPlan(id, pianoKey) {
  const inp = document.createElement("input");
  inp.type = "file"; inp.accept = "image/*";
  inp.onchange = ev => {
    const f = ev.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = e => { _ptGetFloorGroup(id, pianoKey).floorplanDataUrl = e.target.result; renderPtContent(); };
    r.readAsDataURL(f);
  };
  inp.click();
}

function ptClearFloorPlan(id, pianoKey) {
  _ptGetFloorGroup(id, pianoKey).floorplanDataUrl = null;
  renderPtContent();
}

function ptAddGroupPhoto(id, pianoKey) {
  const inp = document.createElement("input");
  inp.type = "file"; inp.accept = "image/*";
  inp.onchange = ev => {
    const f = ev.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = e => { _ptGetFloorGroup(id, pianoKey).photos.push({ dataUrl: e.target.result, note: "" }); renderPtContent(); };
    r.readAsDataURL(f);
  };
  inp.click();
}

function ptRemoveGroupPhoto(id, pianoKey, pi) {
  _ptGetFloorGroup(id, pianoKey).photos.splice(pi, 1);
  renderPtContent();
}

function ptUpdateGroupPhotoNote(id, pianoKey, pi, val) {
  const g = _ptGetFloorGroup(id, pianoKey);
  if (g.photos[pi]) g.photos[pi].note = val;
}

// ── Test item renderer ──────────────────────────────────────
function _renderPtTestItem(id, t, i, total) {
  const esc = s => (s || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;');
  return `
  <div class="test-item">
    <div class="test-item-header">
      <span class="test-item-title">Test #${i + 1}</span>
      <div class="pt-test-controls">
        <button class="btn-icon" title="Move up" ${i === 0 ? 'disabled' : ''} onclick="movePtTest('${id}',${i},-1)">↑</button>
        <button class="btn-icon" title="Move down" ${i === total - 1 ? 'disabled' : ''} onclick="movePtTest('${id}',${i},1)">↓</button>
        ${total > 1 ? `<button class="btn btn-danger btn-sm" onclick="removePtTest('${id}',${i})">✕ Remove</button>` : ''}
      </div>
    </div>
    <div class="form-row cols-3">
      <div class="form-group">
        <label>Test Code</label>
        <input value="${esc(t.test)}" onchange="state.plantTests['${id}'].tests[${i}].test=this.value" placeholder="e.g. T-001">
      </div>
      <div class="form-group">
        <label>Floor</label>
        <input value="${esc(t.piano)}" onchange="state.plantTests['${id}'].tests[${i}].piano=this.value;renderPtContent()" placeholder="e.g. Ground Floor">
      </div>
      <div class="form-group">
        <label>Location</label>
        <input value="${esc(t.localizzazione)}" onchange="state.plantTests['${id}'].tests[${i}].localizzazione=this.value" placeholder="e.g. Zone A">
      </div>
    </div>
    <div class="form-row cols-2">
      <div class="form-group">
        <label>Activation Type</label>
        <select onchange="state.plantTests['${id}'].tests[${i}].tipoAttivazione=this.value">
          <option ${!t.tipoAttivazione ? 'selected' : ''} value="">-- Select --</option>
          <option ${t.tipoAttivazione === 'Automatic' ? 'selected' : ''}>Automatic</option>
          <option ${t.tipoAttivazione === 'Manual' ? 'selected' : ''}>Manual</option>
          <option ${t.tipoAttivazione === 'Remote' ? 'selected' : ''}>Remote</option>
          <option ${t.tipoAttivazione === 'Semi-auto' ? 'selected' : ''}>Semi-auto</option>
        </select>
      </div>
      <div class="form-group">
        <label>Expected Results</label>
        <input value="${esc(t.expectedResults || '')}" onchange="state.plantTests['${id}'].tests[${i}].expectedResults=this.value" placeholder="e.g. Alarm within 30s">
      </div>
    </div>
    <div class="form-row cols-3">
      <div class="form-group">
        <label>Results</label>
        <input value="${esc(t.risultati)}" onchange="state.plantTests['${id}'].tests[${i}].risultati=this.value" placeholder="e.g. Alarm triggered within 28s">
      </div>
      <div class="form-group">
        <label>Status</label>
        <select onchange="state.plantTests['${id}'].tests[${i}].status=this.value">
          <option ${!t.status ? 'selected' : ''} value="">-- Select --</option>
          <option ${t.status === 'Passed' ? 'selected' : ''}>Passed</option>
          <option ${t.status === 'Failed' ? 'selected' : ''}>Failed</option>
        </select>
      </div>
      <div class="form-group">
        <label>Photographic Evidence</label>
        ${t.photoDataUrl ? `
          <div class="pt-test-photo-wrap">
            <img src="${t.photoDataUrl}" class="pt-test-photo-thumb" onclick="ptOpenLightbox(this.src)">
            <div class="pt-test-photo-meta">
              <input value="${esc(t.photoEvidence || '')}" placeholder="Photo code (e.g. IMG-001)"
                onchange="state.plantTests['${id}'].tests[${i}].photoEvidence=this.value">
              <button class="btn btn-danger btn-sm" onclick="ptRemoveTestPhoto('${id}',${i})">✕ Remove photo</button>
            </div>
          </div>
        ` : `
          <div class="pt-test-photo-empty">
            <button class="btn btn-secondary btn-sm" onclick="ptUploadTestPhoto('${id}',${i})">+ Upload Photo</button>
            <input value="${esc(t.photoEvidence || '')}" placeholder="Or enter photo code/reference"
              onchange="state.plantTests['${id}'].tests[${i}].photoEvidence=this.value">
          </div>
        `}
      </div>
    </div>
  </div>`;
}

function renderPtContent() {
  const id = state.activePtSection;
  if (!id || !state.plantTests[id]) return;
  const sec = PT_SECTIONS.find(s => s.id === id);
  const data = state.plantTests[id];
  const total = data.tests.length;
  const c = document.getElementById("pt-active-content");

  // Compute unique floor keys in order of first appearance
  const seenFloors = [];
  const floorMap = {};
  const ungrouped = [];
  data.tests.forEach((t, i) => {
    const key = (t.piano || '').trim();
    if (!key) {
      ungrouped.push({ t, i });
    } else {
      if (!floorMap[key]) { floorMap[key] = []; seenFloors.push(key); }
      floorMap[key].push({ t, i });
    }
  });

  let bodyHtml = '';
  if (seenFloors.length === 0) {
    // All ungrouped — flat list
    bodyHtml = data.tests.map((t, i) => _renderPtTestItem(id, t, i, total)).join('');
  } else {
    // Render floor groups
    seenFloors.forEach(floorKey => {
      const ek = floorKey.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
      const group = _ptGetFloorGroup(id, floorKey);
      const groupTests = floorMap[floorKey].map(({ t, i }) => _renderPtTestItem(id, t, i, total)).join('');

      const photosHtml = group.photos.map((ph, pi) => `
        <div class="pt-group-photo-item">
          <img src="${ph.dataUrl}" class="pt-group-photo-img" onclick="ptOpenLightbox(this.src)">
          <input class="pt-group-photo-note" value="${(ph.note || '').replace(/"/g,'&quot;')}"
            placeholder="Photo note" onchange="ptUpdateGroupPhotoNote('${id}','${ek}',${pi},this.value)">
          <button class="btn-icon" onclick="ptRemoveGroupPhoto('${id}','${ek}',${pi})">✕</button>
        </div>`).join('');

      bodyHtml += `
        <div class="pt-floor-group">
          <div class="pt-floor-group-header">
            <span class="pt-floor-group-label">${floorKey}</span>
            <div class="pt-floor-group-actions">
              <button class="btn btn-secondary btn-sm" onclick="ptUploadFloorPlan('${id}','${ek}')">
                ${group.floorplanDataUrl ? '⟳ Replace Plan' : '+ Floor Plan'}
              </button>
              ${group.floorplanDataUrl ? `<button class="btn btn-danger btn-sm" onclick="ptClearFloorPlan('${id}','${ek}')">✕ Plan</button>` : ''}
              <button class="btn btn-secondary btn-sm" onclick="ptAddGroupPhoto('${id}','${ek}')">+ Photo</button>
            </div>
          </div>
          ${(group.floorplanDataUrl || group.photos.length) ? `
            <div class="pt-floor-group-media">
              ${group.floorplanDataUrl ? `<img src="${group.floorplanDataUrl}" class="pt-group-plan-img" onclick="ptOpenLightbox(this.src)">` : ''}
              ${group.photos.length ? `<div class="pt-group-photos">${photosHtml}</div>` : ''}
            </div>` : ''}
          ${groupTests}
        </div>`;
    });

    if (ungrouped.length > 0) {
      bodyHtml += `
        <div class="pt-floor-group pt-floor-group-unassigned">
          <div class="pt-floor-group-header">
            <span class="pt-floor-group-label" style="color:var(--text-3);font-style:italic">— No floor assigned</span>
          </div>
          ${ungrouped.map(({ t, i }) => _renderPtTestItem(id, t, i, total)).join('')}
        </div>`;
    }
  }

  c.innerHTML = `
    <div class="section-header">
      <div>
        <h2><span class="sec-icon">${sec.icon}</span>${sec.label}</h2>
        <p>Plant Tests — add completed tests and save</p>
      </div>
      ${data.saved ? '<span style="color:var(--success);font-weight:700;font-size:14px">✓ Saved</span>' : ''}
    </div>
    <div class="card">
      ${bodyHtml}
      <div class="btn-row">
        <button class="btn btn-secondary" onclick="addPtTest('${id}')">+ Add Test</button>
        <button class="btn btn-primary"   onclick="savePtSection('${id}')">Save Section</button>
      </div>
    </div>`;
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

