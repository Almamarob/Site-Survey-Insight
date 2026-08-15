// ===========================================================
// PREVIEW LIGHTBOX
// ===========================================================
function previewOpenLightbox(src) {
  document.getElementById("preview-lightbox-img").src = src;
  document.getElementById("preview-lightbox").classList.add("open");
}

function previewCloseLightbox() {
  document.getElementById("preview-lightbox").classList.remove("open");
  document.getElementById("preview-lightbox-img").src = "";
}

document.addEventListener("keydown", e => { if (e.key === "Escape") previewCloseLightbox(); });

// ===========================================================
// BADGES
// ===========================================================
function updateBadges() {
  const floors = state.siteInspection.floors || [];
  const savedFloors = floors.filter(fl => fl.savedFloor).length;
  document.getElementById("badge-site").textContent = savedFloors;
  const savedPtSections = PT_SECTIONS.filter(s => state.plantTests[s.id]?.saved);
  const ptBadgeEl = document.getElementById("badge-plant");
  const anyPtFailed = savedPtSections.some(s => _ptSectionOutcome(s.id) === "co-ko");
  ptBadgeEl.textContent = anyPtFailed ? "✗" : savedPtSections.length;
  ptBadgeEl.style.color = anyPtFailed ? "var(--danger)" : "";
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
      html += `<div class="preview-floor-block">`;
      html += `<div class="preview-kv">`;
      if (fl.comments) html += `<span class="k">Comments:</span><span class="v">${fl.comments}</span>`;
      if (fl.notes) html += `<span class="k">Notes:</span><span class="v">${fl.notes}</span>`;
      if (fl.riverifica) html += `<span class="k">Re-inspection:</span><span class="v riverifica-flag">⚠️ RE-INSPECTION REQUIRED</span>`;
      html += `</div>`;

      // Floor plan
      if (fl.floorplanDataUrl) {
        html += `<img src="${fl.floorplanDataUrl}" style="width:100%;max-height:300px;object-fit:contain;border-radius:6px;margin:8px 0;display:block;background:#0d1b2a;cursor:zoom-in" onclick="previewOpenLightbox(this.src)">`;
      }
      if (fl.floorplanPins.length > 0) {
        html += `<div class="preview-pins-summary">Floor plan pins: ${fl.floorplanPins.map((p, i) => {
          const linked = fl.photos.filter(ph => ph.fpPinRef === i).map(ph => ph.code).join(", ");
          return `(${i + 1}) ${p.note || "—"}${linked ? " → " + linked : ""}`;
        }).join(" · ")}</div>`;
      }

      // Floor photos
      if (fl.photos.length > 0) {
        html += `<div class="preview-photo-grid">`;
        fl.photos.forEach(p => {
          if (!p.dataUrl) return;
          const pinLabel = p.fpPinRef !== null && p.fpPinRef !== undefined
            ? `⬡ ${p.fpPinRef + 1} · ${fl.floorplanPins[p.fpPinRef]?.note || ""}` : null;
          html += `<div class="preview-photo-card">
            <img src="${p.dataUrl}" class="preview-photo-img" onclick="previewOpenLightbox(this.src)">
            <div class="preview-photo-meta">
              <span class="preview-photo-code">${p.code}</span>
              ${pinLabel ? `<span class="preview-photo-pin">${pinLabel}</span>` : ""}
              <span class="preview-photo-note">${p.note}</span>
            </div>
          </div>`;
        });
        html += `</div>`;
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
            const checkPhotos = (check.photos || []).filter(p => p.dataUrl);
            if (checkPhotos.length > 0) {
              html += `<div class="preview-photo-grid">`;
              checkPhotos.forEach(p => {
                html += `<div class="preview-photo-card">
                  <img src="${p.dataUrl}" class="preview-photo-img" onclick="previewOpenLightbox(this.src)">
                  <div class="preview-photo-meta">
                    <span class="preview-photo-code">${p.code}</span>
                    <span class="preview-photo-note">${p.note}</span>
                  </div>
                </div>`;
              });
              html += `</div>`;
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
          <tr><th>Test Code</th><th>Floor</th><th>Location</th><th>Activation</th><th>Expected Results</th><th>Results</th><th>Status</th><th>Photo</th></tr>
          ${d.tests.map(t => {
            const statusCls = t.status === "Passed" ? "color:var(--success);font-weight:600"
              : t.status === "Failed" ? "color:var(--danger);font-weight:600" : "";
            return `<tr>
              <td>${t.test}</td><td>${t.piano}</td><td>${t.localizzazione}</td>
              <td>${t.tipoAttivazione}</td><td>${t.expectedResults||"—"}</td>
              <td>${t.risultati}</td>
              <td style="${statusCls}">${t.status||"—"}</td>
              <td>${t.photoDataUrl
                ? `<img src="${t.photoDataUrl}" style="width:60px;height:42px;object-fit:cover;border-radius:4px;vertical-align:middle"> ${t.photoEvidence ? `<span style="font-size:10px">${t.photoEvidence}</span>` : ""}`
                : (t.photoEvidence || "—")}</td>
            </tr>`;
          }).join("")}
        </table>`;

      // Floor groups: floor plans + group photos
      const fgs = d.floorGroups || {};
      const fgKeys = Object.keys(fgs).filter(k => fgs[k].floorplanDataUrl || fgs[k].photos.some(p => p.dataUrl));
      if (fgKeys.length > 0) {
        html += `<div style="margin-top:12px"><strong style="font-size:12px;color:var(--text-2)">Floor Plans &amp; Site Photos</strong></div>`;
        fgKeys.forEach(gName => {
          const g = fgs[gName];
          html += `<div style="margin-top:8px;padding:8px;background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:6px">
            <div style="font-size:11px;font-weight:700;color:var(--accent);margin-bottom:6px">${gName}</div>`;
          if (g.floorplanDataUrl) {
            html += `<img src="${g.floorplanDataUrl}" style="width:100%;max-height:260px;object-fit:contain;border-radius:5px;display:block;margin-bottom:8px">`;
          }
          const gPhotos = g.photos.filter(p => p.dataUrl);
          if (gPhotos.length > 0) {
            html += `<div style="display:flex;flex-wrap:wrap;gap:8px">`;
            gPhotos.forEach(p => {
              html += `<div style="text-align:center">
                <img src="${p.dataUrl}" style="width:130px;height:90px;object-fit:cover;border-radius:5px;display:block">
                ${p.note ? `<span style="font-size:10px;color:var(--text-3)">${p.note}</span>` : ""}
              </div>`;
            });
            html += `</div>`;
          }
          html += `</div>`;
        });
      }

      // Individual test evidence photos
      const testPhotos = (d.tests || []).filter(t => t.photoDataUrl);
      if (testPhotos.length > 0) {
        html += `<div style="margin-top:12px"><strong style="font-size:12px;color:var(--text-2)">Test Evidence Photos</strong></div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">`;
        testPhotos.forEach(t => {
          html += `<div style="text-align:center">
            <img src="${t.photoDataUrl}" style="width:130px;height:90px;object-fit:cover;border-radius:5px;display:block">
            <span style="font-size:10px;color:var(--text-3)">${t.test}${t.photoEvidence ? " — " + t.photoEvidence : ""}</span>
          </div>`;
        });
        html += `</div>`;
      }
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

function _imgFmt(dataUrl) {
  if (!dataUrl) return null;
  if (dataUrl.includes("image/svg")) return null;
  if (dataUrl.includes("image/png")) return "PNG";
  return "JPEG";
}

// Rasterise an SVG data-URL to PNG via an off-screen canvas.
// Always draws at explicit pixel dimensions so the result is never blank.
function _rasterizeSvg(svgUrl, fallbackW = 800, fallbackH = 600) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const w = (img.naturalWidth > 0 ? img.naturalWidth : fallbackW);
      const h = (img.naturalHeight > 0 ? img.naturalHeight : fallbackH);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      try {
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const png = canvas.toDataURL('image/png');
        // A blank canvas produces a tiny ~68-byte base64 string — treat as failure
        resolve(png.length > 200 ? png : null);
      } catch (e) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = svgUrl;
  });
}

