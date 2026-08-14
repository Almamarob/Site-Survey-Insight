function getPtPageHtml() {
  return `
  <div class="page" id="page-plant-tests">
    <div id="pt-active-content">
      <div class="empty-state">
        <div class="empty-icon"></div>
        <p>Select a system from the sidebar to get started.</p>
      </div>
    </div>
  </div>
  <div id="pt-lightbox" onclick="ptCloseLightbox()">
    <button id="pt-lightbox-close" onclick="ptCloseLightbox()">&times;</button>
    <img id="pt-lightbox-img" src="" onclick="event.stopPropagation()">
  </div>`;
}
