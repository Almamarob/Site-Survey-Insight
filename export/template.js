function getHistoryPageHtml() {
  return `<div class="page" id="page-history"><div id="history-content"></div></div>`;
}

function getPreviewPageHtml() {
  return `
  <div class="page" id="page-preview">
    <div class="section-header">
      <div>
        <h2>Report Preview</h2>
        <p>Preview of the report with all saved sections</p>
      </div>
      <button class="btn btn-primary" onclick="navigate('export')">Export PDF</button>
    </div>
    <div id="preview-content"></div>
  </div>
  <div id="preview-lightbox" onclick="previewCloseLightbox()">
    <button id="preview-lightbox-close" onclick="previewCloseLightbox()">&times;</button>
    <img id="preview-lightbox-img" src="" onclick="event.stopPropagation()">
  </div>`;
}

function getExportPageHtml() {
  return `
  <div class="page" id="page-export">
    <div class="export-area">
      <h2>Export Report</h2>
      <p>Download the inspection report with all saved sections.</p>
      <div class="export-cards">
        <div class="export-card">
          <div class="export-card-icon">PDF</div>
          <div class="export-card-title">PDF</div>
          <div class="export-card-desc">Non-editable document, ready for signature and archiving.</div>
          <button class="btn btn-primary" onclick="generatePDF()">Download PDF</button>
        </div>
        <div class="export-card">
          <div class="export-card-icon">W</div>
          <div class="export-card-title">Word (.docx)</div>
          <div class="export-card-desc">Editable document in Microsoft Word or LibreOffice.</div>
          <button class="btn btn-outline" onclick="generateWord()">Download Word</button>
        </div>
      </div>
      <button class="btn btn-secondary" onclick="navigate('preview')" style="margin-top:20px">Report Preview</button>
      <div id="export-info" style="margin-top:20px;color:var(--text-3);font-size:12.5px"></div>
    </div>
  </div>`;
}