// Build a Map<originalUrl, exportableUrl> for every image in floors + PT sections.
// SVG urls are converted to PNG; other formats pass through unchanged.
async function _buildImageMap(floors, ptSects) {
  const map = new Map();
  const jobs = [];

  const register = url => {
    if (!url || map.has(url)) return;
    if (!url.includes('image/svg')) { map.set(url, url); return; }
    jobs.push(_rasterizeSvg(url).then(png => map.set(url, png || null)));
  };

  for (const fl of floors) {
    register(fl.floorplanDataUrl);
    (fl.photos || []).forEach(p => register(p.dataUrl));
    Object.values(fl.checks || {}).forEach(c =>
      (c.photos || []).forEach(p => register(p.dataUrl)));
  }
  for (const s of ptSects) {
    const d = state.plantTests[s.id];
    if (!d) continue;
    Object.values(d.floorGroups || {}).forEach(g => {
      register(g.floorplanDataUrl);
      (g.photos || []).forEach(p => register(p.dataUrl));
    });
    (d.tests || []).forEach(t => register(t.photoDataUrl));
  }

  await Promise.all(jobs);
  return map;
}

async function generatePDF() {
  const { jsPDF } = window.jspdf;
  if (!jsPDF) {
    showToast("jsPDF not available", "error");
    return;
  }

  const l = state.location;
  const o = state.overview;
  const allFloors = state.siteInspection.floors || [];
  const savedFloors = allFloors.filter(f => f.savedFloor);
  const savedPt = PT_SECTIONS.filter(s => state.plantTests[s.id]?.saved);

  // Pre-convert all images (SVG → PNG via canvas) before building the PDF
  showToast("Preparing images…", "info");
  const imgMap = await _buildImageMap(savedFloors, savedPt);
  const px = url => imgMap.get(url) || null; // resolved exportable url

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

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

  function safeAddImage(dataUrl, fmt, x, yPos, w, h) {
    try { doc.addImage(dataUrl, fmt, x, yPos, w, h); } catch (e) { console.error("PDF addImage failed:", e); }
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
      // Floor plan image
      const fpUrl = px(fl.floorplanDataUrl);
      if (fpUrl) {
        const fmt = _imgFmt(fpUrl) || "PNG";
        const imgW = contentW * 0.75; const imgH = imgW * (520 / 800);
        checkPage(imgH + 10);
        doc.setFontSize(7); doc.setFont("helvetica", "bold"); doc.setTextColor(26, 58, 92);
        doc.text("Floor Plan", margin, y); doc.setTextColor(30, 41, 59); y += 4;
        safeAddImage(fpUrl, fmt, margin, y, imgW, imgH);
        y += imgH + 6;
      }
      if (fl.floorplanPins.length > 0) {
        kv("Floor plan pins", fl.floorplanPins.map((p, i) => `(${i + 1}) ${p.note || "—"}`).join(", "));
      }
      if (fl.photos.length > 0) {
        const thumbW = 52; const thumbH = 36; const gap = 4;
        checkPage(thumbH + 20);
        doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(26, 58, 92);
        doc.text("Floor Photos", margin, y); doc.setTextColor(30, 41, 59); y += 6;
        let xp = margin;
        fl.photos.forEach(p => {
          const url = px(p.dataUrl); if (!url) return;
          const fmt = _imgFmt(url) || "PNG";
          if (xp + thumbW > margin + contentW) { xp = margin; y += thumbH + 14; checkPage(thumbH + 14); }
          safeAddImage(url, fmt, xp, y, thumbW, thumbH);
          doc.setFontSize(6); doc.setFont("helvetica", "bold");
          doc.text(p.code || "", xp, y + thumbH + 4);
          doc.setFont("helvetica", "normal");
          doc.text(String(p.note || "").substring(0, 28), xp, y + thumbH + 8);
          xp += thumbW + gap;
        });
        y += thumbH + 14;
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
              const thumbW = 52; const thumbH = 36; const gap = 4;
              checkPage(thumbH + 14);
              let xc = margin;
              check.photos.forEach(p => {
                const url = px(p.dataUrl); if (!url) return;
                const fmt = _imgFmt(url) || "PNG";
                if (xc + thumbW > margin + contentW) { xc = margin; y += thumbH + 14; checkPage(thumbH + 14); }
                safeAddImage(url, fmt, xc, y, thumbW, thumbH);
                doc.setFontSize(6); doc.setFont("helvetica", "bold");
                doc.text(p.code || "", xc, y + thumbH + 4);
                doc.setFont("helvetica", "normal");
                doc.text(String(p.note || "").substring(0, 28), xc, y + thumbH + 8);
                xc += thumbW + gap;
              });
              y += thumbH + 14;
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

      // Floor groups: floor plans + photos
      const fgs = d.floorGroups || {};
      Object.entries(fgs).forEach(([gName, g]) => {
        const fpUrl = px(g.floorplanDataUrl);
        if (fpUrl) {
          checkPage(80);
          doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(26, 58, 92);
          doc.text(`Floor Plan — ${gName}`, margin, y); doc.setTextColor(30, 41, 59); y += 5;
          const imgW = contentW * 0.75; const imgH = imgW * (520 / 800);
          checkPage(imgH + 8);
          safeAddImage(fpUrl, _imgFmt(fpUrl) || "PNG", margin, y, imgW, imgH);
          y += imgH + 6;
        }
        const resolvedPhotos = g.photos.map(ph => ({ ph, url: px(ph.dataUrl) })).filter(x => x.url);
        if (resolvedPhotos.length > 0) {
          checkPage(50);
          doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(26, 58, 92);
          doc.text(`Photos — ${gName}`, margin, y); doc.setTextColor(30, 41, 59); y += 5;
          const thumbW = 48; const thumbH = 34; const gap = 4;
          let xp = margin;
          resolvedPhotos.forEach(({ ph, url }) => {
            if (xp + thumbW > margin + contentW) { xp = margin; y += thumbH + 14; checkPage(thumbH + 14); }
            safeAddImage(url, _imgFmt(url) || "PNG", xp, y, thumbW, thumbH);
            if (ph.note) {
              doc.setFontSize(6); doc.setFont("helvetica", "normal");
              doc.text(String(ph.note).substring(0, 28), xp, y + thumbH + 4);
            }
            xp += thumbW + gap;
          });
          y += thumbH + 14;
        }
      });

      // Individual test evidence photos
      const testPhotos = (d.tests || []).map(t => ({ t, url: px(t.photoDataUrl) })).filter(x => x.url);
      if (testPhotos.length > 0) {
        checkPage(50);
        doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(26, 58, 92);
        doc.text("Test Evidence Photos", margin, y); doc.setTextColor(30, 41, 59); y += 5;
        const thumbW = 48; const thumbH = 34; const gap = 4;
        let xtp = margin;
        testPhotos.forEach(({ t, url }) => {
          if (xtp + thumbW > margin + contentW) { xtp = margin; y += thumbH + 14; checkPage(thumbH + 14); }
          safeAddImage(url, _imgFmt(url) || "PNG", xtp, y, thumbW, thumbH);
          const label = [t.test, t.photoEvidence].filter(Boolean).join(" — ");
          doc.setFontSize(6); doc.setFont("helvetica", "normal");
          doc.text(String(label).substring(0, 28), xtp, y + thumbH + 4);
          xtp += thumbW + gap;
        });
        y += thumbH + 14;
      }

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
    ImageRun,
    Table,
    TableRow,
    TableCell,
    HeadingLevel,
    AlignmentType,
    WidthType,
    ShadingType,
    Packer,
  } = window.docx;

  function _dataUrlToUint8(dataUrl) {
    const base64 = dataUrl.split(",")[1];
    const binary = atob(base64);
    const arr = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
    return arr;
  }

  function _imgType(dataUrl) {
    if (!dataUrl) return null;
    if (dataUrl.includes("image/png")) return "png";
    if (dataUrl.includes("image/gif")) return "gif";
    return "jpg";
  }

  function addWordImage(dataUrl, w, h) {
    if (!dataUrl) return null;
    const type = _imgType(dataUrl);
    if (!type) return null;
    try {
      return new Paragraph({ children: [new ImageRun({ data: _dataUrlToUint8(dataUrl), transformation: { width: w, height: h }, type })] });
    } catch (e) { console.error("addWordImage failed:", e); return null; }
  }

  const l = state.location;
  const o = state.overview;
  const allFloorsW = state.siteInspection.floors || [];
  const savedFloorsW = allFloorsW.filter(f => f.savedFloor);
  const savedPt = PT_SECTIONS.filter(s => state.plantTests[s.id]?.saved);

  // Pre-convert SVG images to PNG
  const wImgMap = await _buildImageMap(savedFloorsW, savedPt);
  const wpx = url => wImgMap.get(url) || null;

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

      children.push(new Paragraph({
        ...sp(240, 80),
        children: [new TextRun({ text: `  ${fLabel}${fSub}  `, size: 24, bold: true, color: "B8922A", shading: { type: ShadingType.CLEAR, fill: "FAF5E8" } })],
      }));

      pushKV(children, [["Comments", fl.comments], ["Notes", fl.notes]]);

      if (fl.riverifica) {
        children.push(new Paragraph({ ...sp(60, 60), children: [new TextRun({ text: "⚠ RE-INSPECTION REQUIRED FOR THIS FLOOR", size: 21, bold: true, color: "C07A10" })] }));
      }

      // Floor plan image
      const wFpUrl = wpx(fl.floorplanDataUrl);
      if (wFpUrl) {
        children.push(new Paragraph({ ...sp(80, 20), children: [new TextRun({ text: "Floor Plan", bold: true, size: 20, color: "4C5E74" })] }));
        const fpImg = addWordImage(wFpUrl, 480, 312);
        if (fpImg) children.push(fpImg);
      }

      if (fl.floorplanPins.length > 0) {
        children.push(new Paragraph({ ...sp(40, 60), children: [
          new TextRun({ text: "Floor plan pins: ", bold: true, size: 20, color: "4C5E74" }),
          new TextRun({ text: fl.floorplanPins.map((p, i) => `(${i + 1}) ${p.note || "—"}`).join(" · "), size: 20, color: "8899B0" }),
        ]}));
      }

      // Floor photos with images
      if (fl.photos.length > 0) {
        children.push(new Paragraph({ ...sp(80, 40), children: [new TextRun({ text: "Floor Photos", bold: true, size: 20, color: "4C5E74" })] }));
        fl.photos.forEach(p => {
          children.push(new Paragraph({ ...sp(20, 10), children: [new TextRun({ text: `${p.code}  —  ${p.note}`, size: 18, bold: true, color: "4C5E74" })] }));
          const img = addWordImage(wpx(p.dataUrl), 220, 154);
          if (img) children.push(img);
        });
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
            check.photos.forEach(p => {
              children.push(new Paragraph({ ...sp(20, 10), children: [new TextRun({ text: `${p.code}  —  ${p.note}`, size: 18, bold: true, color: "4C5E74" })] }));
              const img = addWordImage(wpx(p.dataUrl), 200, 140);
              if (img) children.push(img);
            });
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
          children: [new TextRun({ text: s.label, size: 22, bold: true, color: "102038" })],
        }),
      );
      children.push(
        makeTable(
          ["Test Code", "Floor", "Location", "Activation", "Expected Results", "Results", "Status", "Photo Evidence"],
          d.tests.map((t) => [
            t.test, t.piano, t.localizzazione, t.tipoAttivazione,
            t.expectedResults || "—", t.risultati, t.status || "—", t.photoEvidence || "—",
          ]),
        ),
      );

      // Floor groups: floor plans + photos
      const fgs = d.floorGroups || {};
      Object.entries(fgs).forEach(([gName, g]) => {
        const wGfp = wpx(g.floorplanDataUrl);
        if (wGfp) {
          children.push(new Paragraph({ ...sp(120, 40), children: [new TextRun({ text: `Floor Plan — ${gName}`, size: 20, bold: true, color: "4C5E74" })] }));
          const img = addWordImage(wGfp, 450, 280);
          if (img) children.push(img);
        }
        g.photos.forEach(p => {
          const url = wpx(p.dataUrl); if (!url) return;
          const img = addWordImage(url, 200, 130);
          if (img) {
            children.push(img);
            if (p.note) children.push(new Paragraph({ ...sp(0, 40), children: [new TextRun({ text: p.note, size: 18, color: "8899B0" })] }));
          }
        });
      });

      // Individual test evidence photos
      const testPhotos = (d.tests || []).filter(t => wpx(t.photoDataUrl));
      if (testPhotos.length > 0) {
        children.push(new Paragraph({ ...sp(80, 40), children: [new TextRun({ text: "Test Evidence Photos", size: 20, bold: true, color: "4C5E74" })] }));
        testPhotos.forEach(t => {
          const label = [t.test, t.photoEvidence].filter(Boolean).join(" — ");
          children.push(new Paragraph({ ...sp(20, 10), children: [new TextRun({ text: label, size: 18, bold: true, color: "4C5E74" })] }));
          const img = addWordImage(wpx(t.photoDataUrl), 220, 150);
          if (img) children.push(img);
        });
      }
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

