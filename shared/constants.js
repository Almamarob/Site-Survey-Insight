// ===========================================================
// STATE
// ===========================================================
const state = {
  projectName: "",
  location: {},
  participants: [],
  overview: {},
  siteInspection: {}, // floors-first: { nonPresente, activeFloorId, activeCheckId, activeStep, floors:[...] }
  plantTests: {}, // key: section id → {saved, tests:[]}
  activePtSection: null,
  siNavOpen: false,
  ptNavOpen: false,
  // versioning
  versions: [], // committed snapshots (oldest → newest)
  currentVersionNum: 1, // version number of the current working session
};

// ===========================================================
// SECTIONS & MACROS
// ===========================================================
const SI_SECTIONS = [
  { id: "site-status", label: "Site Status", icon: "SS", macro: "General" },
  {
    id: "fire-reaction",
    label: "Fire Reaction",
    icon: "FR",
    macro: "Protezione Passiv",
  },
  {
    id: "fire-resistance",
    label: "Fire Resistance",
    icon: "RS",
    macro: "Passive Fire Protection",
  },
  {
    id: "compartimentation",
    label: "Compartimentation",
    icon: "CP",
    macro: "Passive Fire Protection",
  },
  { id: "exit-path", label: "Exit Path", icon: "EP", macro: "Means of Egress" },
  {
    id: "refuge-areas",
    label: "Refuge Areas",
    icon: "RA",
    macro: "Means of Egress",
  },
  {
    id: "fire-extinguisher",
    label: "Fire Extinguisher",
    icon: "FE",
    macro: "Active Fire Protection",
  },
  {
    id: "manual-suppression",
    label: "Manual Fire Suppression",
    icon: "MS",
    macro: "Active Fire Protection",
  },
  {
    id: "auto-suppression",
    label: "Automatic Fire Suppression",
    icon: "AS",
    macro: "Active Fire Protection",
  },
  {
    id: "detection-alarm",
    label: "Detection and Alarm",
    icon: "DA",
    macro: "Active Fire Protection",
  },
  {
    id: "smoke-heat",
    label: "Smoke and Heat Control",
    icon: "SH",
    macro: "Active Fire Protection",
  },
  {
    id: "tech-system",
    label: "Technological System",
    icon: "TS",
    macro: "Systems & Management",
  },
  {
    id: "fire-safety-mgmt",
    label: "Fire Safety Management",
    icon: "FM",
    macro: "Systems & Management",
  },
];
const SI_MACROS = [
  "General",
  "Passive Fire Protection",
  "Means of Egress",
  "Active Fire Protection",
  "Systems & Management",
];

const PT_SECTIONS = [
  { id: "pt-detection", label: "Detection and Alarm", icon: "DA" },
  { id: "pt-refuge", label: "Refuge Area System", icon: "RA" },
  { id: "pt-current-tech", label: "Current Tech and Linked Sys", icon: "CT" },
  { id: "pt-manual-supp", label: "Manual Fire Suppression", icon: "MS" },
  { id: "pt-auto-supp", label: "Automatic Fire Suppression", icon: "AS" },
  { id: "pt-smoke", label: "Smoke and Heat Control", icon: "SH" },
];

// 5-column compliance verification grid
// Color palette for compliance checks — used by check plan pins and legend
const CHECK_COLORS = {
  'site-status':        '#4a90d9',
  'fire-reaction':      '#e67e22',
  'fire-resistance':    '#e74c3c',
  'compartimentation':  '#9b59b6',
  'exit-path':          '#27ae60',
  'refuge-areas':       '#1abc9c',
  'fire-extinguisher':  '#f39c12',
  'manual-suppression': '#d35400',
  'auto-suppression':   '#c0392b',
  'detection-alarm':    '#3498db',
  'smoke-heat':         '#778ca3',
  'tech-system':        '#8e44ad',
  'fire-safety-mgmt':   '#8395a7',
};

const COMPLIANCE_CATEGORIES = [
  {
    id: 'general',
    label: 'General',
    items: [{ id: 'site-status', label: 'Site Status' }]
  },
  {
    id: 'passive-fire',
    label: 'Passive Fire Protection',
    items: [
      { id: 'fire-resistance', label: 'Fire Resistance' },
      { id: 'compartimentation', label: 'Compartimentation' }
    ]
  },
  {
    id: 'means-egress',
    label: 'Means of Egress',
    items: [
      { id: 'exit-path', label: 'Exit Path' },
      { id: 'refuge-areas', label: 'Refuge Areas' }
    ]
  },
  {
    id: 'active-fire',
    label: 'Active Fire Protection',
    items: [
      { id: 'fire-extinguisher', label: 'Fire Extinguisher' },
      { id: 'manual-suppression', label: 'Manual Fire Suppression' },
      { id: 'auto-suppression', label: 'Automatic Fire Suppression' },
      { id: 'detection-alarm', label: 'Detection and Alarm' },
      { id: 'smoke-heat', label: 'Smoke and Heat Control' }
    ]
  },
  {
    id: 'systems-mgmt',
    label: 'Systems & Management',
    items: [
      { id: 'tech-system', label: 'Technological System' },
      { id: 'fire-safety-mgmt', label: 'Fire Safety Management' }
    ]
  }
];

const AREA_CATEGORIES = [
  "Ground Floor",
  "First Floor",
  "Second Floor",
  "Third Floor",
  "Basement",
  "Mezzanine",
  "Roof",
  "Exterior",
  "Zone A",
  "Zone B",
  "Zone C",
  "Zone D",
];

