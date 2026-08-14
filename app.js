// ===========================================================
// INIT — inject HTML from templates, then boot
// ===========================================================
document.getElementById("header").innerHTML = getHeaderHtml();
document.getElementById("sidebar").innerHTML = getSidebarHtml();
document.getElementById("content").innerHTML = [
  getGettingStartedPageHtml(),
  getLocationPageHtml(),
  getOverviewPageHtml(),
  getSiPageHtml(),
  getPtPageHtml(),
  getHistoryPageHtml(),
  getPreviewPageHtml(),
  getExportPageHtml(),
].join("");

renderSiSidebarItems();
renderPtSidebarItems();
renderParticipants();
renderGettingStarted();
updateVersionDisplay();
