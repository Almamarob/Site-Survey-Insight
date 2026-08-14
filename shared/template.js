function getHeaderHtml() {
  return `
    <div class="logo-icon">
      <img src="images/logo_icon_transparent.png" alt="Site Insight logo"
        style="width:22px;height:22px;object-fit:contain">
    </div>
    <span class="app-title">Site Insight</span>
    <span id="project-name-display"></span>
    <span id="version-display" class="version-pill" style="display:none"></span>
    <span class="app-subtitle">Fire Safety Inspection Platform</span>`;
}

function getSidebarHtml() {
  return `
    <div class="sidebar-section-label">Navigation</div>
    <div class="nav-item active" onclick="navigate('getting-started')" id="nav-getting-started">
      <span class="nav-icon">GS</span> Getting Started
    </div>
    <div class="nav-item" onclick="navigate('location')" id="nav-location">
      <span class="nav-icon">LP</span> Location &amp; Participants
    </div>
    <div class="nav-item" onclick="navigate('overview')" id="nav-overview">
      <span class="nav-icon">IO</span> Inspection Overview
    </div>
    <hr>
    <div class="sidebar-section-label">Inspection</div>
    <div class="nav-group-toggle" onclick="toggleSiNav()" id="nav-site-inspection">
      <span class="nav-icon">SI</span>
      <span class="nav-group-label">Site Inspection</span>
      <span class="nav-badge" id="badge-site">0</span>
      <span class="nav-arrow" id="si-arrow">&#9658;</span>
    </div>
    <div class="nav-sub-group" id="si-nav-group"></div>
    <div class="nav-group-toggle" onclick="togglePtNav()" id="nav-plant-tests">
      <span class="nav-icon">PT</span>
      <span class="nav-group-label">Plant Tests</span>
      <span class="nav-badge" id="badge-plant">0</span>
      <span class="nav-arrow" id="pt-arrow">&#9658;</span>
    </div>
    <div class="nav-sub-group" id="pt-nav-group"></div>
    <hr>
    <div class="sidebar-section-label">Project</div>
    <div class="nav-item" onclick="navigate('history')" id="nav-history">
      <span class="nav-icon">VS</span> Version History
    </div>
    <hr>
    <div class="sidebar-section-label">Output</div>
    <div class="nav-item" onclick="navigate('preview')" id="nav-preview">
      <span class="nav-icon">PV</span> Preview
    </div>
    <div class="nav-item" onclick="navigate('export')" id="nav-export">
      <span class="nav-icon">EX</span> Export
    </div>`;
}

function getGettingStartedPageHtml() {
  return `<div class="page active" id="page-getting-started"><div id="gs-content"></div></div>`;
}
