// ===========================================================
// STATE
// ===========================================================
const state = {
  projectName: '',
  location: {},
  participants: [],
  overview: {},
  siteInspection: {}, // key: section id → {saved, activeFloor, floors:[...]}
  plantTests: {},     // key: section id → {saved, tests:[]}
  activeSiSection: null,
  activePtSection: null,
  siNavOpen: false,
  ptNavOpen: false,
  // versioning
  versions: [],          // committed snapshots (oldest → newest)
  currentVersionNum: 1,  // version number of the current working session
};

// ===========================================================
// SECTIONS & MACROS
// ===========================================================
const SI_SECTIONS = [
  { id: 'site-status',        label: 'Site Status',                icon: 'SS',  macro: 'Generale' },
  { id: 'fire-reaction',      label: 'Fire Reaction',              icon: 'FR',  macro: 'Protezione Passiva' },
  { id: 'fire-resistance',    label: 'Fire Resistance',            icon: 'RS',  macro: 'Protezione Passiva' },
  { id: 'compartimentation',  label: 'Compartimentation',          icon: 'CP',  macro: 'Protezione Passiva' },
  { id: 'exit-path',          label: 'Exit Path',                  icon: 'EP',  macro: 'Vie di Esodo' },
  { id: 'refuge-areas',       label: 'Refuge Areas',               icon: 'RA',  macro: 'Vie di Esodo' },
  { id: 'fire-extinguisher',  label: 'Fire Extinguisher',          icon: 'FE',  macro: 'Protezione Attiva' },
  { id: 'manual-suppression', label: 'Manual Fire Suppression',    icon: 'MS',  macro: 'Protezione Attiva' },
  { id: 'auto-suppression',   label: 'Automatic Fire Suppression', icon: 'AS',  macro: 'Protezione Attiva' },
  { id: 'detection-alarm',    label: 'Detection and Alarm',        icon: 'DA',  macro: 'Protezione Attiva' },
  { id: 'smoke-heat',         label: 'Smoke and Heat Control',     icon: 'SH',  macro: 'Protezione Attiva' },
  { id: 'tech-system',        label: 'Technological System',       icon: 'TS',  macro: 'Sistemi e Gestione' },
  { id: 'fire-safety-mgmt',   label: 'Fire Safety Management',     icon: 'FM',  macro: 'Sistemi e Gestione' },
];
const SI_MACROS = ['Generale', 'Protezione Passiva', 'Vie di Esodo', 'Protezione Attiva', 'Sistemi e Gestione'];

const PT_SECTIONS = [
  { id: 'pt-detection',    label: 'Detection and Alarm',         icon: 'DA' },
  { id: 'pt-refuge',       label: 'Refuge Area System',          icon: 'RA' },
  { id: 'pt-current-tech', label: 'Current Tech and Linked Sys', icon: 'CT' },
  { id: 'pt-manual-supp',  label: 'Manual Fire Suppression',     icon: 'MS' },
  { id: 'pt-auto-supp',    label: 'Automatic Fire Suppression',  icon: 'AS' },
  { id: 'pt-smoke',        label: 'Smoke and Heat Control',      icon: 'SH' },
];

const AREA_CATEGORIES = [
  'Ground Floor','First Floor','Second Floor','Third Floor',
  'Basement','Mezzanine','Roof','Exterior',
  'Zone A','Zone B','Zone C','Zone D',
];

// ===========================================================
// FLOOR DATA HELPERS
// ===========================================================
function createEmptyFloor() {
  return {
    id: Date.now() + Math.random(),
    floorLabel: '',
    areaCategory: '',
    floorplanDataUrl: null,
    floorplanPins: [],
    comments: '',
    photos: [],
    notes: '',
    riverifica: false,
  };
}

function getActiveFloor(id) {
  const sec = state.siteInspection[id];
  return sec ? sec.floors[sec.activeFloor] : null;
}

function initSiSection(id) {
  if (!state.siteInspection[id]) {
    state.siteInspection[id] = { saved: false, nonPresente: false, activeFloor: 0, floors: [createEmptyFloor()] };
  }
}

// ===========================================================
// SIDEBAR RENDERING
// ===========================================================
function renderSiSidebarItems() {
  const group = document.getElementById('si-nav-group');
  group.innerHTML = '';
  SI_MACROS.forEach(macro => {
    const label = document.createElement('div');
    label.className = 'nav-macro-label';
    label.textContent = macro;
    group.appendChild(label);
    SI_SECTIONS.filter(s => s.macro === macro).forEach(s => {
      const el = document.createElement('div');
      const isActive     = state.activeSiSection === s.id;
      const sec          = state.siteInspection[s.id];
      const isSaved      = sec?.saved;
      const isNonPresente= sec?.nonPresente;
      el.className = 'nav-sub-item' + (isActive ? ' active' : '') + (isSaved ? ' saved' : '') + (isNonPresente ? ' non-presente' : '');
      el.id = 'nav-sub-si-' + s.id;
      const badge = isNonPresente
        ? '<span class="sub-absent">✕</span>'
        : (isSaved ? '<span class="sub-check">✓</span>' : '');
      el.innerHTML = `<span class="sub-dot">●</span><span style="flex:1">${s.label}</span>${badge}`;
      el.onclick = () => navigateToSiSection(s.id);
      group.appendChild(el);
    });
  });
}

function renderPtSidebarItems() {
  const group = document.getElementById('pt-nav-group');
  group.innerHTML = '';
  PT_SECTIONS.forEach(s => {
    const el = document.createElement('div');
    const isActive = state.activePtSection === s.id;
    const isSaved  = state.plantTests[s.id]?.saved;
    el.className = 'nav-sub-item' + (isActive ? ' active' : '') + (isSaved ? ' saved' : '');
    el.id = 'nav-sub-pt-' + s.id;
    el.innerHTML = `<span class="sub-dot">●</span><span style="flex:1">${s.label}</span>${isSaved ? '<span class="sub-check">✓</span>' : ''}`;
    el.onclick = () => navigateToPtSection(s.id);
    group.appendChild(el);
  });
}

// ===========================================================
// ACCORDION TOGGLES
// ===========================================================
function toggleSiNav() {
  state.siNavOpen = !state.siNavOpen;
  const group  = document.getElementById('si-nav-group');
  const toggle = document.getElementById('nav-site-inspection');
  group.style.display = state.siNavOpen ? 'block' : 'none';
  toggle.classList.toggle('open', state.siNavOpen);
  if (state.siNavOpen) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('nav-plant-tests').classList.remove('active');
    toggle.classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-site-inspection').classList.add('active');
    if (state.activeSiSection) renderSiContent();
  } else {
    toggle.classList.remove('active');
  }
}

function togglePtNav() {
  state.ptNavOpen = !state.ptNavOpen;
  const group  = document.getElementById('pt-nav-group');
  const toggle = document.getElementById('nav-plant-tests');
  group.style.display = state.ptNavOpen ? 'block' : 'none';
  toggle.classList.toggle('open', state.ptNavOpen);
  if (state.ptNavOpen) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('nav-site-inspection').classList.remove('active');
    toggle.classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-plant-tests').classList.add('active');
    if (state.activePtSection) renderPtContent();
  } else {
    toggle.classList.remove('active');
  }
}

// ===========================================================
// NAVIGATION
// ===========================================================
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('nav-site-inspection').classList.remove('active');
  document.getElementById('nav-plant-tests').classList.remove('active');
  document.getElementById('page-' + page).classList.add('active');
  const navEl = document.getElementById('nav-' + page);
  if (navEl) navEl.classList.add('active');
  if (page === 'preview')         renderPreview();
  if (page === 'export')          updateExportInfo();
  if (page === 'history')         renderHistoryPage();
  if (page === 'getting-started') renderGettingStarted();
}

function navigateToSiSection(id) {
  initSiSection(id);
  state.activeSiSection = id;
  if (!state.siNavOpen) {
    state.siNavOpen = true;
    document.getElementById('si-nav-group').style.display = 'block';
    document.getElementById('nav-site-inspection').classList.add('open');
  }
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-site-inspection').classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('nav-plant-tests').classList.remove('active');
  document.getElementById('nav-site-inspection').classList.add('active');
  renderSiSidebarItems();
  renderSiContent();
}

function navigateToPtSection(id) {
  if (!state.plantTests[id]) {
    state.plantTests[id] = { saved: false, tests: [createEmptyTest()] };
  }
  state.activePtSection = id;
  if (!state.ptNavOpen) {
    state.ptNavOpen = true;
    document.getElementById('pt-nav-group').style.display = 'block';
    document.getElementById('nav-plant-tests').classList.add('open');
  }
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-plant-tests').classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('nav-site-inspection').classList.remove('active');
  document.getElementById('nav-plant-tests').classList.add('active');
  renderPtSidebarItems();
  renderPtContent();
}

// ===========================================================
// TOAST
// ===========================================================
let toastTimer;
function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = ''; }, 2800);
}

// ===========================================================
// VERSIONING
// ===========================================================

// Deep clone excluding base64 images (keeps snapshots lightweight)
function deepCloneForVersion(obj) {
  return JSON.parse(JSON.stringify(obj, (key, val) => {
    if (key === 'dataUrl' || key === 'floorplanDataUrl') return null;
    return val;
  }));
}

function snapshotCurrent() {
  return {
    versionNum:    state.currentVersionNum,
    createdAt:     new Date().toISOString(),
    verbale:       state.location.verbale       || '',
    nrSopralluogo: state.location.nrSopralluogo || '',
    projectName:   state.projectName,
    location:      deepCloneForVersion(state.location),
    participants:  deepCloneForVersion(state.participants),
    overview:      deepCloneForVersion(state.overview),
    siteInspection:deepCloneForVersion(state.siteInspection),
    plantTests:    deepCloneForVersion(state.plantTests),
  };
}

