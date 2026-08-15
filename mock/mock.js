function loadMock() {
  const today = new Date().toISOString().split("T")[0];
  state.location = {
    date: today,
    nrSopralluogo: "3",
    verbale: today.replace(/-/g, "") + "-XYZMAN-PI-003",
    luogo: "Via dell'Industria 12, 20090 Assago (MI)",
    tipo: "Periodic",
    cliente: "XYZ Manufacturing S.p.A.",
    desc: "Three-storey industrial facility with automated warehouse. Activity: manufacturing.",
  };
  state.projectName = state.location.verbale;
  document.getElementById("project-name-display").textContent = "— " + state.projectName;
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
  // ── SVG helper: converts SVG string to base64 data URL ────────
  const _b64 = svg => "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));

  // ── Floor plan blueprints ──────────────────────────────────────
  const fpGF = _b64(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520">
<rect width="800" height="520" fill="#0d1b2a"/>
<text x="400" y="20" fill="#2d5a7a" font-size="12" text-anchor="middle" font-family="Arial">GROUND FLOOR PLAN — ZONE A — Rev. 3/2023</text>
<rect x="30" y="30" width="740" height="458" fill="none" stroke="#3a7aaa" stroke-width="4" rx="2"/>
<line x1="262" y1="30" x2="262" y2="335" stroke="#3a7aaa" stroke-width="3"/>
<line x1="522" y1="30" x2="522" y2="205" stroke="#3a7aaa" stroke-width="3"/>
<line x1="262" y1="335" x2="770" y2="335" stroke="#3a7aaa" stroke-width="3"/>
<rect x="256" y="118" width="12" height="36" fill="#0d1b2a"/>
<path d="M258 118 A28 28 0 0 1 286 118" fill="none" stroke="#3a7aaa" stroke-width="1.5"/>
<rect x="516" y="98" width="12" height="32" fill="#0d1b2a"/>
<path d="M518 98 A28 28 0 0 1 546 98" fill="none" stroke="#3a7aaa" stroke-width="1.5"/>
<rect x="516" y="335" width="12" height="30" fill="#0d1b2a"/>
<path d="M518 335 A26 26 0 0 1 544 335" fill="none" stroke="#3a7aaa" stroke-width="1.5"/>
<rect x="118" y="26" width="64" height="8" fill="#0d1b2a"/>
<rect x="118" y="480" width="64" height="8" fill="#0d1b2a"/>
<text x="146" y="185" fill="#5aabcc" font-size="13" text-anchor="middle" font-family="Arial" font-weight="bold">ENTRANCE /</text>
<text x="146" y="202" fill="#5aabcc" font-size="13" text-anchor="middle" font-family="Arial" font-weight="bold">RECEPTION</text>
<text x="392" y="175" fill="#5aabcc" font-size="13" text-anchor="middle" font-family="Arial" font-weight="bold">OPEN OFFICE</text>
<text x="646" y="112" fill="#5aabcc" font-size="13" text-anchor="middle" font-family="Arial" font-weight="bold">WAREHOUSE</text>
<text x="500" y="408" fill="#5aabcc" font-size="13" text-anchor="middle" font-family="Arial" font-weight="bold">PRODUCTION AREA</text>
<circle cx="66" cy="188" r="8" fill="#cc3333"/><text x="66" y="193" fill="white" font-size="9" text-anchor="middle" font-family="Arial" font-weight="bold">FE</text>
<circle cx="372" cy="52" r="8" fill="#cc3333"/><text x="372" y="57" fill="white" font-size="9" text-anchor="middle" font-family="Arial" font-weight="bold">FE</text>
<circle cx="644" cy="52" r="8" fill="#cc3333"/><text x="644" y="57" fill="white" font-size="9" text-anchor="middle" font-family="Arial" font-weight="bold">FE</text>
<circle cx="400" cy="390" r="8" fill="#cc3333"/><text x="400" y="395" fill="white" font-size="9" text-anchor="middle" font-family="Arial" font-weight="bold">FE</text>
<circle cx="146" cy="58" r="7" fill="#c47a0a"/><text x="146" y="62" fill="white" font-size="8" text-anchor="middle" font-family="Arial">D</text>
<circle cx="392" cy="58" r="7" fill="#c47a0a"/><text x="392" y="62" fill="white" font-size="8" text-anchor="middle" font-family="Arial">D</text>
<circle cx="646" cy="130" r="7" fill="#c47a0a"/><text x="646" y="134" fill="white" font-size="8" text-anchor="middle" font-family="Arial">D</text>
<circle cx="500" cy="360" r="7" fill="#c47a0a"/><text x="500" y="364" fill="white" font-size="8" text-anchor="middle" font-family="Arial">D</text>
<rect x="114" y="26" width="68" height="12" fill="none" stroke="#22bb66" stroke-width="2" rx="1"/>
<text x="148" y="36" fill="#22bb66" font-size="9" text-anchor="middle" font-family="Arial" font-weight="bold">EXIT</text>
<rect x="114" y="480" width="68" height="12" fill="none" stroke="#22bb66" stroke-width="2" rx="1"/>
<text x="148" y="490" fill="#22bb66" font-size="9" text-anchor="middle" font-family="Arial" font-weight="bold">EXIT</text>
<text x="756" y="506" fill="#2d5a7a" font-size="12" text-anchor="middle" font-family="Arial">N ^</text>
<line x1="30" y1="30" x2="262" y2="30" stroke="#3a7aaa" stroke-width="4"/>
</svg>`);

  const fpFF = _b64(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520">
<rect width="800" height="520" fill="#0d1b2a"/>
<text x="400" y="20" fill="#2d5a7a" font-size="12" text-anchor="middle" font-family="Arial">FIRST FLOOR PLAN — ZONE B — Rev. 3/2023</text>
<rect x="30" y="30" width="740" height="458" fill="none" stroke="#3a7aaa" stroke-width="4" rx="2"/>
<line x1="30" y1="215" x2="770" y2="215" stroke="#3a7aaa" stroke-width="3"/>
<line x1="222" y1="30" x2="222" y2="215" stroke="#3a7aaa" stroke-width="3"/>
<line x1="442" y1="30" x2="442" y2="215" stroke="#3a7aaa" stroke-width="3"/>
<line x1="622" y1="30" x2="622" y2="215" stroke="#3a7aaa" stroke-width="3"/>
<line x1="312" y1="215" x2="312" y2="488" stroke="#3a7aaa" stroke-width="3"/>
<rect x="216" y="118" width="12" height="34" fill="#0d1b2a"/>
<path d="M218 118 A30 30 0 0 1 248 118" fill="none" stroke="#3a7aaa" stroke-width="1.5"/>
<rect x="436" y="118" width="12" height="34" fill="#0d1b2a"/>
<path d="M438 118 A30 30 0 0 1 468 118" fill="none" stroke="#3a7aaa" stroke-width="1.5"/>
<rect x="616" y="118" width="12" height="34" fill="#0d1b2a"/>
<path d="M618 118 A30 30 0 0 1 648 118" fill="none" stroke="#3a7aaa" stroke-width="1.5"/>
<rect x="302" y="325" width="20" height="12" fill="#0d1b2a"/>
<path d="M304 325 A16 16 0 0 1 320 325" fill="none" stroke="#3a7aaa" stroke-width="1.5"/>
<rect x="100" y="26" width="64" height="8" fill="#0d1b2a"/>
<rect x="100" y="480" width="64" height="8" fill="#0d1b2a"/>
<text x="126" y="120" fill="#5aabcc" font-size="12" text-anchor="middle" font-family="Arial" font-weight="bold">MEETING</text>
<text x="126" y="136" fill="#5aabcc" font-size="12" text-anchor="middle" font-family="Arial" font-weight="bold">ROOM A</text>
<text x="332" y="120" fill="#5aabcc" font-size="12" text-anchor="middle" font-family="Arial" font-weight="bold">MEETING</text>
<text x="332" y="136" fill="#5aabcc" font-size="12" text-anchor="middle" font-family="Arial" font-weight="bold">ROOM B</text>
<text x="532" y="120" fill="#5aabcc" font-size="12" text-anchor="middle" font-family="Arial" font-weight="bold">SERVER</text>
<text x="532" y="136" fill="#5aabcc" font-size="12" text-anchor="middle" font-family="Arial" font-weight="bold">ROOM</text>
<text x="696" y="120" fill="#5aabcc" font-size="12" text-anchor="middle" font-family="Arial" font-weight="bold">STORAGE</text>
<text x="400" y="252" fill="#5aabcc" font-size="12" text-anchor="middle" font-family="Arial">-- CORRIDOR --</text>
<text x="171" y="362" fill="#5aabcc" font-size="12" text-anchor="middle" font-family="Arial" font-weight="bold">OPEN SPACE</text>
<text x="541" y="356" fill="#5aabcc" font-size="12" text-anchor="middle" font-family="Arial" font-weight="bold">ARCHIVE /</text>
<text x="541" y="372" fill="#5aabcc" font-size="12" text-anchor="middle" font-family="Arial" font-weight="bold">STORAGE</text>
<circle cx="62" cy="172" r="8" fill="#cc3333"/><text x="62" y="177" fill="white" font-size="9" text-anchor="middle" font-family="Arial" font-weight="bold">FE</text>
<circle cx="738" cy="172" r="8" fill="#cc3333"/><text x="738" y="177" fill="white" font-size="9" text-anchor="middle" font-family="Arial" font-weight="bold">FE</text>
<circle cx="171" cy="430" r="8" fill="#cc3333"/><text x="171" y="435" fill="white" font-size="9" text-anchor="middle" font-family="Arial" font-weight="bold">FE</text>
<circle cx="126" cy="60" r="7" fill="#c47a0a"/><text x="126" y="64" fill="white" font-size="8" text-anchor="middle" font-family="Arial">D</text>
<circle cx="332" cy="60" r="7" fill="#c47a0a"/><text x="332" y="64" fill="white" font-size="8" text-anchor="middle" font-family="Arial">D</text>
<circle cx="532" cy="60" r="7" fill="#c47a0a"/><text x="532" y="64" fill="white" font-size="8" text-anchor="middle" font-family="Arial">D</text>
<circle cx="400" cy="244" r="7" fill="#c47a0a"/><text x="400" y="248" fill="white" font-size="8" text-anchor="middle" font-family="Arial">D</text>
<rect x="96" y="26" width="68" height="12" fill="none" stroke="#22bb66" stroke-width="2" rx="1"/>
<text x="130" y="36" fill="#22bb66" font-size="9" text-anchor="middle" font-family="Arial" font-weight="bold">EXIT</text>
<rect x="96" y="480" width="68" height="12" fill="none" stroke="#22bb66" stroke-width="2" rx="1"/>
<text x="130" y="490" fill="#22bb66" font-size="9" text-anchor="middle" font-family="Arial" font-weight="bold">EXIT</text>
<text x="756" y="506" fill="#2d5a7a" font-size="12" text-anchor="middle" font-family="Arial">N ^</text>
</svg>`);

  // ── Inspection photo SVGs ──────────────────────────────────────
  const phGfOverview = _b64(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">
<rect width="640" height="480" fill="#c8cdd4"/>
<rect width="640" height="108" fill="#dde2e8"/>
<polygon points="0,0 120,108 120,372 0,480" fill="#bdc3cc"/>
<polygon points="640,0 520,108 520,372 640,480" fill="#bdc3cc"/>
<polygon points="120,108 520,108 520,372 120,372" fill="#d4d8de"/>
<rect y="372" width="640" height="108" fill="#9a8e80"/>
<rect x="195" y="14" width="110" height="20" fill="#fffff0" opacity="0.9" rx="2"/>
<rect x="335" y="14" width="110" height="20" fill="#fffff0" opacity="0.9" rx="2"/>
<rect x="258" y="116" width="124" height="40" fill="#008833" rx="3"/>
<text x="320" y="142" fill="white" font-size="22" text-anchor="middle" font-family="Arial" font-weight="bold">EXIT</text>
<rect x="352" y="196" width="86" height="170" fill="#88776a" rx="2"/>
<rect x="356" y="200" width="78" height="162" fill="#77665a" rx="1"/>
<rect x="418" y="270" width="10" height="10" fill="#c0a060" rx="1"/>
<rect x="346" y="180" width="100" height="16" fill="#bb2222" rx="1"/>
<text x="396" y="192" fill="white" font-size="9" text-anchor="middle" font-family="Arial" font-weight="bold">FIRE DOOR EI 60</text>
<rect x="134" y="218" width="22" height="68" fill="#cc2222" rx="4"/>
<rect x="138" y="204" width="14" height="18" fill="#cc2222" rx="2"/>
<circle cx="145" cy="200" r="7" fill="#888" stroke="#555" stroke-width="1"/>
<rect x="141" y="193" width="8" height="10" fill="#888"/>
<rect x="124" y="158" width="44" height="20" fill="#ddc800" rx="2"/>
<rect x="120" y="163" width="8" height="12" fill="#ddc800" rx="1"/>
<rect x="168" y="163" width="8" height="12" fill="#ddc800" rx="1"/>
<rect y="440" width="640" height="40" fill="#1a1a2e" opacity="0.88"/>
<text x="20" y="464" fill="#ffffff" font-size="13" font-family="Arial">Ground Floor Zone A  Entrance overview  IMG-GF-001</text>
</svg>`);

  const phGfProduction = _b64(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">
<rect width="640" height="480" fill="#b0b8b8"/>
<rect width="640" height="82" fill="#c8d0d0"/>
<rect y="62" width="640" height="12" fill="#7a8888"/>
<rect x="158" y="62" width="10" height="418" fill="#7a8888"/>
<rect x="316" y="62" width="10" height="418" fill="#7a8888"/>
<rect x="474" y="62" width="10" height="418" fill="#7a8888"/>
<rect y="400" width="640" height="80" fill="#808878"/>
<rect x="28" y="196" width="112" height="204" fill="#6a7070" rx="3"/>
<rect x="34" y="208" width="62" height="42" fill="#888e8e" rx="2"/>
<rect x="168" y="196" width="112" height="204" fill="#6a7070" rx="3"/>
<rect x="174" y="208" width="62" height="42" fill="#888e8e" rx="2"/>
<rect x="378" y="218" width="82" height="160" fill="#6a7070" rx="3"/>
<rect x="488" y="196" width="102" height="180" fill="#6a7070" rx="3"/>
<rect y="132" width="640" height="10" fill="#c0b080" rx="2"/>
<circle cx="80" cy="127" r="5" fill="#8899aa"/>
<line x1="80" y1="132" x2="80" y2="144" stroke="#8899aa" stroke-width="2"/>
<circle cx="240" cy="127" r="5" fill="#8899aa"/>
<line x1="240" y1="132" x2="240" y2="144" stroke="#8899aa" stroke-width="2"/>
<circle cx="400" cy="127" r="5" fill="#8899aa"/>
<line x1="400" y1="132" x2="400" y2="144" stroke="#8899aa" stroke-width="2"/>
<circle cx="560" cy="127" r="5" fill="#8899aa"/>
<line x1="560" y1="132" x2="560" y2="144" stroke="#8899aa" stroke-width="2"/>
<line x1="322" y1="400" x2="322" y2="480" stroke="#ddc000" stroke-width="3"/>
<line x1="28" y1="422" x2="640" y2="422" stroke="#ddc000" stroke-width="2.5"/>
<rect x="560" y="198" width="62" height="182" fill="#887060" rx="2"/>
<rect x="542" y="180" width="92" height="18" fill="#006622" rx="1"/>
<text x="588" y="193" fill="white" font-size="9" text-anchor="middle" font-family="Arial" font-weight="bold">EMERGENCY EXIT</text>
<rect x="322" y="148" width="46" height="58" fill="#334455" rx="3"/>
<rect x="326" y="152" width="38" height="30" fill="#112233" rx="2"/>
<circle cx="334" cy="194" r="4" fill="#cc2222"/>
<circle cx="346" cy="194" r="4" fill="#22cc22"/>
<circle cx="358" cy="194" r="4" fill="#cccc22"/>
<rect y="440" width="640" height="40" fill="#1a1a2e" opacity="0.88"/>
<text x="20" y="464" fill="#ffffff" font-size="13" font-family="Arial">Ground Floor Zone A  Production area with sprinkler system  IMG-GF-002</text>
</svg>`);

  const phFrDoor = _b64(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">
<rect width="640" height="480" fill="#b5b8bb"/>
<rect x="50" y="38" width="540" height="402" fill="#cacdd0"/>
<rect x="188" y="58" width="264" height="382" fill="#7a6a58" rx="3"/>
<rect x="196" y="66" width="248" height="366" fill="#6e5e4c" rx="2"/>
<rect x="214" y="90" width="212" height="118" fill="#64564a" rx="2" opacity="0.5"/>
<rect x="214" y="224" width="212" height="118" fill="#64564a" rx="2" opacity="0.5"/>
<rect x="382" y="213" width="38" height="12" fill="#b8a060" rx="3"/>
<circle cx="400" cy="219" r="10" fill="#c0a860" stroke="#a08040" stroke-width="1.5"/>
<rect x="214" y="356" width="104" height="52" fill="#f5f0e8" rx="2" stroke="#ccbbaa" stroke-width="1"/>
<text x="266" y="374" fill="#333" font-size="9" text-anchor="middle" font-family="Arial" font-weight="bold">FIRE DOOR</text>
<text x="266" y="389" fill="#333" font-size="11" text-anchor="middle" font-family="Arial" font-weight="bold">EI 60</text>
<text x="266" y="402" fill="#555" font-size="8" text-anchor="middle" font-family="Arial">UNI EN 1634-1</text>
<rect x="448" y="66" width="14" height="366" fill="#f0d080" opacity="0.55"/>
<text x="510" y="210" fill="#cc4400" font-size="11" text-anchor="middle" font-family="Arial" font-weight="bold">! GAP</text>
<text x="510" y="228" fill="#cc4400" font-size="11" text-anchor="middle" font-family="Arial" font-weight="bold">8 mm</text>
<text x="510" y="246" fill="#cc4400" font-size="9" text-anchor="middle" font-family="Arial">(max 3 mm)</text>
<line x1="462" y1="240" x2="500" y2="234" stroke="#cc4400" stroke-width="1.5" stroke-dasharray="4,3"/>
<text x="320" y="426" fill="#cc3300" font-size="11" text-anchor="middle" font-family="Arial" font-weight="bold">! intumescent strip missing</text>
<rect y="440" width="640" height="40" fill="#1a1a2e" opacity="0.88"/>
<text x="20" y="464" fill="#ffffff" font-size="13" font-family="Arial">Ground Floor  Fire Resistance  Fire door gap non-conformity (8mm)  IMG-FR-001</text>
</svg>`);

  const phFrWall = _b64(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">
<rect width="640" height="480" fill="#b0b3b8"/>
<rect x="60" y="38" width="520" height="402" fill="#c8cbce"/>
<rect x="248" y="38" width="22" height="402" fill="#555566" opacity="0.75" rx="3"/>
<rect x="280" y="38" width="22" height="402" fill="#555566" opacity="0.75" rx="3"/>
<polygon points="238,178 312,162 344,222 268,242 228,222" fill="#7a7060" opacity="0.45"/>
<rect x="220" y="168" width="150" height="56" fill="#fff3e0" rx="3" stroke="#cc4400" stroke-width="1.5" opacity="0.92"/>
<text x="295" y="190" fill="#cc2200" font-size="10" text-anchor="middle" font-family="Arial" font-weight="bold">! PENETRATION</text>
<text x="295" y="206" fill="#cc2200" font-size="10" text-anchor="middle" font-family="Arial">not fire-sealed</text>
<line x1="270" y1="200" x2="245" y2="210" stroke="#cc4400" stroke-width="1.5" stroke-dasharray="4,3"/>
<rect x="100" y="298" width="230" height="20" fill="#ffe080" opacity="0.85" rx="2"/>
<text x="215" y="312" fill="#333" font-size="10" text-anchor="middle" font-family="Arial" font-weight="bold">Wall thickness: 12 cm (REI 120 req.)</text>
<rect x="426" y="294" width="115" height="70" fill="#f5f0e8" rx="3" stroke="#cc2200" stroke-width="1.5"/>
<text x="483" y="312" fill="#cc2200" font-size="9" text-anchor="middle" font-family="Arial" font-weight="bold">! NOT CERTIFIED</text>
<text x="483" y="326" fill="#555" font-size="8" text-anchor="middle" font-family="Arial">Wall not rated</text>
<text x="483" y="340" fill="#555" font-size="8" text-anchor="middle" font-family="Arial">for REI 120</text>
<text x="483" y="354" fill="#cc2200" font-size="8" text-anchor="middle" font-family="Arial">corrective action</text>
<rect y="440" width="640" height="40" fill="#1a1a2e" opacity="0.88"/>
<text x="20" y="464" fill="#ffffff" font-size="13" font-family="Arial">Ground Floor  Fire Resistance  Uncertified wall penetration (cables)  IMG-FR-002</text>
</svg>`);

  const phEpCorridor = _b64(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">
<rect width="640" height="480" fill="#b8bcc0"/>
<polygon points="0,0 640,0 520,118 120,118" fill="#d0d4d8"/>
<polygon points="0,480 640,480 520,358 120,358" fill="#908880"/>
<polygon points="0,0 120,118 120,358 0,480" fill="#bcbfc4"/>
<polygon points="640,0 520,118 520,358 640,480" fill="#bcbfc4"/>
<rect x="120" y="118" width="400" height="240" fill="#c8ccd0"/>
<rect x="248" y="124" width="144" height="44" fill="#008833" rx="3"/>
<text x="320" y="152" fill="white" font-size="24" text-anchor="middle" font-family="Arial" font-weight="bold">EXIT</text>
<rect x="376" y="306" width="84" height="52" fill="#a89060" rx="2"/>
<text x="418" y="338" fill="#cc4400" font-size="10" text-anchor="middle" font-family="Arial" font-weight="bold">! obstacle</text>
<line x1="120" y1="432" x2="520" y2="432" stroke="#2266cc" stroke-width="3"/>
<polygon points="120,426 120,438 104,432" fill="#2266cc"/>
<polygon points="520,426 520,438 536,432" fill="#2266cc"/>
<text x="320" y="424" fill="#2266cc" font-size="17" text-anchor="middle" font-family="Arial" font-weight="bold">85 cm</text>
<text x="320" y="458" fill="#cc2200" font-size="13" text-anchor="middle" font-family="Arial" font-weight="bold">! min. required: 90 cm</text>
<rect x="124" y="146" width="52" height="24" fill="#ddc800" rx="2"/>
<rect x="120" y="152" width="8" height="14" fill="#ddc800" rx="1"/>
<rect x="176" y="152" width="8" height="14" fill="#ddc800" rx="1"/>
<rect y="440" width="640" height="40" fill="#1a1a2e" opacity="0.88"/>
<text x="20" y="464" fill="#ffffff" font-size="13" font-family="Arial">Ground Floor  Means of Egress  Corridor width 85cm (min 90cm)  IMG-EP-001</text>
</svg>`);

  const phEpSign = _b64(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">
<rect width="640" height="480" fill="#b8bcbf"/>
<rect x="40" y="38" width="560" height="402" fill="#c8ccd0"/>
<rect x="168" y="118" width="304" height="166" fill="#008833" rx="6"/>
<circle cx="248" cy="155" r="22" fill="white"/>
<rect x="234" y="178" width="28" height="52" fill="white" rx="3"/>
<line x1="220" y1="200" x2="246" y2="194" stroke="white" stroke-width="6" stroke-linecap="round"/>
<line x1="246" y1="194" x2="264" y2="216" stroke="white" stroke-width="6" stroke-linecap="round"/>
<rect x="280" y="166" width="124" height="24" fill="white" rx="3"/>
<polygon points="404,146 438,180 404,214" fill="white"/>
<text x="320" y="264" fill="white" font-size="30" text-anchor="middle" font-family="Arial" font-weight="bold">EXIT</text>
<rect x="178" y="108" width="32" height="14" fill="#888" rx="2"/>
<rect x="430" y="108" width="32" height="14" fill="#888" rx="2"/>
<circle cx="452" cy="264" r="16" fill="#00cc44" stroke="#008833" stroke-width="2"/>
<text x="452" y="270" fill="white" font-size="18" text-anchor="middle" font-family="Arial" font-weight="bold">V</text>
<text x="452" y="288" fill="#226633" font-size="9" text-anchor="middle" font-family="Arial">powered</text>
<rect x="40" y="440" width="560" height="40" fill="#909490"/>
<rect y="440" width="640" height="40" fill="#1a1a2e" opacity="0.88"/>
<text x="20" y="464" fill="#ffffff" font-size="13" font-family="Arial">Ground Floor  Means of Egress  Emergency exit sign operational  IMG-EP-002</text>
</svg>`);

  const phDaDetector = _b64(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">
<rect width="640" height="480" fill="#b8bcbf"/>
<rect width="640" height="210" fill="#d0d4d8"/>
<ellipse cx="320" cy="148" rx="58" ry="14" fill="#e0e4e8"/>
<ellipse cx="320" cy="142" rx="50" ry="38" fill="#e8ecf0" stroke="#cccccc" stroke-width="2"/>
<circle cx="320" cy="138" r="14" fill="#cc2222"/>
<circle cx="320" cy="138" r="6" fill="#ff6666"/>
<rect x="222" y="186" width="196" height="38" fill="#f8f8f8" rx="3" stroke="#cccccc" stroke-width="1"/>
<text x="320" y="204" fill="#333" font-size="11" text-anchor="middle" font-family="Arial" font-weight="bold">Smoke Detector — Addressable</text>
<text x="320" y="218" fill="#555" font-size="9" text-anchor="middle" font-family="Arial">Type: optical / UNI EN 54-7</text>
<line x1="372" y1="136" x2="464" y2="90" stroke="#2266cc" stroke-width="1.5" stroke-dasharray="4,3"/>
<rect x="452" y="52" width="160" height="64" fill="#e8eef8" rx="3" stroke="#3366cc" stroke-width="1"/>
<text x="532" y="70" fill="#2244aa" font-size="10" text-anchor="middle" font-family="Arial" font-weight="bold">SN: DA-2023-0477</text>
<text x="532" y="84" fill="#2244aa" font-size="9" text-anchor="middle" font-family="Arial">Last test: 12/2025</text>
<text x="532" y="100" fill="#22aa22" font-size="10" text-anchor="middle" font-family="Arial" font-weight="bold">OPERATIONAL</text>
<rect width="640" height="240" fill="none"/>
<rect y="210" width="640" height="230" fill="#c0c4c8"/>
<rect y="440" width="640" height="40" fill="#1a1a2e" opacity="0.88"/>
<text x="20" y="464" fill="#ffffff" font-size="13" font-family="Arial">Ground Floor  Detection and Alarm  Smoke detector operational  IMG-DA-001</text>
</svg>`);

  const phDaPanel = _b64(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">
<rect width="640" height="480" fill="#c0c4c8"/>
<rect x="158" y="76" width="324" height="310" fill="#2a3444" rx="6" stroke="#1a2434" stroke-width="3"/>
<rect x="158" y="76" width="324" height="44" fill="#1a2840" rx="5"/>
<text x="320" y="103" fill="#88aacc" font-size="13" text-anchor="middle" font-family="Arial" font-weight="bold">FIRE ALARM CONTROL PANEL</text>
<rect x="178" y="132" width="284" height="82" fill="#112233" rx="3"/>
<text x="320" y="156" fill="#00ff88" font-size="13" text-anchor="middle" font-family="Courier,monospace">SYSTEM NORMAL</text>
<text x="320" y="174" fill="#00cc66" font-size="11" text-anchor="middle" font-family="Courier,monospace">Zones: 4 / Detectors: 24</text>
<text x="320" y="192" fill="#00cc66" font-size="10" text-anchor="middle" font-family="Courier,monospace">Last test: 2025-12-01 08:30</text>
<circle cx="198" cy="240" r="9" fill="#22cc22"/>
<text x="215" y="244" fill="#88ccaa" font-size="10" font-family="Arial">POWER</text>
<circle cx="278" cy="240" r="9" fill="#22cc22"/>
<text x="294" y="244" fill="#88ccaa" font-size="10" font-family="Arial">NORMAL</text>
<circle cx="378" cy="240" r="9" fill="#333333"/>
<text x="394" y="244" fill="#88ccaa" font-size="10" font-family="Arial">ALARM</text>
<circle cx="444" cy="240" r="9" fill="#333333"/>
<text x="460" y="244" fill="#88ccaa" font-size="10" font-family="Arial">FAULT</text>
<rect x="183" y="262" width="62" height="26" fill="#334466" rx="3"/>
<text x="214" y="279" fill="#aaccee" font-size="9" text-anchor="middle" font-family="Arial">RESET</text>
<rect x="256" y="262" width="62" height="26" fill="#334466" rx="3"/>
<text x="287" y="279" fill="#aaccee" font-size="9" text-anchor="middle" font-family="Arial">SILENCE</text>
<rect x="330" y="262" width="62" height="26" fill="#334466" rx="3"/>
<text x="361" y="279" fill="#aaccee" font-size="9" text-anchor="middle" font-family="Arial">TEST</text>
<rect x="404" y="262" width="62" height="26" fill="#884422" rx="3"/>
<text x="435" y="279" fill="#ffccaa" font-size="9" text-anchor="middle" font-family="Arial">EVAC.</text>
<rect x="183" y="300" width="275" height="64" fill="#1a2838" rx="3"/>
<text x="200" y="318" fill="#4488aa" font-size="9" font-family="Courier,monospace">Z1 GF-A OK</text>
<text x="290" y="318" fill="#4488aa" font-size="9" font-family="Courier,monospace">Z2 GF-B OK</text>
<text x="380" y="318" fill="#4488aa" font-size="9" font-family="Courier,monospace">Z3 FF-A OK</text>
<text x="200" y="336" fill="#4488aa" font-size="9" font-family="Courier,monospace">Z4 FF-B OK</text>
<rect x="490" y="198" width="108" height="78" fill="#f8f8f8" rx="3" stroke="#ccc" stroke-width="1"/>
<text x="544" y="216" fill="#333" font-size="9" text-anchor="middle" font-family="Arial" font-weight="bold">UNI EN 54-2</text>
<text x="544" y="230" fill="#333" font-size="8" text-anchor="middle" font-family="Arial">Cert. 2345/23</text>
<text x="544" y="244" fill="#22aa22" font-size="9" text-anchor="middle" font-family="Arial" font-weight="bold">Certified</text>
<text x="544" y="258" fill="#555" font-size="8" text-anchor="middle" font-family="Arial">Service: 2026-12</text>
<rect y="440" width="640" height="40" fill="#1a1a2e" opacity="0.88"/>
<text x="20" y="464" fill="#ffffff" font-size="13" font-family="Arial">Ground Floor  Detection and Alarm  FACP all zones normal  IMG-DA-002</text>
</svg>`);

  const phFeExtinguisher = _b64(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">
<rect width="640" height="480" fill="#c0c4c8"/>
<rect x="288" y="58" width="64" height="22" fill="#7a7a7a" rx="3"/>
<rect x="308" y="78" width="24" height="16" fill="#888" rx="2"/>
<ellipse cx="320" cy="164" rx="56" ry="18" fill="#cc2222"/>
<rect x="264" y="162" width="112" height="224" fill="#cc2222" rx="8"/>
<ellipse cx="320" cy="386" rx="56" ry="18" fill="#aa1a1a"/>
<rect x="298" y="110" width="44" height="30" fill="#cc2222" rx="5"/>
<rect x="306" y="90" width="28" height="24" fill="#aaaaaa" rx="4"/>
<rect x="312" y="80" width="16" height="14" fill="#888"/>
<rect x="306" y="92" width="6" height="22" fill="#ffdd00"/>
<circle cx="320" cy="182" r="24" fill="#f8f8f8" stroke="#aaaaaa" stroke-width="2"/>
<circle cx="320" cy="182" r="18" fill="#f0f0f0"/>
<line x1="320" y1="182" x2="332" y2="168" stroke="#cc2222" stroke-width="2.5" stroke-linecap="round"/>
<circle cx="320" cy="182" r="3" fill="#444"/>
<text x="320" y="208" fill="#333" font-size="8" text-anchor="middle" font-family="Arial">OK</text>
<rect x="276" y="222" width="88" height="114" fill="#f8f8f8" rx="3"/>
<text x="320" y="240" fill="#cc2200" font-size="10" text-anchor="middle" font-family="Arial" font-weight="bold">FIRE EXT.</text>
<text x="320" y="255" fill="#333" font-size="9" text-anchor="middle" font-family="Arial">Dry powder 6 kg</text>
<text x="320" y="269" fill="#333" font-size="9" text-anchor="middle" font-family="Arial">Class: ABC</text>
<text x="320" y="283" fill="#333" font-size="8" text-anchor="middle" font-family="Arial">UNI EN 3</text>
<text x="320" y="297" fill="#22aa22" font-size="9" text-anchor="middle" font-family="Arial" font-weight="bold">Compliant</text>
<rect x="352" y="88" width="74" height="94" fill="#fffcdc" rx="3" stroke="#ccbbaa" stroke-width="1"/>
<line x1="320" y1="90" x2="352" y2="100" stroke="#888" stroke-width="1"/>
<text x="389" y="106" fill="#333" font-size="9" text-anchor="middle" font-family="Arial" font-weight="bold">INSPECTION</text>
<text x="389" y="120" fill="#333" font-size="8" text-anchor="middle" font-family="Arial">Date: 01/2026</text>
<text x="389" y="134" fill="#333" font-size="8" text-anchor="middle" font-family="Arial">Next: 01/2027</text>
<text x="389" y="148" fill="#333" font-size="8" text-anchor="middle" font-family="Arial">P. Verdi</text>
<text x="389" y="166" fill="#22aa22" font-size="9" text-anchor="middle" font-family="Arial" font-weight="bold">OK</text>
<rect y="440" width="640" height="40" fill="#1a1a2e" opacity="0.88"/>
<text x="20" y="464" fill="#ffffff" font-size="13" font-family="Arial">Ground Floor  Fire Extinguishers  6kg ABC tag current Jan 2026  IMG-FE-001</text>
</svg>`);

  const phFeGauge = _b64(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">
<rect width="640" height="480" fill="#c0c4c8"/>
<rect x="118" y="78" width="404" height="344" fill="#cc2222" rx="10"/>
<circle cx="320" cy="244" r="124" fill="#f5f5f5" stroke="#cccccc" stroke-width="4"/>
<circle cx="320" cy="244" r="108" fill="#f0f0f0"/>
<path d="M230 200 A98 98 0 0 1 266 158" fill="none" stroke="#cc2200" stroke-width="14" opacity="0.5"/>
<path d="M266 158 A98 98 0 0 1 406 176" fill="none" stroke="#22cc22" stroke-width="14" opacity="0.45"/>
<path d="M406 176 A98 98 0 0 1 418 244" fill="none" stroke="#cc8800" stroke-width="14" opacity="0.5"/>
<text x="228" y="256" fill="#cc2200" font-size="12" font-family="Arial" font-weight="bold">0</text>
<text x="208" y="204" fill="#666" font-size="11" font-family="Arial">2</text>
<text x="232" y="160" fill="#666" font-size="11" font-family="Arial">5</text>
<text x="302" y="138" fill="#666" font-size="11" font-family="Arial">8</text>
<text x="374" y="152" fill="#666" font-size="11" font-family="Arial">10</text>
<text x="414" y="196" fill="#666" font-size="11" font-family="Arial">12</text>
<line x1="320" y1="244" x2="402" y2="172" stroke="#1a2a3a" stroke-width="5" stroke-linecap="round"/>
<circle cx="320" cy="244" r="9" fill="#334455"/>
<text x="320" y="218" fill="#555" font-size="13" text-anchor="middle" font-family="Arial">bar</text>
<text x="320" y="286" fill="#22aa22" font-size="15" text-anchor="middle" font-family="Arial" font-weight="bold">~10 bar  OK</text>
<rect y="440" width="640" height="40" fill="#1a1a2e" opacity="0.88"/>
<text x="20" y="464" fill="#ffffff" font-size="13" font-family="Arial">Ground Floor  Fire Extinguishers  Pressure gauge 10 bar green zone  IMG-FE-002</text>
</svg>`);

  const phFfCorridor = _b64(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">
<rect width="640" height="480" fill="#bcc0c4"/>
<polygon points="0,0 640,0 520,112 120,112" fill="#dde0e4"/>
<polygon points="0,480 640,480 520,362 120,362" fill="#9a9488"/>
<polygon points="0,0 120,112 120,362 0,480" fill="#c4c8cc"/>
<polygon points="640,0 520,112 520,362 640,480" fill="#c4c8cc"/>
<rect x="120" y="112" width="400" height="250" fill="#cccfd4"/>
<rect x="228" y="14" width="82" height="20" fill="#fffff0" opacity="0.9" rx="2"/>
<rect x="330" y="14" width="82" height="20" fill="#fffff0" opacity="0.9" rx="2"/>
<rect x="122" y="114" width="22" height="8" fill="#ddc800" rx="1"/>
<rect x="496" y="114" width="22" height="8" fill="#ddc800" rx="1"/>
<rect x="238" y="172" width="164" height="192" fill="#887060" rx="2"/>
<rect x="242" y="176" width="156" height="184" fill="#77665a" rx="1"/>
<rect x="372" y="257" width="14" height="12" fill="#c0a060" rx="1"/>
<rect x="236" y="152" width="168" height="38" fill="#008833" rx="3"/>
<text x="320" y="178" fill="white" font-size="22" text-anchor="middle" font-family="Arial" font-weight="bold">EXIT</text>
<rect x="498" y="192" width="18" height="52" fill="#cc2222" rx="4"/>
<rect x="501" y="182" width="12" height="14" fill="#cc2222" rx="2"/>
<rect x="126" y="192" width="62" height="26" fill="#ddd" rx="2"/>
<text x="157" y="209" fill="#333" font-size="11" text-anchor="middle" font-family="Arial">101-A</text>
<line x1="320" y1="362" x2="320" y2="480" stroke="#ddc000" stroke-width="3" stroke-dasharray="20,10"/>
<rect y="440" width="640" height="40" fill="#1a1a2e" opacity="0.88"/>
<text x="20" y="464" fill="#ffffff" font-size="13" font-family="Arial">First Floor Zone B  Corridor east side  IMG-FF-001</text>
</svg>`);

  const phFfServer = _b64(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">
<rect width="640" height="480" fill="#b8bcbf"/>
<rect width="640" height="480" fill="#c0c4c8"/>
<rect x="198" y="58" width="244" height="364" fill="#778898" rx="3"/>
<rect x="206" y="66" width="228" height="348" fill="#667888" rx="2"/>
<rect x="228" y="88" width="92" height="62" fill="#99bbdd" rx="2" opacity="0.7"/>
<rect x="216" y="278" width="208" height="58" fill="#f5f8ff" rx="2"/>
<text x="320" y="298" fill="#2244aa" font-size="12" text-anchor="middle" font-family="Arial" font-weight="bold">SERVER ROOM</text>
<text x="320" y="314" fill="#555" font-size="10" text-anchor="middle" font-family="Arial">Restricted access</text>
<text x="320" y="330" fill="#aa2200" font-size="10" text-anchor="middle" font-family="Arial" font-weight="bold">! Fire suppression active</text>
<rect x="452" y="228" width="62" height="82" fill="#334455" rx="3"/>
<rect x="457" y="234" width="52" height="32" fill="#112233" rx="2"/>
<circle cx="469" cy="278" r="5" fill="#22cc22"/>
<circle cx="483" cy="278" r="5" fill="#22cc22"/>
<circle cx="497" cy="278" r="5" fill="#cc2222"/>
<text x="483" y="302" fill="#6688aa" font-size="8" text-anchor="middle" font-family="Arial">KEYPAD</text>
<rect x="213" y="158" width="204" height="58" fill="#cc8800" rx="3"/>
<text x="315" y="178" fill="white" font-size="10" text-anchor="middle" font-family="Arial" font-weight="bold">! INERT GAS SUPPRESSION</text>
<text x="315" y="194" fill="white" font-size="9" text-anchor="middle" font-family="Arial">Evacuate immediately on alarm</text>
<text x="315" y="208" fill="white" font-size="8" text-anchor="middle" font-family="Arial">IG-541 / UNI EN 15004</text>
<rect x="138" y="158" width="52" height="52" fill="#334455" rx="3"/>
<circle cx="164" cy="184" r="13" fill="#112233"/>
<circle cx="164" cy="184" r="6" fill="#22cc22"/>
<text x="164" y="222" fill="#4488aa" font-size="8" text-anchor="middle" font-family="Arial">CO2 DET.</text>
<rect y="440" width="640" height="40" fill="#1a1a2e" opacity="0.88"/>
<text x="20" y="464" fill="#ffffff" font-size="13" font-family="Arial">First Floor Zone B  Server room entrance with suppression warning  IMG-FF-002</text>
</svg>`);

  const phFfExit = _b64(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">
<rect width="640" height="480" fill="#b8bcbf"/>
<rect width="640" height="480" fill="#c4c8cc"/>
<rect x="138" y="78" width="364" height="384" fill="#8a8880" rx="3"/>
<rect x="146" y="86" width="348" height="368" fill="#7a7870" rx="2"/>
<rect x="153" y="270" width="334" height="24" fill="#c8c090" rx="4"/>
<rect x="158" y="264" width="324" height="32" fill="#d8d0a0" rx="4" opacity="0.7"/>
<text x="320" y="285" fill="#444" font-size="12" text-anchor="middle" font-family="Arial" font-weight="bold">PUSH TO OPEN</text>
<rect x="146" y="56" width="348" height="44" fill="#008833" rx="3"/>
<text x="320" y="84" fill="white" font-size="26" text-anchor="middle" font-family="Arial" font-weight="bold">EMERGENCY EXIT</text>
<rect x="146" y="86" width="348" height="10" fill="#88ff88" opacity="0.4"/>
<rect x="146" y="444" width="348" height="10" fill="#88ff88" opacity="0.4"/>
<rect x="378" y="312" width="94" height="64" fill="#f8f8f8" rx="2" stroke="#ccc" stroke-width="1"/>
<text x="425" y="330" fill="#333" font-size="8" text-anchor="middle" font-family="Arial" font-weight="bold">EN 1125</text>
<text x="425" y="344" fill="#333" font-size="8" text-anchor="middle" font-family="Arial">Panic hardware</text>
<text x="425" y="358" fill="#22aa22" font-size="9" text-anchor="middle" font-family="Arial" font-weight="bold">Certified</text>
<text x="425" y="370" fill="#555" font-size="7" text-anchor="middle" font-family="Arial">tested 01/2026</text>
<rect x="158" y="38" width="62" height="22" fill="#ddc800" rx="2"/>
<rect x="154" y="44" width="8" height="14" fill="#ddc800" rx="1"/>
<rect x="220" y="44" width="8" height="14" fill="#ddc800" rx="1"/>
<rect x="420" y="38" width="62" height="22" fill="#ddc800" rx="2"/>
<rect x="416" y="44" width="8" height="14" fill="#ddc800" rx="1"/>
<rect x="482" y="44" width="8" height="14" fill="#ddc800" rx="1"/>
<rect y="440" width="640" height="40" fill="#1a1a2e" opacity="0.88"/>
<text x="20" y="464" fill="#ffffff" font-size="13" font-family="Arial">First Floor  Means of Egress  Emergency exit push bar compliant  IMG-EP-FF-001</text>
</svg>`);

  // ── Build mock floors-first SI data ───────────────────────────
  const mockFloor1 = {
    ...createEmptyFloor(),
    id: "mock-floor-gf",
    floorLabel: "Ground Floor",
    areaCategory: "Zone A",
    comments: "Three-storey industrial facility. Ground floor includes reception, open office, warehouse and production area. Two emergency exits verified.",
    notes: "Non-conformities identified in fire resistance (fire door gap) and means of egress (corridor width). Riverifica required.",
    riverifica: true,
    savedFloor: true,
    floorplanDataUrl: fpGF,
    floorplanPins: [
      { x: 18, y: 47, note: "Main entrance / Reception" },
      { x: 50, y: 40, note: "Open office area" },
      { x: 82, y: 27, note: "Warehouse" },
      { x: 60, y: 72, note: "Production area" },
    ],
    checkPins: [
      {
        id: "cp-1",
        x: 60, y: 72,
        note: "Fire door FD-001 — non-conforming gap 8 mm, intumescent seal missing",
        checkIds: ["fire-resistance"],
        photoRef: { checkId: "fire-resistance", photoId: "ph-fr-001" },
      },
      {
        id: "cp-2",
        x: 48, y: 62,
        note: "FD-001 on exit path — dual non-conformity: fire resistance failure + egress obstruction risk",
        checkIds: ["fire-resistance", "exit-path"],
        photoRef: { checkId: "fire-resistance", photoId: "ph-fr-001" },
      },
      {
        id: "cp-3",
        x: 22, y: 70,
        note: "Corridor width 85 cm — below 90 cm minimum required",
        checkIds: ["exit-path"],
        photoRef: { checkId: "exit-path", photoId: "ph-ep-001" },
      },
      {
        id: "cp-4",
        x: 72, y: 55,
        note: "REI 120 compartment wall — two unsealed cable conduit penetrations",
        checkIds: ["fire-resistance"],
        photoRef: { checkId: "fire-resistance", photoId: "ph-fr-002" },
      },
      {
        id: "cp-5",
        x: 18, y: 11,
        note: "Smoke detector Z1 — entrance / reception area (SN DA-2023-0477)",
        checkIds: ["detection-alarm"],
        photoRef: { checkId: "detection-alarm", photoId: "ph-da-001" },
      },
      {
        id: "cp-6",
        x: 8, y: 22,
        note: "FACP — ground floor lobby (SYSTEM NORMAL, 4 zones)",
        checkIds: ["detection-alarm"],
        photoRef: { checkId: "detection-alarm", photoId: "ph-da-002" },
      },
      {
        id: "cp-7",
        x: 8, y: 36,
        note: "Fire extinguisher 6 kg ABC — entrance area (tag current Jan 2026/2027)",
        checkIds: ["fire-extinguisher"],
        photoRef: { checkId: "fire-extinguisher", photoId: "ph-fe-001" },
      },
      {
        id: "cp-8",
        x: 47, y: 10,
        note: "Fire extinguisher 6 kg ABC — open office area (pressure 10 bar)",
        checkIds: ["fire-extinguisher"],
        photoRef: { checkId: "fire-extinguisher", photoId: "ph-fe-002" },
      },
    ],
    photos: [
      {
        dataUrl: phGfOverview,
        code: "IMG-GF-001",
        note: "Entrance and general overview",
        fpPinRef: 0,
        pins: [
          { x: 27, y: 72, note: "Fire door to production — non-conforming gap" },
          { x: 21, y: 48, note: "Fire extinguisher position" },
        ],
      },
      {
        dataUrl: phGfProduction,
        code: "IMG-GF-002",
        note: "Production area — sprinkler system above machinery",
        fpPinRef: 3,
        pins: [
          { x: 13, y: 29, note: "Sprinkler head above machinery" },
          { x: 50, y: 33, note: "Alarm panel on structural column" },
        ],
      },
    ],
    selectedChecks: ["site-status", "fire-resistance", "exit-path", "detection-alarm", "fire-extinguisher", "smoke-heat"],
    checks: {
      "site-status": {
        saved: true, riverifica: false,
        status: "Compliant",
        statusNotes: "Site fully operational. Certificate of occupancy and fire safety register up to date.",
        comments: "Industrial manufacturing facility. Three above-ground floors. Occupancy: up to 120 persons. Fire safety register verified and current. Certificate of occupancy no. 12345/2020 valid.",
        notes: "Next fire safety register review: 01/2027.",
        photos: [],
      },
      "fire-resistance": {
        saved: true, riverifica: true,
        status: "Non Compliant",
        statusNotes: "Fire door gap 8 mm (max 3 mm). Intumescent strip missing. Cable penetrations through REI 120 wall not fire-stopped.",
        comments: "Fire door FD-001 between office and production area has an 8 mm gap along the latch side, exceeding the 3 mm maximum. The intumescent strip is absent. Additionally, two cable conduit penetrations through the REI 120 compartment wall in the production area are unsealed. Non-conformity ref: NC-FR-001, NC-FR-002.",
        notes: "Corrective action required before next audit. Provisional risk mitigation: increased patrol frequency in production area.",
        photos: [
          {
            id: "ph-fr-001",
            dataUrl: phFrDoor,
            code: "IMG-FR-001",
            note: "Fire door FD-001 — gap 8 mm at latch side",
            fpPinRef: 3,
            pins: [
              { x: 73, y: 50, note: "Gap 8 mm — exceeds 3 mm max" },
              { x: 40, y: 82, note: "Intumescent seal missing" },
            ],
          },
          {
            id: "ph-fr-002",
            dataUrl: phFrWall,
            code: "IMG-FR-002",
            note: "REI 120 wall penetration — cables not fire-stopped",
            fpPinRef: 3,
            pins: [
              { x: 42, y: 42, note: "Unsealed cable conduit penetration" },
            ],
          },
        ],
      },
      "exit-path": {
        saved: true, riverifica: true,
        status: "Non Compliant",
        statusNotes: "Corridor width 85 cm (min 90 cm). Obstacle obstructing path. NC ref: NC-EP-001.",
        comments: "Main egress corridor from production area to emergency exit South measures 85 cm at narrowest point, below the 90 cm minimum required by D.M. 03/08/2015. A storage box (approx 80x60 cm) found partially obstructing the path during inspection — removed on site. Emergency exit signs operational and illuminated.",
        notes: "Corridor width requires structural correction. Box removed during inspection — confirmed clear by end of visit.",
        photos: [
          {
            id: "ph-ep-001",
            dataUrl: phEpCorridor,
            code: "IMG-EP-001",
            note: "Corridor width 85 cm — below 90 cm minimum",
            fpPinRef: 0,
            pins: [
              { x: 32, y: 85, note: "Measured width: 85 cm" },
              { x: 60, y: 68, note: "Storage box on exit path (removed)" },
            ],
          },
          {
            id: "ph-ep-002",
            dataUrl: phEpSign,
            code: "IMG-EP-002",
            note: "Emergency exit sign — illuminated, operational",
            fpPinRef: null,
            pins: [],
          },
        ],
      },
      "detection-alarm": {
        saved: true, riverifica: false,
        status: "Compliant",
        statusNotes: "FACP SYSTEM NORMAL. All 4 zones active. 24 addressable detectors operational. Certifications current.",
        comments: "Fire alarm control panel (FACP) inspected and found in SYSTEM NORMAL status. Zones Z1-Z4 all active. Visual and functional test of 6 randomly selected smoke detectors confirmed response within specification. Panel certificate UNI EN 54-2 no. 2345/23 valid. Last maintenance service: December 2025.",
        notes: "Next scheduled service: December 2026. Service log entry verified.",
        photos: [
          {
            id: "ph-da-001",
            dataUrl: phDaDetector,
            code: "IMG-DA-001",
            note: "Addressable smoke detector SN DA-2023-0477 — operational",
            fpPinRef: null,
            pins: [
              { x: 50, y: 31, note: "Detector SN: DA-2023-0477 — last test 12/2025" },
            ],
          },
          {
            id: "ph-da-002",
            dataUrl: phDaPanel,
            code: "IMG-DA-002",
            note: "FACP — all zones normal, certifications current",
            fpPinRef: null,
            pins: [
              { x: 50, y: 49, note: "SYSTEM NORMAL — 4 zones, 24 detectors" },
            ],
          },
        ],
      },
      "fire-extinguisher": {
        saved: true, riverifica: false,
        status: "Compliant",
        statusNotes: "5 x 6 kg ABC extinguishers — all tags current (Jan 2026 / Jan 2027), pressure nominal.",
        comments: "Five portable 6 kg dry powder (ABC) fire extinguishers verified. Inspection tags dated January 2026, next inspection January 2027 by P. Verdi (TechService S.r.l.). Pressure gauges on all units reading in green zone (~10 bar). Mounting positions accessible and signposted. UNI EN 3 compliant.",
        notes: "Extinguisher register updated. No units require replacement.",
        photos: [
          {
            id: "ph-fe-001",
            dataUrl: phFeExtinguisher,
            code: "IMG-FE-001",
            note: "6 kg ABC extinguisher — inspection tag Jan 2026/2027",
            fpPinRef: null,
            pins: [
              { x: 67, y: 22, note: "Inspection tag — Jan 2026 / next Jan 2027" },
            ],
          },
          {
            id: "ph-fe-002",
            dataUrl: phFeGauge,
            code: "IMG-FE-002",
            note: "Pressure gauge — ~10 bar, green zone",
            fpPinRef: null,
            pins: [
              { x: 65, y: 44, note: "Needle in green zone, ~10 bar" },
            ],
          },
        ],
      },
      "smoke-heat": {
        saved: true, riverifica: false,
        status: "Compliant",
        statusNotes: "SHEV system operational. 4 roof vents opened within 30 s during manual test.",
        comments: "Smoke and heat exhaust ventilation (SHEV) system tested. Four natural ventilation openings on the production area roof verified. Manual activation test: all vents opened within 25-30 s. Control panel in ground floor lobby shows READY status. UNI EN 12101-2 compliant.",
        notes: "Ventilation areas: V-001 to V-004. Next test: January 2027.",
        photos: [],
      },
    },
  };

  const mockFloor2 = {
    ...createEmptyFloor(),
    id: "mock-floor-ff",
    floorLabel: "First Floor",
    areaCategory: "Zone B",
    comments: "First floor contains meeting rooms, server room, open space and archive. All checks passed. Server room has dedicated IG-541 inert gas suppression system — separately documented.",
    notes: "Server room suppression system to be included in Plant Tests section separately.",
    riverifica: false,
    savedFloor: true,
    floorplanDataUrl: fpFF,
    floorplanPins: [
      { x: 16, y: 27, note: "Meeting Room A" },
      { x: 42, y: 27, note: "Meeting Room B" },
      { x: 67, y: 27, note: "Server Room (restricted access)" },
      { x: 21, y: 70, note: "Open space area" },
    ],
    photos: [
      {
        dataUrl: phFfCorridor,
        code: "IMG-FF-001",
        note: "First floor corridor — east side, emergency exit visible",
        fpPinRef: null,
        pins: [
          { x: 50, y: 36, note: "Emergency exit sign — illuminated" },
        ],
      },
      {
        dataUrl: phFfServer,
        code: "IMG-FF-002",
        note: "Server room entrance — IG-541 suppression warning sign",
        fpPinRef: 2,
        pins: [
          { x: 49, y: 48, note: "IG-541 inert gas suppression warning" },
          { x: 22, y: 42, note: "CO2 detector at server room entrance" },
        ],
      },
    ],
    selectedChecks: ["exit-path", "fire-resistance", "fire-extinguisher", "detection-alarm"],
    checks: {
      "exit-path": {
        saved: true, riverifica: false,
        status: "Compliant",
        statusNotes: "Corridor widths min 110 cm. Anti-panic push bars EN 1125. Photoluminescent strips present.",
        comments: "All exit paths on first floor verified. Minimum corridor width 110 cm (compliant). Two emergency exits fitted with EN 1125-certified anti-panic push bar hardware. Photoluminescent floor-level strips in place along egress routes. Emergency lighting (DIN EN 1838) verified operational.",
        notes: "Push bar certification stickers photographed for record.",
        photos: [
          {
            dataUrl: phFfExit,
            code: "IMG-EP-FF-001",
            note: "Emergency exit with EN 1125 push bar — compliant",
            fpPinRef: null,
            pins: [
              { x: 50, y: 56, note: "Anti-panic push bar EN 1125 — certified 01/2026" },
              { x: 26, y: 10, note: "Emergency lighting" },
            ],
          },
        ],
      },
      "fire-resistance": {
        saved: true, riverifica: false,
        status: "Compliant",
        statusNotes: "All REI 120 partitions and fire doors on first floor compliant. Server room: REI 180.",
        comments: "REI 120 compartment walls verified by documentation and visual inspection. All fire doors on first floor have valid EI 60 certification plaques and intumescent strips in good condition. Server room enclosure rated REI 180 per project documentation.",
        notes: "Fire door inspection log updated.",
        photos: [],
      },
      "fire-extinguisher": {
        saved: true, riverifica: false,
        status: "Compliant",
        statusNotes: "2 x 6 kg ABC extinguishers in corridor and server room anteroom — tags current.",
        comments: "Two portable extinguishers verified on first floor: one in main corridor (near Meeting Room A) and one in server room anteroom. Both 6 kg ABC dry powder. Inspection tags current, pressure nominal.",
        notes: "",
        photos: [],
      },
      "detection-alarm": {
        saved: true, riverifica: false,
        status: "Compliant",
        statusNotes: "6 addressable smoke detectors on zones Z3-Z4 operational. Linear detector above server racks verified.",
        comments: "Six addressable smoke detectors on first floor (FACP zones Z3 and Z4) confirmed operational from control panel. An additional linear heat detector above the server room racks was tested and responded within specification. All detectors have valid test records.",
        notes: "Zone Z3 = meeting rooms / corridor. Zone Z4 = server room / archive.",
        photos: [],
      },
    },
  };

  // ── Third floor: all 13 checks, one of each outcome ──────────
  const fpSF = _b64(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520">
<rect width="800" height="520" fill="#0d1b2a"/>
<text x="400" y="20" fill="#2d5a7a" font-size="12" text-anchor="middle" font-family="Arial">SECOND FLOOR PLAN — ZONE C — Rev. 3/2023</text>
<rect x="30" y="30" width="740" height="458" fill="none" stroke="#3a7aaa" stroke-width="4" rx="2"/>
<line x1="400" y1="30" x2="400" y2="488" stroke="#3a7aaa" stroke-width="3"/>
<line x1="30" y1="260" x2="400" y2="260" stroke="#3a7aaa" stroke-width="3"/>
<line x1="400" y1="200" x2="770" y2="200" stroke="#3a7aaa" stroke-width="2"/>
<rect x="394" y="88" width="12" height="32" fill="#0d1b2a"/>
<path d="M396 88 A28 28 0 0 1 424 88" fill="none" stroke="#3a7aaa" stroke-width="1.5"/>
<rect x="114" y="256" width="12" height="30" fill="#0d1b2a"/>
<path d="M116 256 A26 26 0 0 1 142 256" fill="none" stroke="#3a7aaa" stroke-width="1.5"/>
<rect x="26" y="360" width="8" height="60" fill="#0d1b2a"/>
<path d="M26 362 A30 30 0 0 0 26 390" fill="none" stroke="#3a7aaa" stroke-width="1.5"/>
<text x="215" y="155" fill="#2d5a7a" font-size="13" text-anchor="middle" font-family="Arial">TRAINING ROOM A</text>
<text x="215" y="370" fill="#2d5a7a" font-size="13" text-anchor="middle" font-family="Arial">CANTEEN</text>
<text x="590" y="120" fill="#2d5a7a" font-size="13" text-anchor="middle" font-family="Arial">DIRECTOR'S OFFICE</text>
<text x="590" y="355" fill="#2d5a7a" font-size="13" text-anchor="middle" font-family="Arial">OPEN SPACE C</text>
<text x="400" y="510" fill="#2d5a7a" font-size="9" text-anchor="middle" font-family="Arial">ZONE C — 2ND FLOOR</text>
</svg>`);

  const mockFloor3 = {
    ...createEmptyFloor(),
    id: "mock-floor-sf",
    floorLabel: "Second Floor",
    areaCategory: "Zone C",
    floorplanDataUrl: fpSF,
    floorplanPins: [
      { x: 27, y: 30, note: "Training Room A" },
      { x: 75, y: 12, note: "Director's Office" },
      { x: 27, y: 72, note: "Canteen" },
      { x: 75, y: 72, note: "Open Space C" },
    ],
    checkPins: [],
    comments: "Second floor offices, training room and canteen. All 13 compliance checks performed. Mixed outcomes — two non-conformities and two pending verifications identified.",
    notes: "Corrective action plan submitted to client for SHEV actuator replacement (NC-SF-001) and compartmentation area exceedance (NC-SF-002). Fire reaction certificates for upholstered furniture pending.",
    riverifica: true,
    savedFloor: true,
    photos: [],
    selectedChecks: [
      "site-status","fire-reaction","fire-resistance","compartimentation",
      "exit-path","refuge-areas","fire-extinguisher","manual-suppression",
      "auto-suppression","detection-alarm","smoke-heat","tech-system","fire-safety-mgmt",
    ],
    checks: {
      "site-status": {
        saved: true, riverifica: false,
        status: "Compliant",
        statusNotes: "Register current. Occupancy max 85 persons. CPI valid.",
        comments: "Fire safety register reviewed — all entries current. Certificate of occupancy covers second floor. Max occupancy 85 persons compliant with fire evacuation plan.",
        notes: "", photos: [],
      },
      "fire-reaction": {
        saved: true, riverifica: true,
        status: "Partially Compliant",
        statusNotes: "Upholstered training room chairs: Class 1IM certificates missing. Wall panels: Class 0. Flooring: Class Bfl-s1.",
        comments: "Wall panels and flooring have verified fire reaction class documentation. However, 18 upholstered chairs in Training Room A lack Class 1IM certificates. Supplier contacted for documentation. NC-SF-003.",
        notes: "Certificate request sent to supplier — awaiting response.", photos: [],
      },
      "fire-resistance": {
        saved: true, riverifica: false,
        status: "Compliant",
        statusNotes: "All REI 120 partitions verified. Fire doors EI 60 certified. Documentation complete.",
        comments: "REI 120 compartment walls on second floor verified by original project documentation and visual inspection. All fire doors fitted with intumescent seals in good condition, EI 60 certification plaques present.",
        notes: "", photos: [],
      },
      "compartimentation": {
        saved: true, riverifica: true,
        status: "Non Compliant",
        statusNotes: "Open Space C compartment area 3 420 m² — exceeds 2 500 m² limit (D.M. 03/08/2015). NC-SF-002.",
        comments: "The Open Space C area on the second floor measures 3 420 m², exceeding the 2 500 m² maximum compartment area permitted for offices under D.M. 03/08/2015. A partitioning project has been submitted for approval. NC ref: NC-SF-002.",
        notes: "Interim measure: additional fire extinguishers deployed in Open Space C.", photos: [],
      },
      "exit-path": {
        saved: true, riverifica: false,
        status: "Compliant",
        statusNotes: "Two stairwell exits. Min corridor width 110 cm. Anti-panic hardware EN 1125. All compliant.",
        comments: "Two stairwell emergency exits from second floor verified. Corridor widths minimum 110 cm throughout. Anti-panic push bars EN 1125 certified on both exits. Emergency exit signage illuminated and photoluminescent strips present.",
        notes: "", photos: [],
      },
      "refuge-areas": {
        saved: true, riverifica: false,
        status: "Compliant",
        statusNotes: "Refuge area at stairwell landing: 4.2 m², capacity 6 persons. Intercom operational.",
        comments: "Refuge area for persons with reduced mobility located at east stairwell landing. Area 4.2 m², capacity 6 persons. Two-way intercom to reception verified operational. Compliant with D.M. 03/08/2015.",
        notes: "", photos: [],
      },
      "fire-extinguisher": {
        saved: true, riverifica: false,
        status: "Compliant",
        statusNotes: "4 x 6 kg ABC extinguishers — tags Jan 2026/Jan 2027, pressure nominal.",
        comments: "Four portable 6 kg ABC dry powder extinguishers on second floor. All inspection tags current (January 2026), next service January 2027. Pressure gauges in green zone. Mounting positions accessible.",
        notes: "", photos: [],
      },
      "manual-suppression": {
        saved: true, riverifica: true,
        status: "To be verified",
        statusNotes: "Fire hose reel HR-2F-01: pressure test certificate expired Dec 2025. Re-test scheduled.",
        comments: "Fire hose reel HR-2F-01 in canteen area has an expired pressure test certificate (exp. December 2025). A re-test has been scheduled with TechService S.r.l. for August 2026. Hose reel remains in service pending re-test.",
        notes: "Follow up: confirm test completion certificate received after August 2026.", photos: [],
      },
      "auto-suppression": {
        saved: true, riverifica: false,
        status: "Compliant",
        statusNotes: "Wet pipe sprinkler system. 38 heads on second floor. Flow switch alarm tested — OK.",
        comments: "Wet pipe sprinkler system covering second floor. 38 sprinkler heads verified. Flow switch alarm test performed — alarm triggered within specification. System aligned with UNI EN 12845.",
        notes: "", photos: [],
      },
      "detection-alarm": {
        saved: true, riverifica: false,
        status: "Compliant",
        statusNotes: "8 addressable smoke detectors zones Z5-Z6. All operational. Last service Dec 2025.",
        comments: "Eight addressable smoke detectors on second floor (FACP zones Z5 and Z6). Random spot test of 3 detectors — all responded within specification. Last full service: December 2025.",
        notes: "", photos: [],
      },
      "smoke-heat": {
        saved: true, riverifica: true,
        status: "Non Compliant",
        statusNotes: "SHEV actuator SF-V01 failed during manual test — vent did not open. NC-SF-001.",
        comments: "During manual activation test, SHEV vent SF-V01 (Training Room A roof) failed to open. Actuator found faulty. The remaining 3 vents on second floor opened correctly. Replacement actuator ordered. NC ref: NC-SF-001.",
        notes: "Actuator replacement scheduled — estimated completion 30/08/2026.", photos: [],
      },
      "tech-system": {
        saved: true, riverifica: false,
        status: "To be verified",
        statusNotes: "BMS fire interface integration: alarm relay to BMS confirmed. Lift recall logic verification pending specialist.",
        comments: "Building Management System (BMS) fire interface partially verified. Alarm relay from FACP to BMS confirmed operational. However, lift recall logic (lift to ground floor on fire signal) requires specialist verification — scheduled for next visit.",
        notes: "Specialist appointment to be confirmed with building management.", photos: [],
      },
      "fire-safety-mgmt": {
        saved: true, riverifica: false,
        status: "Compliant",
        statusNotes: "Emergency plan updated Jan 2026. Drill conducted Feb 2026 (82 persons, 3 min 20 s evacuation). Warden list current.",
        comments: "Emergency evacuation plan reviewed — last updated January 2026. Evacuation drill conducted February 2026: 82 persons evacuated in 3 min 20 s (compliant with target < 5 min). Fire warden assignments current. Training records verified.",
        notes: "Next drill scheduled: February 2027.", photos: [],
      },
    },
  };

  // ── Basement: saved floor, zero checks ────────────────────────
  const mockFloor4 = {
    ...createEmptyFloor(),
    id: "mock-floor-bs",
    floorLabel: "Basement",
    areaCategory: "Zone S",
    floorplanDataUrl: null,
    floorplanPins: [],
    checkPins: [],
    comments: "Pump room, electrical switchgear and backup diesel generator. Access restricted to authorised maintenance personnel only. Fire safety aspects of this area are covered by dedicated systems documentation and are outside the scope of this SI inspection.",
    notes: "Ref: electrical switchgear fire suppression system — see separate documentation.",
    riverifica: false,
    savedFloor: true,
    photos: [],
    selectedChecks: [],
    checks: {},
  };

  state.siteInspection = {
    nonPresente: false,
    activeFloorId: mockFloor1.id,
    activeCheckId: null,
    activeStep: 1,
    floors: [mockFloor1, mockFloor2, mockFloor3, mockFloor4],
  };
  // ── PT mock photos (SVG placeholders) ───────────────────────
  const phDetectorTest = _b64(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
<rect width="400" height="300" fill="#111"/>
<rect x="0" y="0" width="400" height="300" fill="url(#g)" opacity="0.3"/>
<circle cx="200" cy="120" r="62" fill="#d8d8d8" stroke="#bbb" stroke-width="4"/>
<circle cx="200" cy="120" r="44" fill="#c4c4c4" stroke="#aaa" stroke-width="2"/>
<circle cx="200" cy="120" r="14" fill="#b0b0b0"/>
<rect x="168" y="98" width="64" height="5" rx="2" fill="#888"/>
<rect x="168" y="108" width="64" height="5" rx="2" fill="#888"/>
<rect x="168" y="118" width="64" height="5" rx="2" fill="#888"/>
<rect x="168" y="128" width="64" height="5" rx="2" fill="#888"/>
<rect x="168" y="138" width="64" height="5" rx="2" fill="#888"/>
<text x="200" y="225" fill="#5AC88A" font-size="12" text-anchor="middle" font-family="Arial" font-weight="bold">✓ PASSED — Response 28 s</text>
<text x="200" y="243" fill="#888" font-size="11" text-anchor="middle" font-family="Arial">Smoke Detector SN DA-2023-0477 · Zone A</text>
<text x="200" y="262" fill="#555" font-size="10" text-anchor="middle" font-family="Arial">T-DA-001 · Ground Floor · Entrance</text>
</svg>`);

  const phFaultyCallPoint = _b64(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
<rect width="400" height="300" fill="#111"/>
<rect x="130" y="60" width="140" height="140" rx="8" fill="#cc3333" stroke="#ff4444" stroke-width="3"/>
<rect x="145" y="75" width="110" height="110" rx="4" fill="#aa2222"/>
<text x="200" y="145" fill="white" font-size="36" text-anchor="middle" font-family="Arial" font-weight="bold">!</text>
<text x="200" y="162" fill="#ffaaaa" font-size="11" text-anchor="middle" font-family="Arial">BREAK GLASS</text>
<text x="200" y="235" fill="#E07070" font-size="12" text-anchor="middle" font-family="Arial" font-weight="bold">✗ FAILED — MCP-2F-03 non-responsive</text>
<text x="200" y="253" fill="#888" font-size="11" text-anchor="middle" font-family="Arial">Call Point · Training Room A · 2nd Floor</text>
<text x="200" y="271" fill="#555" font-size="10" text-anchor="middle" font-family="Arial">T-DA-004 · Fault logged · Unit replaced</text>
</svg>`);

  const phFacultyPanel = _b64(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
<rect width="400" height="300" fill="#111"/>
<rect x="60" y="40" width="280" height="200" rx="6" fill="#1e2a3a" stroke="#3a5a7a" stroke-width="3"/>
<rect x="75" y="55" width="250" height="30" rx="3" fill="#0d3a5a"/>
<text x="200" y="76" fill="#5ac8fa" font-size="12" text-anchor="middle" font-family="Arial" font-weight="bold">FIRE ALARM CONTROL PANEL</text>
<rect x="75" y="95" width="250" height="20" rx="2" fill="#0a2a0a"/>
<text x="200" y="110" fill="#5AC88A" font-size="11" text-anchor="middle" font-family="Arial">● SYSTEM NORMAL — 4 ZONES ACTIVE</text>
<rect x="90" y="125" width="50" height="30" rx="3" fill="#1a3a1a" stroke="#5AC88A" stroke-width="1"/>
<text x="115" y="145" fill="#5AC88A" font-size="9" text-anchor="middle" font-family="Arial">Z1 OK</text>
<rect x="150" y="125" width="50" height="30" rx="3" fill="#1a3a1a" stroke="#5AC88A" stroke-width="1"/>
<text x="175" y="145" fill="#5AC88A" font-size="9" text-anchor="middle" font-family="Arial">Z2 OK</text>
<rect x="210" y="125" width="50" height="30" rx="3" fill="#1a3a1a" stroke="#5AC88A" stroke-width="1"/>
<text x="235" y="145" fill="#5AC88A" font-size="9" text-anchor="middle" font-family="Arial">Z3 OK</text>
<rect x="270" y="125" width="50" height="30" rx="3" fill="#1a3a1a" stroke="#5AC88A" stroke-width="1"/>
<text x="295" y="145" fill="#5AC88A" font-size="9" text-anchor="middle" font-family="Arial">Z4 OK</text>
<text x="200" y="235" fill="#5AC88A" font-size="12" text-anchor="middle" font-family="Arial" font-weight="bold">✓ PASSED — All zones normal</text>
<text x="200" y="252" fill="#888" font-size="11" text-anchor="middle" font-family="Arial">FACP · UNI EN 54-2 · Cert. 2345/23</text>
</svg>`);

  const phSprinklerHead = _b64(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
<rect width="400" height="300" fill="#111"/>
<rect x="185" y="40" width="30" height="60" fill="#888" rx="4"/>
<circle cx="200" cy="120" r="20" fill="#c8a050" stroke="#a88030" stroke-width="3"/>
<line x1="200" y1="140" x2="160" y2="180" stroke="#888" stroke-width="8" stroke-linecap="round"/>
<line x1="200" y1="140" x2="240" y2="180" stroke="#888" stroke-width="8" stroke-linecap="round"/>
<line x1="200" y1="140" x2="200" y2="185" stroke="#888" stroke-width="8" stroke-linecap="round"/>
<line x1="200" y1="140" x2="165" y2="155" stroke="#888" stroke-width="6" stroke-linecap="round"/>
<line x1="200" y1="140" x2="235" y2="155" stroke="#888" stroke-width="6" stroke-linecap="round"/>
<text x="200" y="235" fill="#5AC88A" font-size="12" text-anchor="middle" font-family="Arial" font-weight="bold">✓ PASSED — Flow switch at 38 s</text>
<text x="200" y="253" fill="#888" font-size="11" text-anchor="middle" font-family="Arial">Wet pipe sprinkler · Zone S1 · Warehouse</text>
<text x="200" y="271" fill="#555" font-size="10" text-anchor="middle" font-family="Arial">T-AS-001 · UNI EN 12845 compliant</text>
</svg>`);

  const phShevVents = _b64(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
<rect width="400" height="300" fill="#111"/>
<rect x="40" y="60" width="140" height="100" rx="4" fill="#1a2a1a" stroke="#5AC88A" stroke-width="2"/>
<text x="110" y="115" fill="#5AC88A" font-size="11" text-anchor="middle" font-family="Arial">V-001 OPEN</text>
<rect x="220" y="60" width="140" height="100" rx="4" fill="#1a2a1a" stroke="#5AC88A" stroke-width="2"/>
<text x="290" y="115" fill="#5AC88A" font-size="11" text-anchor="middle" font-family="Arial">V-002 OPEN</text>
<rect x="40" y="175" width="140" height="80" rx="4" fill="#1a2a1a" stroke="#5AC88A" stroke-width="2"/>
<text x="110" y="220" fill="#5AC88A" font-size="11" text-anchor="middle" font-family="Arial">V-003 OPEN</text>
<rect x="220" y="175" width="140" height="80" rx="4" fill="#1a2a1a" stroke="#5AC88A" stroke-width="2"/>
<text x="290" y="220" fill="#5AC88A" font-size="11" text-anchor="middle" font-family="Arial">V-004 OPEN</text>
<text x="200" y="285" fill="#5AC88A" font-size="11" text-anchor="middle" font-family="Arial" font-weight="bold">✓ All 4 vents open — 28 s</text>
</svg>`);

  const phFaultyActuator = _b64(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
<rect width="400" height="300" fill="#111"/>
<rect x="120" y="50" width="160" height="130" rx="6" fill="#2a1a1a" stroke="#cc3333" stroke-width="3"/>
<rect x="140" y="70" width="120" height="90" rx="4" fill="#3a2a2a"/>
<line x1="160" y1="90" x2="220" y2="140" stroke="#cc3333" stroke-width="4"/>
<line x1="220" y1="90" x2="160" y2="140" stroke="#cc3333" stroke-width="4"/>
<rect x="150" y="195" width="100" height="20" rx="3" fill="#cc3333" opacity="0.8"/>
<text x="200" y="210" fill="white" font-size="10" text-anchor="middle" font-family="Arial" font-weight="bold">ACTUATOR FAULT</text>
<text x="200" y="245" fill="#E07070" font-size="12" text-anchor="middle" font-family="Arial" font-weight="bold">✗ FAILED — SF-V01 no response</text>
<text x="200" y="263" fill="#888" font-size="11" text-anchor="middle" font-family="Arial">SHEV Actuator · Training Room A · 2nd Fl.</text>
<text x="200" y="281" fill="#555" font-size="10" text-anchor="middle" font-family="Arial">T-SH-002 · NC-SF-001 · Replacement ordered</text>
</svg>`);

  const ptFpDetectionGF = _b64(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380">
<rect width="600" height="380" fill="#0d1b2a"/>
<text x="300" y="18" fill="#2d5a7a" font-size="11" text-anchor="middle" font-family="Arial">DETECTION &amp; ALARM — GROUND FLOOR DETECTOR MAP</text>
<rect x="20" y="28" width="560" height="330" fill="none" stroke="#3a7aaa" stroke-width="3" rx="2"/>
<line x1="200" y1="28" x2="200" y2="358" stroke="#3a7aaa" stroke-width="2"/>
<line x1="400" y1="28" x2="400" y2="218" stroke="#3a7aaa" stroke-width="2"/>
<line x1="200" y1="218" x2="580" y2="218" stroke="#3a7aaa" stroke-width="2"/>
<text x="110" y="120" fill="#2d5a7a" font-size="11" text-anchor="middle" font-family="Arial">RECEPTION</text>
<text x="300" y="120" fill="#2d5a7a" font-size="11" text-anchor="middle" font-family="Arial">OFFICE</text>
<text x="490" y="100" fill="#2d5a7a" font-size="11" text-anchor="middle" font-family="Arial">WAREHOUSE</text>
<text x="390" y="290" fill="#2d5a7a" font-size="11" text-anchor="middle" font-family="Arial">PRODUCTION</text>
<circle cx="110" cy="145" r="8" fill="none" stroke="#3498db" stroke-width="2"/>
<circle cx="110" cy="145" r="4" fill="#3498db"/>
<text x="110" y="168" fill="#3498db" font-size="8" text-anchor="middle" font-family="Arial">D-001 ✓</text>
<circle cx="300" cy="145" r="8" fill="none" stroke="#3498db" stroke-width="2"/>
<circle cx="300" cy="145" r="4" fill="#3498db"/>
<text x="300" y="168" fill="#3498db" font-size="8" text-anchor="middle" font-family="Arial">D-002 ✓</text>
<circle cx="490" cy="100" r="8" fill="none" stroke="#3498db" stroke-width="2"/>
<circle cx="490" cy="100" r="4" fill="#3498db"/>
<text x="490" y="123" fill="#3498db" font-size="8" text-anchor="middle" font-family="Arial">D-003 ✓</text>
<circle cx="390" cy="280" r="8" fill="none" stroke="#3498db" stroke-width="2"/>
<circle cx="390" cy="280" r="4" fill="#3498db"/>
<text x="390" y="303" fill="#3498db" font-size="8" text-anchor="middle" font-family="Arial">D-004 ✓</text>
<circle cx="490" cy="280" r="8" fill="none" stroke="#3498db" stroke-width="2"/>
<circle cx="490" cy="280" r="4" fill="#3498db"/>
<text x="490" y="303" fill="#3498db" font-size="8" text-anchor="middle" font-family="Arial">D-005 ✓</text>
<text x="300" y="372" fill="#2d5a7a" font-size="8" text-anchor="middle" font-family="Arial">● = Tested addressable detector</text>
</svg>`);

  state.plantTests["pt-detection"] = {
    saved: true,
    floorGroups: {
      "Ground Floor": {
        floorplanDataUrl: ptFpDetectionGF,
        photos: [
          { dataUrl: phFacultyPanel, note: "FACP — all zones normal, certifications current" },
        ],
      },
      "First Floor": { floorplanDataUrl: null, photos: [] },
      "Second Floor": {
        floorplanDataUrl: null,
        photos: [
          { dataUrl: phFaultyCallPoint, note: "Faulty call point MCP-2F-03 — replaced after test" },
        ],
      },
    },
    tests: [
      {
        test: "T-DA-001",
        piano: "Ground Floor",
        localizzazione: "Zone A — Entrance / Reception",
        tipoAttivazione: "Automatic",
        expectedResults: "Alarm panel registers within 30 s, sounder activates",
        risultati: "Alarm registered at 28 s. Sounder and strobe activated. All zones normal after reset.",
        status: "Passed",
        photoEvidence: "IMG-DA-001",
        photoDataUrl: phDetectorTest,
      },
      {
        test: "T-DA-002",
        piano: "Ground Floor",
        localizzazione: "Zone A — Production area",
        tipoAttivazione: "Automatic",
        expectedResults: "Detector response within 60 s of smoke introduction",
        risultati: "Response at 42 s. Zone isolation and panel alert confirmed.",
        status: "Passed",
        photoEvidence: "",
        photoDataUrl: null,
      },
      {
        test: "T-DA-003",
        piano: "First Floor",
        localizzazione: "Zone B — Server room",
        tipoAttivazione: "Automatic",
        expectedResults: "Linear detector alarm within 30 s",
        risultati: "Response at 26 s. CO2 detector interlock triggered correctly.",
        status: "Passed",
        photoEvidence: "",
        photoDataUrl: null,
      },
      {
        test: "T-DA-004",
        piano: "Second Floor",
        localizzazione: "Zone C — Training Room A",
        tipoAttivazione: "Manual",
        expectedResults: "Manual call point triggers alarm within 10 s",
        risultati: "FAILED — call point MCP-2F-03 did not trigger panel. Fault logged. Call point replaced.",
        status: "Failed",
        photoEvidence: "IMG-DA-004",
        photoDataUrl: phFaultyCallPoint,
      },
      {
        test: "T-DA-005",
        piano: "Second Floor",
        localizzazione: "Zone C — Open Space C",
        tipoAttivazione: "Automatic",
        expectedResults: "Detector response within 60 s",
        risultati: "Response at 51 s. Zone Z6 alert confirmed.",
        status: "Passed",
        photoEvidence: "",
        photoDataUrl: null,
      },
    ],
  };
  state.plantTests["pt-auto-supp"] = {
    saved: true,
    floorGroups: {
      "Ground Floor": {
        floorplanDataUrl: null,
        photos: [{ dataUrl: phSprinklerHead, note: "Sprinkler head zone S1 — flow switch test" }],
      },
      "Second Floor": { floorplanDataUrl: null, photos: [] },
    },
    tests: [
      {
        test: "T-AS-001",
        piano: "Ground Floor",
        localizzazione: "Zone A — Warehouse / sprinkler zone S1",
        tipoAttivazione: "Automatic",
        expectedResults: "Flow switch alarm at FACP within 60 s of opening test valve",
        risultati: "Flow switch alarm at 38 s. FACP zone S1 alert. Pump start confirmed.",
        status: "Passed",
        photoEvidence: "IMG-AS-001",
        photoDataUrl: phSprinklerHead,
      },
      {
        test: "T-AS-002",
        piano: "Second Floor",
        localizzazione: "Zone C — Open Space C",
        tipoAttivazione: "Automatic",
        expectedResults: "Flow switch alarm and pump start confirmation",
        risultati: "Flow switch alarm at 41 s. Pump start confirmed. System reset normal.",
        status: "Passed",
        photoEvidence: "",
        photoDataUrl: null,
      },
    ],
  };
  state.plantTests["pt-smoke"] = {
    saved: true,
    floorGroups: {},
    tests: [
      {
        test: "T-SH-001",
        piano: "Ground Floor",
        localizzazione: "Zone A — Production area roof vents V-001/V-004",
        tipoAttivazione: "Manual",
        expectedResults: "All 4 roof vents open within 60 s",
        risultati: "V-001 to V-004 fully open at 28 s. SHEV panel shows OPEN status.",
        status: "Passed",
        photoEvidence: "",
      },
      {
        test: "T-SH-002",
        piano: "Second Floor",
        localizzazione: "Zone C — Training Room A, vent SF-V01",
        tipoAttivazione: "Manual",
        expectedResults: "SF-V01 opens within 60 s",
        risultati: "FAILED — SF-V01 actuator did not respond. Faulty actuator confirmed. NC-SF-001 raised.",
        status: "Failed",
        photoEvidence: "",
      },
      {
        test: "T-SH-003",
        piano: "Second Floor",
        localizzazione: "Zone C — Open Space C vents SF-V02/V04",
        tipoAttivazione: "Manual",
        expectedResults: "Vents SF-V02, V03, V04 open within 60 s",
        risultati: "All three vents opened at 31 s. Compliant.",
        status: "Passed",
        photoEvidence: "",
      },
    ],
  };
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
