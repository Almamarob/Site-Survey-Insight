function getLocationPageHtml() {
  return `
  <div class="page" id="page-location">
    <div class="section-header">
      <div>
        <h2>Location &amp; Participants</h2>
        <p>Enter location details and inspection participants</p>
      </div>
    </div>
    <div class="card">
      <div class="card-title"><span class="icon">&#128205;</span> Inspection Details</div>
      <div class="form-row cols-3">
        <div class="form-group">
          <label>Inspection Date</label>
          <input type="date" id="loc-date" oninput="updateNumeroVerbale()">
        </div>
        <div class="form-group">
          <label>Inspection No.</label>
          <input type="number" id="loc-nr-sopralluogo" min="1" placeholder="e.g. 1" oninput="updateNumeroVerbale()">
        </div>
        <div class="form-group">
          <label>Report No. (auto)</label>
          <input type="text" id="loc-verbale" placeholder="auto-generated" readonly
            style="background:#f1f5f9;color:var(--text-mid)">
        </div>
      </div>
      <div class="form-row cols-1">
        <div class="form-group">
          <label>Location / Address</label>
          <input type="text" id="loc-luogo" placeholder="e.g. 123 Main St, Milan">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Inspection Type</label>
          <select id="loc-tipo" onchange="updateNumeroVerbale()">
            <option value="">-- Select --</option>
            <option>Initial</option>
            <option>Periodic</option>
            <option>Extraordinary</option>
            <option>Post-Intervention</option>
            <option>System Commissioning</option>
          </select>
        </div>
        <div class="form-group">
          <label>Client / Customer</label>
          <input type="text" id="loc-cliente" placeholder="e.g. ABC Ltd." oninput="updateNumeroVerbale()">
        </div>
      </div>
      <div class="form-row cols-1">
        <div class="form-group">
          <label>Activity Description / Intended Use</label>
          <textarea id="loc-desc" placeholder="Briefly describe the activity carried out in the building..."></textarea>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-title"><span class="icon">&#128101;</span> Participants</div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Full Name</th><th>Role</th>
              <th>Company / Organisation</th><th>Email</th>
              <th style="width:50px"></th>
            </tr>
          </thead>
          <tbody id="participants-body"></tbody>
        </table>
      </div>
      <div class="btn-row">
        <button class="btn btn-secondary btn-sm" onclick="addParticipant()">+ Add Participant</button>
      </div>
      <div class="btn-row">
        <button class="btn btn-primary" onclick="saveLocation()">Save Section</button>
      </div>
    </div>
  </div>`;
}

function getOverviewPageHtml() {
  return `
  <div class="page" id="page-overview">
    <div class="section-header">
      <div>
        <h2>Inspection Overview</h2>
        <p>General notes and inspection summary</p>
      </div>
    </div>
    <div class="card">
      <div class="card-title"><span class="icon">&#128203;</span> General Summary</div>
      <div class="form-row cols-1">
        <div class="form-group">
          <label>Inspection Objective</label>
          <textarea id="ov-obiettivo" placeholder="Describe the main objective of the inspection..."></textarea>
        </div>
      </div>
      <div class="form-row cols-1">
        <div class="form-group">
          <label>General Notes / Preliminary Observations</label>
          <textarea id="ov-note" placeholder="Enter preliminary observations..." style="min-height:120px"></textarea>
        </div>
      </div>
      <div class="form-row cols-1">
        <div class="form-group">
          <label style="display:flex;justify-content:space-between;align-items:center">
            Documentation Reviewed
            <button class="btn btn-secondary btn-sm" style="font-size:11px"
              onclick="document.getElementById('ov-docs').value=autoDocumentation()">
              &#8635; Auto-fill from sections
            </button>
          </label>
          <textarea id="ov-docs"
            placeholder="List the documentation reviewed (certificates, floor plans, fire authority records, etc.)..."></textarea>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Overall Assessment</label>
          <select id="ov-valutazione">
            <option value="">-- Select --</option>
            <option>Compliant</option>
            <option>Partially Compliant</option>
            <option>Non-Compliant</option>
            <option>To be verified</option>
          </select>
        </div>
        <div class="form-group">
          <label>Intervention Priority</label>
          <select id="ov-priorita">
            <option value="">-- Select --</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
            <option>No action required</option>
          </select>
        </div>
      </div>
      <div class="btn-row">
        <button class="btn btn-primary" onclick="saveOverview()">Save Section</button>
      </div>
    </div>
  </div>`;
}