function commitVersion(silent = false) {
  const snap = snapshotCurrent();
  const idx  = state.versions.findIndex(v => v.versionNum === state.currentVersionNum);
  if (idx >= 0) state.versions[idx] = snap;
  else          state.versions.push(snap);
  state.versions.sort((a, b) => a.versionNum - b.versionNum);
  updateVersionDisplay();
  if (!silent) showToast(`Version ${state.currentVersionNum} saved ✓`, 'success');
}

function nuovoSopralluogo() {
  if (!state.projectName) { showToast('Load or start an inspection first', 'error'); return; }
  commitVersion(true);

  const nextNum      = Math.max(...state.versions.map(v => v.versionNum), 0) + 1;
  const oldLocation  = deepCloneForVersion(state.location);
  const oldNr        = parseInt(oldLocation.nrSopralluogo || '0', 10);

  state.currentVersionNum = nextNum;
  state.location = {
    ...oldLocation,
    date:          new Date().toISOString().split('T')[0],
    nrSopralluogo: String(oldNr + 1),
    verbale:       '',
  };
  state.participants     = deepCloneForVersion(state.participants);
  state.overview         = {};
  state.siteInspection   = {};
  state.plantTests       = {};
  state.activeSiSection  = null;
  state.activePtSection  = null;

  updateBadges();
  renderSiSidebarItems();
  renderPtSidebarItems();
  populateLocationForm();
  populateOverviewForm();
  updateNumeroVerbale();
  updateVersionDisplay();
  navigate('location');
  showToast(`Inspection v${nextNum} started — same site`, 'success');
}

function loadVersion(versionNum) {
  const v = state.versions.find(sv => sv.versionNum === versionNum);
  if (!v) return;
  // commit current first so we don't lose it
  commitVersion(true);

  state.location         = JSON.parse(JSON.stringify(v.location));
  state.participants     = JSON.parse(JSON.stringify(v.participants));
  state.overview         = JSON.parse(JSON.stringify(v.overview));
  state.siteInspection   = JSON.parse(JSON.stringify(v.siteInspection));
  state.plantTests       = JSON.parse(JSON.stringify(v.plantTests));
  state.currentVersionNum= versionNum;
  state.activeSiSection  = null;
  state.activePtSection  = null;

  updateBadges();
  renderSiSidebarItems();
  renderPtSidebarItems();
  populateLocationForm();
  populateOverviewForm();
  updateVersionDisplay();
  navigate('location');
  showToast(`Version ${versionNum} loaded`, 'info');
}

function updateVersionDisplay() {
  const el = document.getElementById('version-display');
  if (!el) return;
  if (state.projectName) {
    el.textContent = `v${state.currentVersionNum}`;
    el.style.display = 'inline-flex';
  } else {
    el.style.display = 'none';
  }
}

