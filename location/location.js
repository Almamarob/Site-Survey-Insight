
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