// Export full project (all versions + current) as JSON
function exportProject() {
  commitVersion(true);
  const data = {
    projectName: state.projectName,
    exportedAt:  new Date().toISOString(),
    currentVersionNum: state.currentVersionNum,
    versions:    state.versions,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${(state.projectName || 'progetto').replace(/[^a-zA-Z0-9\-_]/g,'_')}_storico.json`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Project exported ✓', 'success');
}

// Import project from JSON
function importProject() {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = '.json';
  inp.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.versions || !Array.isArray(data.versions)) throw new Error('formato non valido');

        state.projectName      = data.projectName || '';
        state.versions         = data.versions;
        state.currentVersionNum= data.currentVersionNum || data.versions.length;

        // load the most recent version as the working state
        const latest = [...state.versions].sort((a, b) => b.versionNum - a.versionNum)[0];
        state.location       = JSON.parse(JSON.stringify(latest.location));
        state.participants   = JSON.parse(JSON.stringify(latest.participants));
        state.overview       = JSON.parse(JSON.stringify(latest.overview));
        state.siteInspection = JSON.parse(JSON.stringify(latest.siteInspection));
        state.plantTests     = JSON.parse(JSON.stringify(latest.plantTests));
        state.activeSiSection= null;
        state.activePtSection= null;

        document.getElementById('project-name-display').textContent = '— ' + state.projectName;
        updateBadges();
        renderSiSidebarItems();
        renderPtSidebarItems();
        populateLocationForm();
        populateOverviewForm();
        updateVersionDisplay();
        navigate('history');
        showToast(`Project imported — ${state.versions.length} version${state.versions.length !== 1 ? 's' : ''}`, 'success');
      } catch (err) {
        showToast('Error reading JSON file', 'error');
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
  const el = document.getElementById('gs-content');
  if (!el) return;
  const hasProject = !!state.projectName;
  const hasVersions = state.versions.length > 0;

  el.innerHTML = `
    <div class="gs-hero">
      <div class="gs-brand">
        <img src="images/logo_icon_transparent.png" alt="Site Insight" class="gs-logo">
        <h1>Site Insight</h1>
      </div>
      <p class="gs-tagline">Inspection Monitoring Platform</p>
      <div class="gs-cards">
        <div class="gs-card" onclick="newInspection()">
          <div class="gs-icon">✨</div>
          <h3>New Inspection</h3>
          <p>Start a new inspection from scratch.</p>
        </div>
        ${hasProject ? `
        <div class="gs-card gs-card-accent" onclick="nuovoSopralluogo()">
          <div class="gs-icon">🔄</div>
          <h3>New Survey</h3>
          <p>Update same site — creates version v${state.currentVersionNum + 1} inheriting location.</p>
        </div>` : `
        <div class="gs-card" onclick="loadMock()">
          <div class="gs-icon">📂</div>
          <h3>Load Demo</h3>
          <p>Explore the app with pre-filled sample data.</p>
        </div>`}
        ${hasVersions ? `
        <div class="gs-card" onclick="navigate('history')">
          <div class="gs-icon">🕐</div>
          <h3>Version History</h3>
          <p>${state.versions.length} version${state.versions.length !== 1 ? 's' : ''} saved for <em>${state.projectName}</em>.</p>
        </div>` : `
        <div class="gs-card" onclick="loadMock()">
          <div class="gs-icon">📂</div>
          <h3>Load Demo</h3>
          <p>Explore the app with pre-filled sample data.</p>
        </div>`}
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
  state.location         = {};
  state.participants     = [];
  state.overview         = {};
  state.siteInspection   = {};
  state.plantTests       = {};
  state.activeSiSection  = null;
  state.activePtSection  = null;
  state.versions         = [];
  state.currentVersionNum= 1;
  state.projectName      = 'Nuova Ispezione';
  document.getElementById('project-name-display').textContent = '— ' + state.projectName;
  updateVersionDisplay();
  renderSiSidebarItems();
  renderPtSidebarItems();
  updateBadges();
  navigate('location');
  showToast('New inspection started', 'success');
}

function loadMock() {
  const today = new Date().toISOString().split('T')[0];
  state.projectName = 'Stabilimento Industriale XYZ';
  document.getElementById('project-name-display').textContent = '— ' + state.projectName;
  state.location = {
    date: today,
    nrSopralluogo: '3',
    verbale: today.replace(/-/g,'') + '-XYZMAN-SP-003',
    luogo: "Via dell'Industria 12, 20090 Assago (MI)",
    tipo: 'Sopralluogo periodico',
    cliente: 'XYZ Manufacturing S.p.A.',
    desc: 'Stabilimento produttivo su tre livelli con magazzino automatizzato. Attività ATECO 25.11.',
  };
  state.participants = [
    { nome: 'Ing. Marco Rossi',     ruolo: 'Responsabile Sicurezza', azienda: 'XYZ Manufacturing S.p.A.', email: 'm.rossi@xyz.it' },
    { nome: 'Arch. Giulia Bianchi', ruolo: 'Ispettore Antincendio',  azienda: 'FireSafe Consulting',       email: 'g.bianchi@firesafe.it' },
    { nome: 'Paolo Verdi',          ruolo: 'Manutentore Impianti',   azienda: 'TechService S.r.l.',        email: 'p.verdi@techservice.it' },
  ];
  state.overview = {
    obiettivo:   'Verifica periodica annuale della conformità antincendio ai sensi del D.M. 3/8/2015.',
    note:        "L'ispezione ha evidenziato alcune non conformità nelle vie di esodo al piano primo.",
    docs:        '- CPI n. 12345/2020\n- Planimetrie aggiornate rev. 3/2023\n- Registro antincendio',
    valutazione: 'Parzialmente conforme',
    priorita:    'Media',
  };
  ['fire-reaction', 'exit-path', 'detection-alarm', 'fire-extinguisher'].forEach((id, i) => {
    state.siteInspection[id] = {
      saved: true, activeFloor: 0,
      floors: [
        {
          id: i, floorLabel: 'Piano Terra', areaCategory: 'Zona A',
          floorplanDataUrl: null, floorplanPins: [],
          comments: 'Verifica eseguita con esito ' + (i % 2 === 0 ? 'positivo' : 'parzialmente positivo') + '.',
          photos: [
            { dataUrl: null, code: id.toUpperCase().replace(/-/g,'').substring(0,8)+'-001', note: 'Vista generale area', pins: [], fpPinRef: null },
            { dataUrl: null, code: id.toUpperCase().replace(/-/g,'').substring(0,8)+'-002', note: 'Dettaglio dispositivo', pins: [], fpPinRef: null },
          ],
          notes: 'Nessuna anomalia critica rilevata.', riverifica: i === 1,
        },
        {
          id: i + 100, floorLabel: 'Piano Primo', areaCategory: 'Zona B',
          floorplanDataUrl: null, floorplanPins: [],
          comments: 'Piano primo verificato senza rilievi.',
          photos: [], notes: '', riverifica: false,
        },
      ],
    };
  });
  ['pt-detection', 'pt-auto-supp'].forEach(id => {
    state.plantTests[id] = {
      saved: true,
      tests: [
        { test: 'T-001', piano: 'Piano Terra', localizzazione: 'Zona A - Ingresso', tipoAttivazione: 'Automatica', risultati: 'Positivo - risposta entro 30s' },
        { test: 'T-002', piano: 'Piano Primo', localizzazione: 'Zona B - Magazzino', tipoAttivazione: 'Manuale', risultati: 'Positivo' },
      ],
    };
  });
  // create mock version history
  state.versions = [];
  state.currentVersionNum = 2;

  // v1 — initial inspection 6 months ago
  const v1date = new Date(); v1date.setMonth(v1date.getMonth() - 6);
  state.versions.push({
    versionNum: 1, createdAt: v1date.toISOString(),
    verbale: v1date.toISOString().split('T')[0].replace(/-/g,'') + '-XYZMAN-SI-001',
    nrSopralluogo: '1', projectName: 'Stabilimento Industriale XYZ',
    location: { date: v1date.toISOString().split('T')[0], nrSopralluogo: '1',
      verbale: v1date.toISOString().split('T')[0].replace(/-/g,'') + '-XYZMAN-SI-001',
      luogo: "Via dell'Industria 12, 20090 Assago (MI)", tipo: 'Sopralluogo iniziale',
      cliente: 'XYZ Manufacturing S.p.A.', desc: 'Stabilimento produttivo su tre livelli.' },
    participants: [],
    overview: { obiettivo: 'Sopralluogo iniziale ai sensi del D.M. 3/8/2015.',
      valutazione: 'Non conforme', priorita: 'Alta',
      note: 'Rilevate gravi non conformità nelle vie di esodo al piano primo.' },
    siteInspection: {
      'exit-path':   { saved: true, activeFloor: 0, floors: [{ id:1, floorLabel:'Piano Terra', areaCategory:'Zona A', floorplanDataUrl:null, floorplanPins:[], comments:'Larghezza insufficiente.', photos:[], notes:'', riverifica:true }] },
      'fire-reaction':{ saved: true, activeFloor: 0, floors: [{ id:2, floorLabel:'Piano Terra', areaCategory:'Zona A', floorplanDataUrl:null, floorplanPins:[], comments:'Materiali non certificati in magazzino.', photos:[], notes:'', riverifica:true }] },
      'detection-alarm':{ saved: true, activeFloor: 0, floors: [{ id:3, floorLabel:'Piano Terra', areaCategory:'Tutto', floorplanDataUrl:null, floorplanPins:[], comments:'Centrale guasta.', photos:[], notes:'', riverifica:true }] },
    },
    plantTests: {},
  });

  updateBadges();
  renderSiSidebarItems();
  renderPtSidebarItems();
  populateLocationForm();
  populateOverviewForm();
  updateVersionDisplay();
  navigate('location');
  markNavSaved('location');
  markNavSaved('overview');
  showToast('Demo inspection loaded!', 'success');
}

// ===========================================================
// LOCATION FORM + AUTO VERBALE
// ===========================================================
function populateLocationForm() {
  const l = state.location;
  document.getElementById('loc-date').value          = l.date          || '';
  document.getElementById('loc-verbale').value       = l.verbale       || '';
  document.getElementById('loc-nr-sopralluogo').value= l.nrSopralluogo || '';
  document.getElementById('loc-luogo').value         = l.luogo         || '';
  document.getElementById('loc-tipo').value          = l.tipo          || '';
  document.getElementById('loc-cliente').value       = l.cliente       || '';
  document.getElementById('loc-desc').value          = l.desc          || '';
  renderParticipants();
}

function populateOverviewForm() {
  const o = state.overview;
  document.getElementById('ov-obiettivo').value   = o.obiettivo   || '';
  document.getElementById('ov-note').value        = o.note        || '';
  document.getElementById('ov-docs').value        = o.docs        || '';
  document.getElementById('ov-valutazione').value = o.valutazione || '';
  document.getElementById('ov-priorita').value    = o.priorita    || '';
}

function updateNumeroVerbale() {
  const date    = document.getElementById('loc-date').value;
  const tipo    = document.getElementById('loc-tipo').value;
  const cliente = document.getElementById('loc-cliente').value;
  const nr      = document.getElementById('loc-nr-sopralluogo').value;

  const dateStr    = date    ? date.replace(/-/g, '')                                           : 'YYYYMMDD';
  const clienteStr = cliente ? cliente.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase() : 'CLI';
  const tipoMap    = {
    'Initial Inspection':             'II',
    'Periodic Inspection':            'PI',
    'Extraordinary Inspection':       'EI',
    'Post-intervention Verification': 'PV',
    'System Commissioning':           'SC',
  };
  const tipoStr = tipoMap[tipo] || 'XX';
  const nrStr   = nr ? String(parseInt(nr, 10) || 1).padStart(3, '0') : '001';
  document.getElementById('loc-verbale').value = `${dateStr}-${clienteStr}-${tipoStr}-${nrStr}`;
}

// ===========================================================
// PARTICIPANTS
// ===========================================================
function renderParticipants() {
  const tbody = document.getElementById('participants-body');
  tbody.innerHTML = '';
  state.participants.forEach((p, i) => {
    const tr = document.createElement('tr');
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
  state.participants.push({ nome: '', ruolo: '', azienda: '', email: '' });
  renderParticipants();
}

function removeParticipant(i) {
  state.participants.splice(i, 1);
  renderParticipants();
}

function saveLocation() {
  state.location = {
    date:          document.getElementById('loc-date').value,
    verbale:       document.getElementById('loc-verbale').value,
    nrSopralluogo: document.getElementById('loc-nr-sopralluogo').value,
    luogo:         document.getElementById('loc-luogo').value,
    tipo:          document.getElementById('loc-tipo').value,
    cliente:       document.getElementById('loc-cliente').value,
    desc:          document.getElementById('loc-desc').value,
  };
  if (!state.projectName || state.projectName === 'Nuova Ispezione') {
    state.projectName = state.location.luogo || 'Ispezione';
    document.getElementById('project-name-display').textContent = '— ' + state.projectName;
  }
  markNavSaved('location');
  showToast('Location & Participants saved ✓', 'success');
}

function saveOverview() {
  state.overview = {
    obiettivo:   document.getElementById('ov-obiettivo').value,
    note:        document.getElementById('ov-note').value,
    docs:        document.getElementById('ov-docs').value,
    valutazione: document.getElementById('ov-valutazione').value,
    priorita:    document.getElementById('ov-priorita').value,
  };
  markNavSaved('overview');
  showToast('Inspection Overview saved ✓', 'success');
}

function markNavSaved(page) {
  const el = document.getElementById('nav-' + page);
  if (el) el.classList.add('saved');
}

// ===========================================================
// SITE INSPECTION – FLOOR MANAGEMENT
// ===========================================================
function siReadCurrentFloor(id) {
  const sec = state.siteInspection[id];
  if (!sec) return;
  const fl = sec.floors[sec.activeFloor];
  if (!fl) return;
  const areaEl    = document.getElementById('si-area-cat');
  const labelEl   = document.getElementById('si-floor-label');
  const commentsEl= document.getElementById('si-comments');
  const notesEl   = document.getElementById('si-notes');
  const riverEl   = document.getElementById('si-riverifica');
  if (areaEl)     fl.areaCategory = areaEl.value;
  if (labelEl)    fl.floorLabel   = labelEl.value;
  if (commentsEl) fl.comments     = commentsEl.value;
  if (notesEl)    fl.notes        = notesEl.value;
  if (riverEl)    fl.riverifica   = riverEl.checked;
}

function siSetActiveFloor(id, idx) {
  siReadCurrentFloor(id);
  state.siteInspection[id].activeFloor = idx;
  renderSiContent();
}

function siAddFloor(id) {
  siReadCurrentFloor(id);
  state.siteInspection[id].floors.push(createEmptyFloor());
  state.siteInspection[id].activeFloor = state.siteInspection[id].floors.length - 1;
  renderSiContent();
}

function siRemoveFloor(id, idx) {
  const sec = state.siteInspection[id];
  if (sec.floors.length === 1) { showToast('At least one floor is required', 'error'); return; }
  sec.floors.splice(idx, 1);
  if (sec.activeFloor >= sec.floors.length) sec.activeFloor = sec.floors.length - 1;
  renderSiContent();
}

// ===========================================================
// SITE INSPECTION – CONTENT RENDER
// ===========================================================
function renderSiContent() {
  const id = state.activeSiSection;
  if (!id || !state.siteInspection[id]) return;
  const sec  = SI_SECTIONS.find(s => s.id === id);
  const data = state.siteInspection[id];
  const fl   = data.floors[data.activeFloor];
  const c    = document.getElementById('si-active-content');

  const floorTabsHtml = data.floors.map((f, i) => {
    const tabLabel = f.floorLabel || f.areaCategory || `Piano ${i + 1}`;
    return `<button class="floor-tab${i === data.activeFloor ? ' active' : ''}"
      onclick="siSetActiveFloor('${id}',${i})">${tabLabel}${data.floors.length > 1
        ? `<span class="floor-tab-del" onclick="event.stopPropagation();siRemoveFloor('${id}',${i})">✕</span>`
        : ''}</button>`;
  }).join('');

  const areaCatOptions = AREA_CATEGORIES.map(a =>
    `<option${fl.areaCategory === a ? ' selected' : ''}>${a}</option>`
  ).join('');

  const vs = siViewerState[id];

  const savedBadge = data.nonPresente
    ? '<span class="absent-badge">✕ Non presente</span>'
    : (data.saved ? '<span style="color:var(--success);font-weight:700;font-size:14px">✓ Saved</span>' : '');

  c.innerHTML = `
    <div class="section-header">
      <div>
        <div class="macro-tag">${sec.macro}</div>
        <h2><span class="sec-icon">${sec.icon}</span>${sec.label}</h2>
        <p>Site Inspection — fill in and save this section</p>
      </div>
      ${savedBadge}
    </div>

    <div class="non-presente-bar">
      <label class="np-toggle">
        <input type="checkbox" id="si-non-presente" ${data.nonPresente ? 'checked' : ''}
          onchange="siToggleNonPresente('${id}', this.checked)">
        <span class="np-toggle-track"><span class="np-toggle-thumb"></span></span>
        <span class="np-toggle-label">Element / system <strong>not present</strong> at this site</span>
      </label>
    </div>

    ${data.nonPresente ? `
    <div class="card non-presente-card">
      <div class="np-icon">✕</div>
      <div class="np-message">
        <strong>${sec.label}</strong> not present at this site.<br>
        <span>Save to record the absence in the report.</span>
      </div>
      <button class="btn btn-primary" onclick="saveSiSection('${id}')">Salva</button>
    </div>` : ''}

    <div${data.nonPresente ? ' style="display:none"' : ''}>
    <div class="floor-tabs-bar">
      <div class="floor-tabs">${floorTabsHtml}</div>
      <button class="btn btn-secondary btn-sm" onclick="siAddFloor('${id}')">+ Floor/Zone</button>
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
          <input type="text" id="si-floor-label" value="${fl.floorLabel || ''}" placeholder="e.g. Ground Floor - Production Area">
        </div>
      </div>

      <div class="fp-section">
        <div class="fp-section-header">
          <label class="field-label">Floor Plan</label>
          <div style="display:flex;gap:8px">
            <button class="btn btn-secondary btn-sm" onclick="siUploadFloorplan('${id}')">Load Image</button>
            ${fl.floorplanDataUrl ? `<button class="btn btn-secondary btn-sm" onclick="siClearFloorplan('${id}')">Remove</button>` : ''}
          </div>
        </div>
        <input type="file" id="si-fp-input-${id}" accept="image/*" style="display:none" onchange="siFloorplanLoaded('${id}',this)">
        ${fl.floorplanDataUrl
          ? `<div class="img-viewer-wrap" id="fp-viewer-${id}">
               <div class="img-viewer-inner" id="fp-inner-${id}">
                 <img src="${fl.floorplanDataUrl}" id="fp-img-${id}" draggable="false">
                 <div class="img-pins" id="fp-pins-${id}"></div>
               </div>
             </div>
             <div class="img-viewer-toolbar">
               <button class="btn btn-secondary btn-sm" onclick="fpZoom('${id}',0.25)">+ Zoom</button>
               <button class="btn btn-secondary btn-sm" onclick="fpZoom('${id}',-0.25)">- Zoom</button>
               <button class="btn btn-secondary btn-sm" onclick="fpResetZoom('${id}')">Reset</button>
               <button class="btn btn-sm ${vs && vs.pinMode ? 'btn-warning' : 'btn-outline'}" onclick="fpTogglePinMode('${id}')">
                 ${vs && vs.pinMode ? 'Cancel Pin' : 'Add Pin'}
               </button>
             </div>
             ${fl.floorplanPins.length > 0 ? renderPinListHtml(fl.floorplanPins, 'fp-pin', id) : ''}`
          : `<div class="upload-area" onclick="siUploadFloorplan('${id}')">
               <div class="upload-icon"></div>
               <p>Click to load the area floor plan (JPG, PNG, etc.)</p>
             </div>`
        }
      </div>

      <div class="form-row cols-1" style="margin-top:20px">
        <div class="form-group">
          <label>Comments</label>
          <textarea id="si-comments" placeholder="Enter comments about this section...">${fl.comments || ''}</textarea>
        </div>
      </div>

      <div class="photos-section">
        <div class="photos-section-header">
          <label class="field-label">Photos</label>
          <button class="btn btn-secondary btn-sm" onclick="siAddPhoto('${id}')">+ Photo</button>
        </div>
        <div id="si-photos-list"></div>
      </div>

      <div class="form-row cols-1">
        <div class="form-group">
          <label>Notes</label>
          <textarea id="si-notes" placeholder="Additional notes...">${fl.notes || ''}</textarea>
        </div>
      </div>

      <div class="riverifica-box">
        <input type="checkbox" id="si-riverifica" ${fl.riverifica ? 'checked' : ''}>
        <label for="si-riverifica">⚠️ Re-inspection required for this section</label>
      </div>

      <div class="btn-row">
        <button class="btn btn-primary" onclick="saveSiSection('${id}')">Save Section</button>
      </div>
    </div>
    </div>
  `;

  renderSiPhotos(id);
  if (fl.floorplanDataUrl) {
    setupFloorplanViewer(id);
    renderFloorplanPins(id);
  }
}

// ===========================================================
// FLOORPLAN VIEWER
// ===========================================================
const siViewerState = {}; // keyed by section id: {zoom, panX, panY, dragging, pinMode}

function siUploadFloorplan(id) {
  document.getElementById('si-fp-input-' + id)?.click();
}

function siFloorplanLoaded(id, input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    siReadCurrentFloor(id);
    getActiveFloor(id).floorplanDataUrl = e.target.result;
    siViewerState[id] = { zoom: 1, panX: 0, panY: 0, dragging: false, startX: 0, startY: 0, pinMode: false };
    renderSiContent();
  };
  reader.readAsDataURL(file);
}

function siClearFloorplan(id) {
  siReadCurrentFloor(id);
  const fl = getActiveFloor(id);
  fl.floorplanDataUrl = null;
  fl.floorplanPins = [];
  delete siViewerState[id];
  renderSiContent();
}

function setupFloorplanViewer(id) {
  const wrap  = document.getElementById('fp-viewer-' + id);
  const inner = document.getElementById('fp-inner-' + id);
  if (!wrap || !inner) return;

  if (!siViewerState[id]) {
    siViewerState[id] = { zoom: 1, panX: 0, panY: 0, dragging: false, startX: 0, startY: 0, pinMode: false };
  }
  const vs = siViewerState[id];

  function applyTransform() {
    inner.style.transform = `translate(${vs.panX}px,${vs.panY}px) scale(${vs.zoom})`;
  }
  applyTransform();

  // Wheel zoom
  wrap.addEventListener('wheel', e => {
    e.preventDefault();
    vs.zoom = Math.min(6, Math.max(0.2, vs.zoom * (e.deltaY < 0 ? 1.1 : 0.9)));
    applyTransform();
  }, { passive: false });

  // Pan drag
  let hasDragged = false;
  wrap.addEventListener('mousedown', e => {
    if (vs.pinMode) return;
    vs.dragging = true; hasDragged = false;
    vs.startX = e.clientX - vs.panX;
    vs.startY = e.clientY - vs.panY;
    wrap.style.cursor = 'grabbing';
  });
  const onMouseMove = e => {
    if (!vs.dragging) return;
    const nx = e.clientX - vs.startX;
    const ny = e.clientY - vs.startY;
    if (Math.abs(nx - vs.panX) > 2 || Math.abs(ny - vs.panY) > 2) hasDragged = true;
    vs.panX = nx; vs.panY = ny;
    applyTransform();
  };
  const onMouseUp = () => {
    vs.dragging = false;
    wrap.style.cursor = vs.pinMode ? 'crosshair' : 'grab';
  };
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);

  // Click to place pin
  wrap.addEventListener('click', e => {
    if (!vs.pinMode || hasDragged) return;
    const img  = document.getElementById('fp-img-' + id);
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const x = parseFloat(((e.clientX - rect.left) / rect.width  * 100).toFixed(1));
    const y = parseFloat(((e.clientY - rect.top)  / rect.height * 100).toFixed(1));
    if (x < 0 || x > 100 || y < 0 || y > 100) return;
    const note = prompt('Nota per questo punto (opzionale):') ?? '';
    getActiveFloor(id).floorplanPins.push({ x, y, note });
    renderFloorplanPins(id);
    // refresh pin list below without full re-render
    const listEl = document.getElementById('fp-pin-list');
    const fl = getActiveFloor(id);
    if (listEl) {
      listEl.outerHTML = renderPinListHtml(fl.floorplanPins, 'fp-pin', id);
    } else {
      // append after toolbar
      const toolbar = document.querySelector('.img-viewer-toolbar');
      if (toolbar) toolbar.insertAdjacentHTML('afterend', renderPinListHtml(fl.floorplanPins, 'fp-pin', id));
    }
  });

  wrap.style.cursor = 'grab';
}

function fpZoom(id, delta) {
  const vs = siViewerState[id];
  if (!vs) return;
  vs.zoom = Math.min(6, Math.max(0.2, vs.zoom + delta));
  const inner = document.getElementById('fp-inner-' + id);
  if (inner) inner.style.transform = `translate(${vs.panX}px,${vs.panY}px) scale(${vs.zoom})`;
}

function fpResetZoom(id) {
  const vs = siViewerState[id];
  if (!vs) return;
  vs.zoom = 1; vs.panX = 0; vs.panY = 0;
  const inner = document.getElementById('fp-inner-' + id);
  if (inner) inner.style.transform = 'translate(0,0) scale(1)';
}

function fpTogglePinMode(id) {
  const vs = siViewerState[id];
  if (!vs) return;
  vs.pinMode = !vs.pinMode;
  renderSiContent(); // re-render to update toolbar button state
}

function renderFloorplanPins(id) {
  const fl = getActiveFloor(id);
  const container = document.getElementById('fp-pins-' + id);
  if (!container || !fl) return;
  container.innerHTML = fl.floorplanPins.map((p, i) => `
    <div class="img-pin" style="left:${p.x}%;top:${p.y}%" title="${p.note || 'Pin ' + (i + 1)}">
      <span class="img-pin-num">${i + 1}</span>
    </div>
  `).join('');
}

function removeFpPin(id, idx) {
  siReadCurrentFloor(id);
  getActiveFloor(id).floorplanPins.splice(idx, 1);
  renderFloorplanPins(id);
  const listEl = document.getElementById('fp-pin-list');
  const fl = getActiveFloor(id);
  if (listEl) listEl.outerHTML = fl.floorplanPins.length
    ? renderPinListHtml(fl.floorplanPins, 'fp-pin', id)
    : '<div id="fp-pin-list"></div>';
}

function renderPinListHtml(pins, prefix, id) {
  if (!pins.length) return '';
  const fl = getActiveFloor(id);
  return `<div class="pin-list" id="${prefix}-list">
    ${pins.map((p, i) => {
      const linked = fl ? fl.photos.filter(ph => ph.fpPinRef === i) : [];
      const badges = linked.map(ph =>
        `<span class="pin-photo-badge" title="${ph.note || ph.code}">${ph.code || 'Foto'}</span>`
      ).join('');
      return `
        <div class="pin-list-item">
          <span class="pin-list-num">${i + 1}</span>
          <input class="pin-list-note" value="${p.note || ''}"
            onchange="updateFpPinNote('${id}',${i},this.value)" placeholder="Add note...">
          ${badges ? `<div class="pin-photo-refs">${badges}</div>` : ''}
          <span class="pin-list-coords">${p.x}%, ${p.y}%</span>
          <button class="btn btn-danger btn-sm" onclick="removeFpPin('${id}',${i})">✕</button>
        </div>`;
    }).join('')}
  </div>`;
}

function updateFpPinNote(id, idx, val) {
  const fl = getActiveFloor(id);
  if (fl && fl.floorplanPins[idx]) fl.floorplanPins[idx].note = val;
}

function siLinkPhotoToPin(id, photoIdx, value) {
  const fl = getActiveFloor(id);
  if (!fl) return;
  fl.photos[photoIdx].fpPinRef = value === '' ? null : parseInt(value, 10);
  // refresh just the pin list so linked-photo badges update
  const listEl = document.getElementById('fp-pin-list');
  if (listEl) listEl.outerHTML = renderPinListHtml(fl.floorplanPins, 'fp-pin', id);
}

// ===========================================================
// SITE INSPECTION – PHOTOS WITH ANNOTATIONS
// ===========================================================
function siAddPhoto(id) {
  siReadCurrentFloor(id);
  const fl  = getActiveFloor(id);
  const n   = fl.photos.length + 1;
  const code = id.toUpperCase().replace(/-/g,'').substring(0, 8) + '-' + String(n).padStart(3, '0');
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      fl.photos.push({ dataUrl: ev.target.result, code, note: '', pins: [], fpPinRef: null });
      renderSiPhotos(id);
    };
    reader.readAsDataURL(file);
  };
  inp.click();
}

function siRemovePhoto(id, idx) {
  siReadCurrentFloor(id);
  getActiveFloor(id).photos.splice(idx, 1);
  renderSiPhotos(id);
}

function siUpdatePhotoCode(id, idx, val) { getActiveFloor(id).photos[idx].code = val; }
function siUpdatePhotoNote(id, idx, val) { getActiveFloor(id).photos[idx].note = val; }

function siAddPhotoPin(id, photoIdx) {
  const overlay = document.getElementById(`photo-overlay-${id}-${photoIdx}`);
  if (!overlay) return;
  const active = overlay.dataset.pinMode !== 'true';
  overlay.dataset.pinMode = active ? 'true' : 'false';
  overlay.style.cursor = active ? 'crosshair' : 'default';
  overlay.style.pointerEvents = active ? 'all' : 'none';
  const btn = document.getElementById(`photo-pin-btn-${id}-${photoIdx}`);
  if (btn) {
    btn.className = `btn btn-sm ${active ? 'btn-warning' : 'btn-outline'}`;
    btn.textContent = active ? '📍 Annulla' : '📍 Evidenzia';
  }
}

function siRemovePhotoPin(id, photoIdx, pinIdx) {
  getActiveFloor(id).photos[photoIdx].pins.splice(pinIdx, 1);
  renderSiPhotos(id);
}

function updatePhotoPinNote(id, photoIdx, pinIdx, val) {
  getActiveFloor(id).photos[photoIdx].pins[pinIdx].note = val;
}

function renderSiPhotos(id) {
  const fl = getActiveFloor(id);
  const container = document.getElementById('si-photos-list');
  if (!container || !fl) return;

  if (fl.photos.length === 0) {
    container.innerHTML = '<p style="color:var(--text-light);font-size:13px;padding:8px 0">Nessuna foto aggiunta.</p>';
    return;
  }

  container.innerHTML = fl.photos.map((p, i) => {
    // Build pin-link selector (only if floorplan pins exist)
    const pinSelector = fl.floorplanPins.length > 0 ? `
      <select class="photo-pin-select" title="Collega a pin planimetria"
        onchange="siLinkPhotoToPin('${id}',${i},this.value)">
        <option value="">📍 —</option>
        ${fl.floorplanPins.map((fp, pi) =>
          `<option value="${pi}" ${p.fpPinRef === pi ? 'selected' : ''}>Pin ${pi + 1}${fp.note ? ' · ' + fp.note.substring(0, 22) : ''}</option>`
        ).join('')}
      </select>` : '';
    return `
    <div class="photo-card">
      <div class="photo-card-header">
        <input class="photo-code-input" value="${p.code}"
          onchange="siUpdatePhotoCode('${id}',${i},this.value)" placeholder="Codice">
        <input class="photo-note-input" value="${p.note}"
          onchange="siUpdatePhotoNote('${id}',${i},this.value)" placeholder="Description...">
        ${pinSelector}
        ${p.fpPinRef !== null && p.fpPinRef !== undefined
          ? `<span class="photo-pin-badge">Pin ${p.fpPinRef + 1}</span>` : ''}
        <button id="photo-pin-btn-${id}-${i}" class="btn btn-outline btn-sm"
          onclick="siAddPhotoPin('${id}',${i})">Evidenzia</button>
        <button class="btn btn-danger btn-sm" onclick="siRemovePhoto('${id}',${i})">✕</button>
      </div>
      ${p.dataUrl ? `
        <div class="photo-viewer-wrap">
          <div class="photo-img-wrap" id="photo-wrap-${id}-${i}">
            <img src="${p.dataUrl}" class="photo-img" id="photo-img-${id}-${i}" draggable="false">
            <div class="img-pins" id="photo-pins-${id}-${i}">
              ${p.pins.map((pin, pi) => `
                <div class="img-pin" style="left:${pin.x}%;top:${pin.y}%" title="${pin.note || 'Pin ' + (pi+1)}">
                  <span class="img-pin-num">${pi + 1}</span>
                </div>
              `).join('')}
            </div>
            <div class="photo-overlay" id="photo-overlay-${id}-${i}"
              data-pin-mode="false" style="pointer-events:none"></div>
          </div>
          ${p.pins.length > 0 ? `
            <div class="pin-list" style="margin-top:6px">
              ${p.pins.map((pin, pi) => `
                <div class="pin-list-item">
                  <span class="pin-list-num">${pi + 1}</span>
                  <input class="pin-list-note" value="${pin.note || ''}"
                    onchange="updatePhotoPinNote('${id}',${i},${pi},this.value)" placeholder="Note...">
                  <button class="btn btn-danger btn-sm" onclick="siRemovePhotoPin('${id}',${i},${pi})">✕</button>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      ` : '<div class="photo-no-img">📷 Nessuna immagine</div>'}
    </div>
  `;
  }).join('');

  // Attach click-to-pin handlers
  fl.photos.forEach((p, i) => {
    if (!p.dataUrl) return;
    const overlay = document.getElementById(`photo-overlay-${id}-${i}`);
    if (!overlay) return;
    overlay.addEventListener('click', e => {
      if (overlay.dataset.pinMode !== 'true') return;
      const img  = document.getElementById(`photo-img-${id}-${i}`);
      if (!img) return;
      const rect = img.getBoundingClientRect();
      const x = parseFloat(((e.clientX - rect.left) / rect.width  * 100).toFixed(1));
      const y = parseFloat(((e.clientY - rect.top)  / rect.height * 100).toFixed(1));
      if (x < 0 || x > 100 || y < 0 || y > 100) return;
      const note = prompt('Nota per questo punto (opzionale):') ?? '';
      getActiveFloor(id).photos[i].pins.push({ x, y, note });
      renderSiPhotos(id);
    });
  });
}

// ===========================================================
// SAVE SI SECTION
// ===========================================================
function siToggleNonPresente(id, checked) {
  siReadCurrentFloor(id);
  state.siteInspection[id].nonPresente = checked;
  renderSiSidebarItems();
  renderSiContent();
}

function saveSiSection(id) {
  siReadCurrentFloor(id);
  const cb = document.getElementById('si-non-presente');
  if (cb) state.siteInspection[id].nonPresente = cb.checked;
  state.siteInspection[id].saved = true;
  updateBadges();
  renderSiSidebarItems();
  renderSiContent();
  showToast('Section saved ✓', 'success');
}

// ===========================================================
// PLANT TESTS
// ===========================================================
function createEmptyTest() {
  return { test: '', piano: '', localizzazione: '', tipoAttivazione: '', risultati: '' };
}

function renderPtContent() {
  const id = state.activePtSection;
  if (!id || !state.plantTests[id]) return;
  const sec  = PT_SECTIONS.find(s => s.id === id);
  const data = state.plantTests[id];
  const c    = document.getElementById('pt-active-content');

  const testsHtml = data.tests.map((t, i) => `
    <div class="test-item">
      <div class="test-item-header">
        <span class="test-item-title">Test #${i + 1}</span>
        ${data.tests.length > 1 ? `<button class="btn btn-danger btn-sm" onclick="removePtTest('${id}',${i})">✕ Remove</button>` : ''}
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
      <div class="form-row">
        <div class="form-group">
          <label>Activation Type</label>
          <select onchange="state.plantTests['${id}'].tests[${i}].tipoAttivazione=this.value">
            <option ${!t.tipoAttivazione ? 'selected' : ''} value="">-- Select --</option>
            <option ${t.tipoAttivazione==='Automatic'   ? 'selected' : ''}>Automatic</option>
            <option ${t.tipoAttivazione==='Manual'      ? 'selected' : ''}>Manual</option>
            <option ${t.tipoAttivazione==='Remote'      ? 'selected' : ''}>Remote</option>
            <option ${t.tipoAttivazione==='Semi-auto'   ? 'selected' : ''}>Semi-auto</option>
          </select>
        </div>
        <div class="form-group">
          <label>Results</label>
          <input value="${t.risultati}" onchange="state.plantTests['${id}'].tests[${i}].risultati=this.value" placeholder="e.g. Pass — response within 30s">
        </div>
      </div>
    </div>
  `).join('');

  c.innerHTML = `
    <div class="section-header">
      <div>
        <h2><span class="sec-icon">${sec.icon}</span>${sec.label}</h2>
        <p>Plant Tests — add completed tests and save</p>
      </div>
      ${data.saved ? '<span style="color:var(--success);font-weight:700;font-size:14px">✓ Saved</span>' : ''}
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
  showToast('Test section saved ✓', 'success');
}

// ===========================================================
// BADGES
// ===========================================================
function updateBadges() {
  document.getElementById('badge-site').textContent  = Object.values(state.siteInspection).filter(v => v.saved).length;
  document.getElementById('badge-plant').textContent = Object.values(state.plantTests).filter(v => v.saved).length;
}

// ===========================================================
// PREVIEW
// ===========================================================
function renderPreview() {
  const el      = document.getElementById('preview-content');
  const l       = state.location;
  const o       = state.overview;
  const savedSi = SI_SECTIONS.filter(s => state.siteInspection[s.id]?.saved);
  const savedPt = PT_SECTIONS.filter(s => state.plantTests[s.id]?.saved);

  let html = `<div class="preview-doc">
    <h1>FIRE SAFETY INSPECTION REPORT</h1>
    <p class="preview-subtitle">${l.verbale || 'N/A'} — ${l.date || ''}</p>`;

  // 1. Location
  html += `<div class="preview-section"><h2>1. Location &amp; Participants</h2>
    <div class="preview-kv">
      <span class="k">Date:</span>            <span class="v">${l.date          || '—'}</span>
      <span class="k">Report No.:</span>      <span class="v">${l.verbale       || '—'}</span>
      <span class="k">Inspection No.:</span>  <span class="v">${l.nrSopralluogo || '—'}</span>
      <span class="k">Location:</span>        <span class="v">${l.luogo         || '—'}</span>
      <span class="k">Type:</span>            <span class="v">${l.tipo          || '—'}</span>
      <span class="k">Client:</span>          <span class="v">${l.cliente       || '—'}</span>
      <span class="k">Activity:</span>        <span class="v">${l.desc          || '—'}</span>
    </div>`;
  if (state.participants.length > 0) {
    html += `<h3>Participants</h3>
    <table class="preview-table">
      <tr><th>Name</th><th>Role</th><th>Company</th><th>Email</th></tr>
      ${state.participants.map(p => `<tr><td>${p.nome}</td><td>${p.ruolo}</td><td>${p.azienda}</td><td>${p.email}</td></tr>`).join('')}
    </table>`;
  }
  html += '</div>';

  // 2. Overview
  if (o.obiettivo || o.note) {
    html += `<div class="preview-section"><h2>2. Inspection Overview</h2>
      <div class="preview-kv">
        ${o.obiettivo   ? `<span class="k">Objective:</span><span class="v">${o.obiettivo}</span>` : ''}
        ${o.valutazione ? `<span class="k">Assessment:</span><span class="v"><strong>${o.valutazione}</strong></span>` : ''}
        ${o.priorita    ? `<span class="k">Priority:</span><span class="v">${o.priorita}</span>` : ''}
        ${o.note        ? `<span class="k">Notes:</span><span class="v">${o.note}</span>` : ''}
        ${o.docs        ? `<span class="k">Documentation:</span><span class="v" style="white-space:pre-line">${o.docs}</span>` : ''}
      </div></div>`;
  }

  // 3. Site Inspection grouped by macro
  if (savedSi.length > 0) {
    html += `<div class="preview-section"><h2>3. Site Inspection</h2>`;
    SI_MACROS.forEach(macro => {
      const macroSecs = savedSi.filter(s => s.macro === macro);
      if (!macroSecs.length) return;
      html += `<div class="preview-macro-group"><div class="preview-macro-label">${macro}</div>`;
      macroSecs.forEach(s => {
        const d = state.siteInspection[s.id];
        html += `<h3>${s.icon} ${s.label}</h3>`;
        if (d.nonPresente) {
          html += `<div class="preview-kv"><span class="k" style="color:var(--danger)">✕ Not Present</span><span class="v">Element / system not present at this site</span></div>`;
          return;
        }
        d.floors.forEach((fl, fi) => {
          const flLabel = fl.floorLabel || fl.areaCategory || `Floor ${fi + 1}`;
          html += `<div class="preview-floor-block">
            <div class="preview-floor-label">${flLabel}${fl.areaCategory && fl.floorLabel ? ' — ' + fl.areaCategory : ''}</div>
            <div class="preview-kv">
              ${fl.comments   ? `<span class="k">Comments:</span><span class="v">${fl.comments}</span>` : ''}
              ${fl.notes      ? `<span class="k">Notes:</span><span class="v">${fl.notes}</span>` : ''}
              ${fl.riverifica ? `<span class="k">Re-inspection:</span><span class="v riverifica-flag">⚠️ RE-INSPECTION REQUIRED</span>` : ''}
            </div>`;
          if (fl.floorplanPins.length > 0) {
            html += `<div class="preview-pins-summary">Floor plan pins: ${fl.floorplanPins.map((p, i) => {
              const linked = fl.photos.filter(ph => ph.fpPinRef === i).map(ph => ph.code).join(', ');
              return `(${i+1}) ${p.note || '—'}${linked ? ' → ' + linked : ''}`;
            }).join(' · ')}</div>`;
          }
          if (fl.photos.length > 0) {
            html += `<table class="preview-table" style="margin-top:8px">
              <tr><th>Code</th><th>Pin</th><th>Description</th><th>Annotations</th></tr>
              ${fl.photos.map(p => `<tr>
                <td><strong>${p.code}</strong></td>
                <td>${p.fpPinRef !== null && p.fpPinRef !== undefined
                  ? `<span class="preview-xref">⬡ ${p.fpPinRef + 1}</span>${fl.floorplanPins[p.fpPinRef]?.note ? ' ' + fl.floorplanPins[p.fpPinRef].note : ''}`
                  : '—'}</td>
                <td>${p.note}</td>
                <td>${p.pins.length > 0 ? p.pins.map((pp, pi) => `(${pi+1}) ${pp.note || '—'}`).join(' · ') : '—'}</td>
              </tr>`).join('')}
            </table>`;
          }
          html += '</div>';
        });
      });
      html += '</div>';
    });
    html += '</div>';
  }

  // 4. Plant Tests
  if (savedPt.length > 0) {
    html += `<div class="preview-section"><h2>4. Plant Tests</h2>`;
    savedPt.forEach((s, idx) => {
      const d = state.plantTests[s.id];
      html += `<h3>${idx + 1}. ${s.icon} ${s.label}</h3>
        <table class="preview-table">
          <tr><th>Test</th><th>Piano</th><th>Localizzazione</th><th>Attivazione</th><th>Risultati</th></tr>
          ${d.tests.map(t => `<tr><td>${t.test}</td><td>${t.piano}</td><td>${t.localizzazione}</td><td>${t.tipoAttivazione}</td><td>${t.risultati}</td></tr>`).join('')}
        </table>`;
    });
    html += '</div>';
  }

  if (savedSi.length === 0 && savedPt.length === 0 && !o.obiettivo) {
    html += `<div class="empty-state"><div class="empty-icon">📝</div><p>Nessuna sezione salvata ancora.<br>Compila e salva le sezioni per vederle qui.</p></div>`;
  }

  html += `<div style="margin-top:40px;padding-top:16px;border-top:1px solid var(--border);text-align:center;color:var(--text-light);font-size:11px">
    Verbale generato con Site Insight — ${new Date().toLocaleDateString('it-IT')}
  </div></div>`;

  el.innerHTML = html;
}

// ===========================================================
// PDF EXPORT
// ===========================================================
function updateExportInfo() {
  const si = Object.values(state.siteInspection).filter(v => v.saved).length;
  const pt = Object.values(state.plantTests).filter(v => v.saved).length;
  document.getElementById('export-info').innerHTML =
    `Il PDF includerà: <strong>${si}</strong> sezioni Site Inspection e <strong>${pt}</strong> sezioni Plant Tests.`;
}

function generatePDF() {
  const { jsPDF } = window.jspdf;
  if (!jsPDF) { showToast('jsPDF not available', 'error'); return; }

  const doc     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const l       = state.location;
  const o       = state.overview;
  const savedSi = SI_SECTIONS.filter(s => state.siteInspection[s.id]?.saved);
  const savedPt = PT_SECTIONS.filter(s => state.plantTests[s.id]?.saved);

  const pageW = 210, margin = 18, contentW = pageW - margin * 2;
  let y = margin;
  const lineH = 6;

  function checkPage(needed = 10) {
    if (y + needed > 280) { doc.addPage(); y = margin; }
  }

  function drawHeader() {
    doc.setFillColor(15, 39, 68);
    doc.rect(0, 0, pageW, 16, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11); doc.setFont('helvetica', 'bold');
    doc.text('VERBALE DI SOPRALLUOGO ANTINCENDIO', margin, 10);
    doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.text('Site Insight', pageW - margin, 10, { align: 'right' });
    doc.setTextColor(30, 41, 59);
    y = 24;
  }

  function sectionTitle(title) {
    checkPage(14);
    doc.setFillColor(15, 39, 68);
    doc.rect(margin, y, contentW, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9); doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), margin + 4, y + 5.5);
    doc.setTextColor(30, 41, 59);
    y += 12;
  }

  function macroTitle(title) {
    checkPage(10);
    doc.setFillColor(37, 99, 235);
    doc.rect(margin, y, contentW, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), margin + 4, y + 4.8);
    doc.setTextColor(30, 41, 59);
    y += 10;
  }

  function subTitle(title) {
    checkPage(10);
    doc.setFontSize(9); doc.setFont('helvetica', 'bold');
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
    doc.rect(margin, y - 3, contentW, 6.5, 'F');
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(26, 58, 92);
    doc.text(label, margin + 3, y + 1);
    doc.setTextColor(30, 41, 59);
    y += 8;
  }

  function kv(key, value) {
    if (!value) return;
    checkPage(8);
    doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    doc.text(key + ':', margin, y);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(String(value), contentW - 52);
    doc.text(lines, margin + 52, y);
    y += lines.length * lineH;
  }

  function tableRow(cols, widths, isHeader = false) {
    checkPage(8);
    doc.setFillColor(isHeader ? 15 : 248, isHeader ? 39 : 250, isHeader ? 68 : 252);
    doc.rect(margin, y - 4, contentW, 7, 'F');
    let x = margin;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
    doc.setTextColor(isHeader ? 255 : 30, isHeader ? 255 : 41, isHeader ? 255 : 59);
    cols.forEach((col, i) => {
      const txt = doc.splitTextToSize(String(col || ''), widths[i] - 3);
      doc.text(txt[0] || '', x + 2, y);
      x += widths[i];
    });
    doc.setTextColor(30, 41, 59);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 3, margin + contentW, y + 3);
    y += 7;
  }

  // Build PDF
  drawHeader();
  doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 39, 68);
  doc.text('VERBALE DI SOPRALLUOGO ANTINCENDIO', pageW / 2, y, { align: 'center' });
  y += 7;
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139);
  doc.text(`${l.verbale || 'N/A'}  |  ${l.date || ''}`, pageW / 2, y, { align: 'center' });
  doc.setTextColor(30, 41, 59);
  y += 12;

  sectionTitle('1. Location & Participants');
  kv('Data', l.date); kv('N. Verbale', l.verbale); kv('N. Sopralluogo', l.nrSopralluogo);
  kv('Luogo', l.luogo); kv('Tipo sopralluogo', l.tipo); kv('Committente', l.cliente);
  if (l.desc) kv('Attività', l.desc);
  y += 4;
  if (state.participants.length > 0) {
    subTitle('Partecipanti');
    const w = [55, 42, 50, 27];
    tableRow(['Nome', 'Ruolo', 'Azienda', 'Email'], w, true);
    state.participants.forEach(p => tableRow([p.nome, p.ruolo, p.azienda, p.email], w));
    y += 4;
  }

  if (o.obiettivo || o.note) {
    sectionTitle('2. Inspection Overview');
    if (o.obiettivo)   kv('Obiettivo', o.obiettivo);
    if (o.valutazione) kv('Valutazione', o.valutazione);
    if (o.priorita)    kv('Priorità', o.priorita);
    if (o.note)        kv('Note', o.note);
    if (o.docs)        kv('Documentazione', o.docs);
    y += 4;
  }

  if (savedSi.length > 0) {
    sectionTitle('3. Site Inspection');
    SI_MACROS.forEach(macro => {
      const macroSecs = savedSi.filter(s => s.macro === macro);
      if (!macroSecs.length) return;
      macroTitle(macro);
      macroSecs.forEach(s => {
        const d = state.siteInspection[s.id];
        checkPage(12);
        subTitle(s.label);
        if (d.nonPresente) {
          checkPage(8);
          doc.setFontSize(8); doc.setFont('helvetica', 'italic'); doc.setTextColor(180, 30, 30);
          doc.text('✕ Non presente in questa sede', margin + 2, y);
          doc.setTextColor(30, 41, 59); doc.setFont('helvetica', 'normal');
          y += 8;
          return;
        }
        d.floors.forEach((fl, fi) => {
          const fLabel = fl.floorLabel || fl.areaCategory || `Piano ${fi + 1}`;
          floorRow(fLabel + (fl.areaCategory && fl.floorLabel ? ' — ' + fl.areaCategory : ''));
          if (fl.comments) kv('Commenti', fl.comments);
          if (fl.notes)    kv('Note', fl.notes);
          if (fl.riverifica) {
            checkPage(8);
            doc.setFillColor(254, 243, 199);
            doc.rect(margin, y - 4, contentW, 7, 'F');
            doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(146, 64, 14);
            doc.text('ATTENZIONE: NECESSARIA RIVERIFICA', margin + 4, y);
            doc.setTextColor(30, 41, 59);
            y += 8;
          }
          if (fl.floorplanPins.length > 0) {
            kv('Pin planimetria', fl.floorplanPins.map((p, i) => `(${i+1}) ${p.note || '—'}`).join(', '));
          }
          if (fl.photos.length > 0) {
            checkPage(10);
            doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.text('Foto:', margin, y); y += 6;
            const w = [36, 22, 28, 88];
            tableRow(['Codice', 'Pin rif.', 'Annot.', 'Descrizione'], w, true);
            fl.photos.forEach(p => {
              const pinLabel = (p.fpPinRef !== null && p.fpPinRef !== undefined)
                ? `Pin ${p.fpPinRef + 1}${fl.floorplanPins[p.fpPinRef]?.note ? ' · ' + fl.floorplanPins[p.fpPinRef].note.substring(0, 18) : ''}`
                : '—';
              tableRow([p.code, pinLabel, p.pins.length ? p.pins.length + ' pin' : '—', p.note], w);
            });
          }
          y += 3;
        });
        y += 4;
      });
    });
  }

  if (savedPt.length > 0) {
    sectionTitle('4. Plant Tests');
    savedPt.forEach((s, idx) => {
      const d = state.plantTests[s.id];
      checkPage(12);
      subTitle(`${idx + 1}. ${s.label}`);
      const w = [24, 28, 38, 34, 50];
      tableRow(['Test', 'Piano', 'Localizzazione', 'Attivazione', 'Risultati'], w, true);
      d.tests.forEach(t => tableRow([t.test, t.piano, t.localizzazione, t.tipoAttivazione, t.risultati], w));
      y += 4;
    });
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(148, 163, 184);
    doc.text(`Pagina ${i} di ${pageCount}  |  ${l.verbale || ''}  |  Site Insight`, pageW / 2, 293, { align: 'center' });
  }

  const filename = `Verbale_${(l.verbale || 'sopralluogo').replace(/[^a-zA-Z0-9\-_]/g, '_')}.pdf`;
  doc.save(filename);
  showToast('PDF generated ✓', 'success');
}

// ===========================================================
// HISTORY PAGE
// ===========================================================
function renderHistoryPage() {
  const el = document.getElementById('history-content');
  if (!el) return;

  const sorted = [...state.versions].sort((a, b) => b.versionNum - a.versionNum);

  const headerHtml = `
    <div class="section-header">
      <div>
        <h2>Storico Versioni</h2>
        <p>${state.projectName || ''}${sorted.length ? ` — ${sorted.length} versione${sorted.length !== 1 ? 'i' : 'e'} salvata${sorted.length !== 1 ? 'e' : ''}` : ' — nessuna versione salvata'}</p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-secondary btn-sm" onclick="importProject()">Importa JSON</button>
        <button class="btn btn-outline btn-sm" onclick="exportProject()">Esporta JSON</button>
        <button class="btn btn-primary btn-sm" onclick="commitVersion()">Salva versione corrente</button>
        <button class="btn btn-primary" onclick="nuovoSopralluogo()">+ Nuovo Sopralluogo</button>
      </div>
    </div>`;

  if (!sorted.length) {
    el.innerHTML = headerHtml + `
      <div class="empty-state">
        <div class="empty-icon"></div>
        <p>Nessuna versione salvata.<br>Usa "Salva versione corrente" per creare il primo snapshot.</p>
      </div>`;
    return;
  }

  const cardsHtml = sorted.map((v, idx) => {
    const isCurrent = v.versionNum === state.currentVersionNum;
    const d = new Date(v.createdAt);
    const dateStr = d.toLocaleDateString('it-IT', { day:'2-digit', month:'short', year:'numeric' });
    const timeStr = d.toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit' });
    const savedSi = Object.values(v.siteInspection || {}).filter(s => s.saved).length;
    const savedPt = Object.values(v.plantTests     || {}).filter(s => s.saved).length;
    const valut   = v.overview?.valutazione || '';
    const valClass= valut === 'Conforme' ? 'valut-ok' : valut === 'Non conforme' ? 'valut-ko' : 'valut-mid';

    // diff with previous (older) version
    const olderV = sorted[idx + 1]; // sorted desc, so idx+1 = older
    const diffHtml = olderV ? renderVersionDiffHtml(olderV, v) : '';

    return `
      <div class="version-card${isCurrent ? ' current' : ''}">
        <div class="version-card-header">
          <div class="version-num">v${v.versionNum}</div>
          <div class="version-meta">
            <div class="version-verbale">${v.verbale || '—'}</div>
            <div class="version-date">${dateStr} ${timeStr} · ${v.location?.tipo || '—'}</div>
            <div class="version-stats">
              <span>${savedSi} sezioni SI</span>
              <span>${savedPt} test PT</span>
              ${valut ? `<span class="version-valut ${valClass}">${valut}</span>` : ''}
            </div>
          </div>
          <div class="version-actions">
            ${isCurrent
              ? `<span class="version-current-badge">Corrente</span>`
              : `<button class="btn btn-secondary btn-sm" onclick="loadVersion(${v.versionNum})">Carica</button>`}
          </div>
        </div>
        ${diffHtml}
      </div>`;
  }).join('');

  el.innerHTML = headerHtml + `<div class="version-list">${cardsHtml}</div>`;
}

function renderVersionDiffHtml(oldV, newV) {
  const rows = [];

  SI_SECTIONS.forEach(s => {
    const o   = oldV.siteInspection?.[s.id];
    const n   = newV.siteInspection?.[s.id];
    const oSaved = !!o?.saved;
    const nSaved = !!n?.saved;
    const oRiv   = o?.floors?.some(f => f.riverifica) ?? false;
    const nRiv   = n?.floors?.some(f => f.riverifica) ?? false;
    const oFloors= o?.floors?.length ?? 0;
    const nFloors= n?.floors?.length ?? 0;

    if (!oSaved && !nSaved) return;

    let status, note;
    if (!oSaved && nSaved)          { status = 'new';       note = 'Aggiunto'; }
    else if (oSaved && !nSaved)     { status = 'removed';   note = 'Rimosso'; }
    else if (oRiv && !nRiv)         { status = 'improved';  note = 'Riverifica risolta'; }
    else if (!oRiv && nRiv)         { status = 'warning';   note = 'Riverifica richiesta'; }
    else if (nFloors > oFloors)     { status = 'expanded';  note = `+${nFloors - oFloors} piano/zona`; }
    else                            { status = 'unchanged'; note = 'Invariato'; }

    rows.push({ label: s.label, macro: s.macro, status, note });
  });

  if (!rows.length) return '';

  const changed = rows.filter(r => r.status !== 'unchanged');
  if (!changed.length) {
    return `<div class="version-diff"><span class="diff-no-change">Nessuna variazione rispetto alla versione precedente</span></div>`;
  }

  return `
    <div class="version-diff">
      <div class="version-diff-title">Variazioni rispetto a v${oldV.versionNum}</div>
      <div class="version-diff-grid">
        ${changed.map(r => `
          <div class="diff-item diff-${r.status}">
            <span class="diff-label">${r.label}</span>
            <span class="diff-note">${r.note}</span>
          </div>`).join('')}
      </div>
    </div>`;
}

// ===========================================================
// WORD EXPORT
// ===========================================================
async function generateWord() {
  if (!window.docx) { showToast('Word library not available', 'error'); return; }

  const {
    Document, Paragraph, TextRun, Table, TableRow, TableCell,
    HeadingLevel, AlignmentType, WidthType, ShadingType, Packer,
  } = window.docx;

  const l       = state.location;
  const o       = state.overview;
  const savedSi = SI_SECTIONS.filter(s => state.siteInspection[s.id]?.saved);
  const savedPt = PT_SECTIONS.filter(s => state.plantTests[s.id]?.saved);

  // ── helpers ──────────────────────────────────────────────
  const sp = (before = 0, after = 80) => ({ spacing: { before, after } });

  function kv(key, value) {
    if (!value) return null;
    return new Paragraph({
      ...sp(0, 60),
      children: [
        new TextRun({ text: key + ': ', bold: true, size: 21 }),
        new TextRun({ text: String(value), size: 21 }),
      ],
    });
  }

  function pushKV(arr, pairs) {
    pairs.forEach(([k, v]) => { const p = kv(k, v); if (p) arr.push(p); });
  }

  function makeTable(headers, rows, colPcts) {
    const mkCell = (text, isHeader = false) => new TableCell({
      shading: isHeader ? { fill: '0B1A2E', type: ShadingType.CLEAR } : undefined,
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      children: [new Paragraph({
        children: [new TextRun({
          text: String(text ?? ''),
          size: isHeader ? 19 : 20,
          bold: isHeader,
          color: isHeader ? 'FFFFFF' : '0B1A2E',
        })],
      })],
    });

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: headers.map(h => mkCell(h, true)),
        }),
        ...rows.map(row => new TableRow({
          children: row.map(cell => mkCell(cell)),
        })),
      ],
    });
  }

  function sectionRule() {
    return new Paragraph({
      border: { bottom: { style: 'single', size: 6, color: 'B8922A', space: 4 } },
      ...sp(320, 120),
    });
  }

  // ── document children ─────────────────────────────────────
  const children = [];

  // Title
  children.push(new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    ...sp(0, 80),
    children: [new TextRun({ text: 'VERBALE DI SOPRALLUOGO ANTINCENDIO', size: 40, bold: true, color: '0B1A2E' })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    ...sp(0, 400),
    children: [new TextRun({ text: `${l.verbale || 'N/A'}  —  ${l.date || ''}`, size: 22, color: '8899B0' })],
  }));

  // 1. Location & Participants
  children.push(sectionRule());
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, ...sp(0, 120),
    children: [new TextRun({ text: '1. Location & Participants', size: 28, bold: true, color: '0B1A2E' })],
  }));
  pushKV(children, [
    ['Data', l.date], ['N. Verbale', l.verbale], ['N. Sopralluogo', l.nrSopralluogo],
    ['Luogo', l.luogo], ['Tipo', l.tipo], ['Committente', l.cliente], ['Attività', l.desc],
  ]);
  if (state.participants.length > 0) {
    children.push(new Paragraph({
      ...sp(160, 60),
      children: [new TextRun({ text: 'Partecipanti', bold: true, size: 22, color: '4C5E74' })],
    }));
    children.push(makeTable(
      ['Nome', 'Ruolo', 'Azienda', 'Email'],
      state.participants.map(p => [p.nome, p.ruolo, p.azienda, p.email]),
    ));
  }

  // 2. Inspection Overview
  if (o.obiettivo || o.note || o.valutazione) {
    children.push(sectionRule());
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, ...sp(0, 120),
      children: [new TextRun({ text: '2. Inspection Overview', size: 28, bold: true, color: '0B1A2E' })],
    }));
    pushKV(children, [
      ['Obiettivo', o.obiettivo], ['Valutazione', o.valutazione],
      ['Priorità', o.priorita], ['Note', o.note], ['Documentazione', o.docs],
    ]);
  }

  // 3. Site Inspection
  if (savedSi.length > 0) {
    children.push(sectionRule());
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, ...sp(0, 120),
      children: [new TextRun({ text: '3. Site Inspection', size: 28, bold: true, color: '0B1A2E' })],
    }));

    SI_MACROS.forEach(macro => {
      const macroSecs = savedSi.filter(s => s.macro === macro);
      if (!macroSecs.length) return;

      // Macro heading
      children.push(new Paragraph({
        ...sp(240, 80),
        children: [new TextRun({ text: macro.toUpperCase(), size: 22, bold: true, color: 'B8922A', allCaps: true })],
        border: { bottom: { style: 'single', size: 4, color: 'C8D4E6', space: 3 } },
      }));

      macroSecs.forEach(s => {
        const d = state.siteInspection[s.id];

        // Section name
        children.push(new Paragraph({
          ...sp(200, 80),
          children: [new TextRun({ text: s.label, size: 24, bold: true, color: '102038' })],
        }));

        if (d.nonPresente) {
          children.push(new Paragraph({
            ...sp(60, 120),
            children: [new TextRun({ text: '✕ Non presente in questa sede', size: 20, italics: true, color: 'B41E1E' })],
          }));
          return;
        }

        d.floors.forEach((fl, fi) => {
          const fLabel = fl.floorLabel || fl.areaCategory || `Piano ${fi + 1}`;
          const fSub   = fl.areaCategory && fl.floorLabel ? ' — ' + fl.areaCategory : '';

          // Floor label pill
          children.push(new Paragraph({
            ...sp(100, 60),
            children: [new TextRun({ text: `  ${fLabel}${fSub}  `, size: 20, bold: true, color: 'B8922A',
              shading: { type: ShadingType.CLEAR, fill: 'FAF5E8' },
            })],
          }));

          pushKV(children, [['Commenti', fl.comments], ['Note', fl.notes]]);

          if (fl.riverifica) {
            children.push(new Paragraph({
              ...sp(60, 60),
              children: [new TextRun({ text: 'ATTENZIONE: NECESSARIA RIVERIFICA', size: 21, bold: true, color: 'C07A10' })],
            }));
          }
          if (fl.floorplanPins.length > 0) {
            children.push(new Paragraph({
              ...sp(40, 60),
              children: [
                new TextRun({ text: 'Pin planimetria: ', bold: true, size: 20, color: '4C5E74' }),
                new TextRun({ text: fl.floorplanPins.map((p, i) => `(${i + 1}) ${p.note || '—'}`).join(' · '), size: 20, color: '8899B0' }),
              ],
            }));
          }
          if (fl.photos.length > 0) {
            children.push(new Paragraph({
              ...sp(80, 40),
              children: [new TextRun({ text: 'Foto', bold: true, size: 20, color: '4C5E74' })],
            }));
            children.push(makeTable(
              ['Codice', 'Pin rif.', 'Descrizione', 'Annotazioni'],
              fl.photos.map(p => {
                const pinLabel = (p.fpPinRef !== null && p.fpPinRef !== undefined)
                  ? `Pin ${p.fpPinRef + 1}${fl.floorplanPins[p.fpPinRef]?.note ? ' · ' + fl.floorplanPins[p.fpPinRef].note : ''}`
                  : '—';
                return [
                  p.code, pinLabel, p.note,
                  p.pins.length ? p.pins.map((pp, pi) => `(${pi + 1}) ${pp.note || '—'}`).join(', ') : '—',
                ];
              }),
            ));
          }
        });
      });
    });
  }

  // 4. Plant Tests
  if (savedPt.length > 0) {
    children.push(sectionRule());
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, ...sp(0, 120),
      children: [new TextRun({ text: '4. Plant Tests', size: 28, bold: true, color: '0B1A2E' })],
    }));

    savedPt.forEach(s => {
      const d = state.plantTests[s.id];
      children.push(new Paragraph({
        ...sp(180, 60),
        children: [new TextRun({ text: s.label, size: 22, bold: true, color: '102038' })],
      }));
      children.push(makeTable(
        ['Test', 'Piano', 'Localizzazione', 'Attivazione', 'Risultati'],
        d.tests.map(t => [t.test, t.piano, t.localizzazione, t.tipoAttivazione, t.risultati]),
      ));
    });
  }

  // Footer
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    ...sp(600, 0),
    children: [new TextRun({
      text: `Documento generato con Site Insight — ${new Date().toLocaleDateString('it-IT')}`,
      size: 18, color: '8899B0',
    })],
  }));

  // ── build & save ─────────────────────────────────────────
  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } },
      },
      children,
    }],
  });

  try {
    const blob = await Packer.toBlob(doc);
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `Verbale_${(l.verbale || 'sopralluogo').replace(/[^a-zA-Z0-9\-_]/g, '_')}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Word document generated ✓', 'success');
  } catch (err) {
    console.error(err);
    showToast('Error generating Word document', 'error');
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
