const parcelLayers = {};
let currentView = "buyer";
// ================= BACKEND CONNECTION =================

const API_BASE = "/api";

async function getBackendLandRecord(id) {
    try {
        const response = await fetch(
            `${API_BASE}/land/${encodeURIComponent(id)}`
        );

        if (!response.ok) {
            throw new Error("Backend record not found");
        }

        const result = await response.json();

        if (result.success) {
            return result.data;
        }

        return null;

    } catch (error) {
        console.error("Backend connection error:", error);
        return null;
    }
}

function applyBackendRecord(record) {

    if (!record) return;

    const id = record.surveyNo;

    revenueData[id] = {
        surveyNo: record.surveyNo,
        area: record.area,
        landUse: record.landUse,
        rorStatus: record.rorStatus
    };

    registrationData[id] = {
        registeredArea: record.registeredArea,
        registrationStatus: record.registrationStatus
    };

    planningData[id] = {
        zone: record.zone
    };

    taxData[id] = {
        taxStatus: record.taxStatus
    };

    buildingData[id] = {
        permission: record.buildingPermission
    };

    gisData[id] = {
        roadAccess: record.roadAccess
    };

    ownershipData[id] = {
        ownerStatus: record.ownerStatus
    };

    conversionData[id] = {
        conversionStatus: record.conversionStatus
    };

    restrictionData[id] = {
        restriction: record.restriction
    };

    encumbranceData[id] = {
        encumbrance: record.encumbrance
    };

    console.log("Backend data applied:", id);
}


const map = L.map("map").setView([16.50, 80.50], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
}).addTo(map);

function getParcelColor(id) {
    const use = revenueData[id].landUse;

    if (use === "Agricultural") return "green";
    if (use === "Residential") return "blue";
    if (use === "Commercial") return "orange";

    return "gray";
}

function getDueDiligenceResult(id) {
    const r = revenueData[id];
    const reg = registrationData[id];
    const own = ownershipData[id];
    const tax = taxData[id];
    const gis = gisData[id];
    const conv = conversionData[id];
    const restriction = restrictionData[id];
    const enc = encumbranceData[id];

    let issues = [];

    if (r.area !== reg.registeredArea)
        issues.push("Area mismatch between Revenue and Registration records");

    if (own.ownerStatus !== "Verified")
        issues.push("Ownership verification required");

    if (tax.taxStatus !== "Paid")
        issues.push("Property tax is pending");

    if (gis.roadAccess !== "Yes")
        issues.push("Road access is not available");

    if (
        r.landUse !== "Agricultural" &&
        conv.conversionStatus !== "Completed"
    )
        issues.push("Land-use conversion is not completed");

    if (restriction.restriction !== "None")
        issues.push("Planning restriction: " + restriction.restriction);

    if (enc.encumbrance !== "None Found")
        issues.push("Encumbrance/document verification required");

    let status = "CLEAR TO PROCEED";

    if (issues.length >= 3)
        status = "HIGH ATTENTION";
    else if (issues.length > 0)
        status = "VERIFICATION REQUIRED";

    return {
        status: status,
        issues: issues
    };
}

function generateBuyerView(id) {
    const r = revenueData[id];
    const reg = registrationData[id];
    const plan = planningData[id];
    const tax = taxData[id];
    const build = buildingData[id];
    const gis = gisData[id];
    const own = ownershipData[id];
    const conv = conversionData[id];
    const restriction = restrictionData[id];
    const enc = encumbranceData[id];
    const due = getDueDiligenceResult(id);

    let statusClass =
        due.status === "CLEAR TO PROCEED"
            ? "clear-status"
            : "attention-status";

    let issuesHTML = due.issues.length
        ? `<ul class="issue-list">${due.issues.map(x => `<li>${x}</li>`).join("")}</ul>`
        : `<div class="no-issues">✓ No major issues detected in demo records.</div>`;

    document.getElementById("parcelInfo").innerHTML = `
        <div class="parcel-header">
            <div>
                <h2>Survey No. ${id}</h2>
                <p>Integrated Land Information</p>
            </div>
            <div class="${statusClass}">${due.status}</div>
        </div>

        <div class="buyer-summary">
            <div class="buyer-main-details">
                <h3>🏠 Land Summary</h3>

                <div class="data-grid">
                    <div class="data-card">
                        <strong>Area</strong>
                        <span>${r.area} sq.m</span>
                    </div>

                    <div class="data-card">
                        <strong>Land Use</strong>
                        <span>${r.landUse}</span>
                    </div>

                    <div class="data-card">
                        <strong>Ownership</strong>
                        <span>${own.ownerStatus}</span>
                    </div>

                    <div class="data-card">
                        <strong>Registration</strong>
                        <span>${reg.registrationStatus}</span>
                    </div>
                </div>
            </div>

            <div class="buyer-checklist">
                <h3>🔍 Important Checks</h3>

                <div class="buyer-cards">
                    <div class="data-card">
                        <strong>Planning Zone</strong>
                        <span>${plan.zone}</span>
                    </div>

                    <div class="data-card">
                        <strong>Property Tax</strong>
                        <span>${tax.taxStatus}</span>
                    </div>

                    <div class="data-card">
                        <strong>Building Permission</strong>
                        <span>${build.permission}</span>
                    </div>

                    <div class="data-card">
                        <strong>Road Access</strong>
                        <span>${gis.roadAccess}</span>
                    </div>

                    <div class="data-card">
                        <strong>Land Conversion</strong>
                        <span>${conv.conversionStatus}</span>
                    </div>

                    <div class="data-card">
                        <strong>Restrictions</strong>
                        <span>${restriction.restriction}</span>
                    </div>

                    <div class="data-card">
                        <strong>Encumbrance</strong>
                        <span>${enc.encumbrance}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="due-diligence-box">
            <h3>🛡 Due Diligence Screening</h3>

            <div class="screening-summary">
                <div class="summary-item">
                    <strong>Status</strong>
                    <span>${due.status}</span>
                </div>

                <div class="summary-item">
                    <strong>Issues Found</strong>
                    <span>${due.issues.length}</span>
                </div>
            </div>

            <div class="screening-reasons">
                ${issuesHTML}
            </div>
        </div>
    `;
}
function generateOfficialView(id) {
    const r = revenueData[id];
    const reg = registrationData[id];
    const plan = planningData[id];
    const tax = taxData[id];
    const build = buildingData[id];
    const gis = gisData[id];
    const own = ownershipData[id];
    const conv = conversionData[id];
    const restriction = restrictionData[id];
    const enc = encumbranceData[id];
    const due = getDueDiligenceResult(id);

    const statusClass =
        due.status === "CLEAR TO PROCEED"
            ? "clear-status"
            : "attention-status";

    const issues = due.issues.length
        ? `<ul class="issue-list">
            ${due.issues.map(x => `<li>${x}</li>`).join("")}
           </ul>`
        : `<p class="no-issues">✓ Records are consistent in this demo dataset.</p>`;

    document.getElementById("parcelInfo").innerHTML = `
        <div class="parcel-header">
            <div>
                <h2>Survey No. ${id}</h2>
                <p>Official / Engineer Integrated View</p>
            </div>
            <div class="${statusClass}">${due.status}</div>
        </div>

        <div class="official-dashboard">
            <div class="dashboard-stat">
                <strong>Parcel Area</strong>
                <span>${r.area} sq.m</span>
            </div>

            <div class="dashboard-stat">
                <strong>Registered Area</strong>
                <span>${reg.registeredArea} sq.m</span>
            </div>

            <div class="dashboard-stat">
                <strong>Land Use</strong>
                <span>${r.landUse}</span>
            </div>

            <div class="dashboard-stat">
                <strong>Road Access</strong>
                <span>${gis.roadAccess}</span>
            </div>
        </div>

        <div class="department-section">
            <h3>🏛 Department-wise Integrated Records</h3>

            <table class="records-table">
                <thead>
                    <tr>
                        <th>Department / Dataset</th>
                        <th>Information</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td>Revenue / RoR</td>
                        <td>${r.area} sq.m</td>
                        <td>${r.rorStatus}</td>
                    </tr>

                    <tr>
                        <td>Registration</td>
                        <td>${reg.registeredArea} sq.m</td>
                        <td>${reg.registrationStatus}</td>
                    </tr>

                    <tr>
                        <td>Planning</td>
                        <td>${plan.zone}</td>
                        <td>Available</td>
                    </tr>

                    <tr>
                        <td>Property Tax</td>
                        <td>Tax record</td>
                        <td>${tax.taxStatus}</td>
                    </tr>

                    <tr>
                        <td>Building Permission</td>
                        <td>Permission record</td>
                        <td>${build.permission}</td>
                    </tr>

                    <tr>
                        <td>GIS</td>
                        <td>Road access</td>
                        <td>${gis.roadAccess}</td>
                    </tr>

                    <tr>
                        <td>Ownership</td>
                        <td>Ownership verification</td>
                        <td>${own.ownerStatus}</td>
                    </tr>

                    <tr>
                        <td>Land Conversion</td>
                        <td>Conversion record</td>
                        <td>${conv.conversionStatus}</td>
                    </tr>

                    <tr>
                        <td>Restrictions</td>
                        <td>Planning restriction</td>
                        <td>${restriction.restriction}</td>
                    </tr>

                    <tr>
                        <td>Encumbrance</td>
                        <td>Document / EC check</td>
                        <td>${enc.encumbrance}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="consistency-panel">
            <h3>🔗 Cross-Department Consistency Analysis</h3>
            ${issues}
        </div>

        <div class="official-note">
            <strong>System Concept:</strong>
            The Land Stack connects multiple departmental datasets
            using a common parcel / survey identifier.
        </div>

        <div class="buyer-action">
            <button class="report-button"
                onclick="generateLandReport('${id}')">
                🧾 Generate Land Report
            </button>
        </div>

        <div class="demo-warning">
            ⚠️ <strong>Demo Notice:</strong>
            All records shown in this prototype are fictional
            and are created only to demonstrate the Land Stack concept.
        </div>
    `;
}


async function showParcel(id) {// Get latest parcel data from backend
    const backendRecord = await getBackendLandRecord(id);

    if (backendRecord) {
        applyBackendRecord(backendRecord);
    }
    if (!revenueData[id]) return;

    if (currentView === "buyer") {
        generateBuyerView(id);
    } else {
        generateOfficialView(id);
    }

    const section = document.querySelector(".parcel-section");

    if (section) {
        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


function setView(view) {
    currentView = view;

    document.querySelectorAll(".view-button").forEach(button => {
        button.classList.remove("active");
    });

    if (view === "buyer") {
        const button = document.querySelector(
            '.view-button[onclick*="buyer"]'
        );

        if (button) button.classList.add("active");
    } else {
        const button = document.querySelector(
            '.view-button[onclick*="official"]'
        );

        if (button) button.classList.add("active");
    }
}
function createParcel(id, coordinates) {
    const color = getParcelColor(id);
    const due = getDueDiligenceResult(id);
    const r = revenueData[id];
    const reg = registrationData[id];
    const gis = gisData[id];

    const parcel = L.polygon(coordinates, {
        color: color,
        weight: 2,
        fillColor: color,
        fillOpacity: 0.45
    }).addTo(map);

    parcel.bindTooltip(id, {
        permanent: true,
        direction: "center",
        className: "parcel-label"
    });

    let statusIcon = "🟢";
    let statusColor = "#e8f5e9";

    if (due.status === "VERIFICATION REQUIRED") {
        statusIcon = "🟡";
        statusColor = "#fff8e1";
    }

    if (due.status === "HIGH ATTENTION") {
        statusIcon = "🔴";
        statusColor = "#ffebee";
    }

    const popupContent = `
        <div style="min-width:210px;">
            <h3 style="margin:0 0 10px;">
                Survey No. ${id}
            </h3>

            <p><strong>Area:</strong> ${r.area} sq.m</p>
            <p><strong>Land Use:</strong> ${r.landUse}</p>
            <p><strong>Registration:</strong> ${reg.registrationStatus}</p>
            <p><strong>Road Access:</strong> ${gis.roadAccess}</p>

            <div style="
                background:${statusColor};
                padding:8px;
                border-radius:5px;
                margin:8px 0;
                font-weight:bold;
            ">
                ${statusIcon} ${due.status}
            </div>

            <button
                onclick="showParcel('${id}')"
                style="
                    width:100%;
                    padding:8px;
                    border:0;
                    border-radius:5px;
                    background:#123b63;
                    color:white;
                    cursor:pointer;
                "
            >
                View Full Details
            </button>
        </div>
    `;

    parcel.bindPopup(popupContent);

    parcel.on("mouseover", function() {
        this.setStyle({
            weight: 4,
            fillOpacity: 0.65
        });
    });

    parcel.on("mouseout", function() {
        this.setStyle({
            weight: 2,
            fillOpacity: 0.45
        });
    });

    parcel.on("click", function() {
        Object.values(parcelLayers).forEach(layer => {
            layer.setStyle({
                weight: 2,
                fillOpacity: 0.45
            });
        });

        this.setStyle({
            weight: 4,
            fillOpacity: 0.7
        });

        showParcel(id);
    });

    parcelLayers[id] = parcel;
}


// ==========================================
// CREATE FICTIONAL PARCELS
// ==========================================

createParcel("A-101/1", [
    [16.5010,80.4980],
    [16.5010,80.5000],
    [16.4995,80.5000],
    [16.4995,80.4980]
]);

createParcel("A-102/2", [
    [16.5010,80.5002],
    [16.5010,80.5022],
    [16.4995,80.5022],
    [16.4995,80.5002]
]);

createParcel("A-103/1", [
    [16.5010,80.5024],
    [16.5010,80.5044],
    [16.4995,80.5044],
    [16.4995,80.5024]
]);

createParcel("A-104/1", [
    [16.5010,80.5046],
    [16.5010,80.5066],
    [16.4995,80.5066],
    [16.4995,80.5046]
]);

createParcel("A-105/2", [
    [16.4993,80.4980],
    [16.4993,80.5000],
    [16.4978,80.5000],
    [16.4978,80.4980]
]);

createParcel("A-106/1", [
    [16.4993,80.5002],
    [16.4993,80.5022],
    [16.4978,80.5022],
    [16.4978,80.5002]
]);

createParcel("A-107/1", [
    [16.4993,80.5024],
    [16.4993,80.5044],
    [16.4978,80.5044],
    [16.4978,80.5024]
]);

createParcel("A-108/2", [
    [16.4993,80.5046],
    [16.4993,80.5066],
    [16.4978,80.5066],
    [16.4978,80.5046]
]);

createParcel("A-109/1", [
    [16.4976,80.4980],
    [16.4976,80.5000],
    [16.4961,80.5000],
    [16.4961,80.4980]
]);

createParcel("A-110/1", [
    [16.4976,80.5002],
    [16.4976,80.5022],
    [16.4961,80.5022],
    [16.4961,80.5002]
]);

createParcel("A-111/2", [
    [16.4976,80.5024],
    [16.4976,80.5044],
    [16.4961,80.5044],
    [16.4961,80.5024]
]);

createParcel("A-112/1", [
    [16.4976,80.5046],
    [16.4976,80.5066],
    [16.4961,80.5066],
    [16.4961,80.5046]
]);
function searchParcel() {
    const input = document.getElementById("surveySearch");
    const message = document.getElementById("searchMessage");

    const id = input.value.trim().toUpperCase();

    if (!revenueData[id]) {
        message.innerHTML =
            "❌ Survey number not found. Try A-106/1";

        message.style.color = "red";
        return;
    }

    message.innerHTML =
        "✓ Parcel found: " + id;

    message.style.color = "green";

    Object.values(parcelLayers).forEach(layer => {
        layer.setStyle({
            weight: 2,
            fillOpacity: 0.45
        });
    });

    const selected = parcelLayers[id];

    selected.setStyle({
        weight: 4,
        fillOpacity: 0.7
    });

    map.fitBounds(selected.getBounds(), {
        padding: [40, 40]
    });

    selected.openPopup();

    showParcel(id);
}


// ==========================================
// LAND REPORT
// ==========================================

function generateLandReport(id) {
    const r = revenueData[id];
    const reg = registrationData[id];
    const plan = planningData[id];
    const tax = taxData[id];
    const build = buildingData[id];
    const gis = gisData[id];
    const own = ownershipData[id];
    const conv = conversionData[id];
    const restriction = restrictionData[id];
    const enc = encumbranceData[id];
    const due = getDueDiligenceResult(id);

    const win = window.open("", "_blank");

    win.document.write(`
        <html>
        <head>
            <title>Land Report - ${id}</title>

            <style>
                body {
                    font-family: Arial;
                    padding: 30px;
                    color: #222;
                }

                h1 {
                    color: #123b63;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }

                th, td {
                    border: 1px solid #ccc;
                    padding: 10px;
                    text-align: left;
                }

                th {
                    background: #eef3f8;
                }

                .status {
                    padding: 10px;
                    margin: 15px 0;
                    font-weight: bold;
                }

                button {
                    padding: 10px 20px;
                    margin-top: 20px;
                }

                .warning {
                    margin-top: 25px;
                    padding: 12px;
                    background: #fff3cd;
                }
            </style>
        </head>

        <body>

            <h1>Land Stack Integrated Land Report</h1>

            <h2>Survey No. ${id}</h2>

            <div class="status">
                Due Diligence Status:
                ${due.status}
            </div>

            <table>
                <tr>
                    <th>Dataset</th>
                    <th>Information</th>
                </tr>

                <tr>
                    <td>Revenue / RoR</td>
                    <td>${r.area} sq.m - ${r.rorStatus}</td>
                </tr>

                <tr>
                    <td>Registration</td>
                    <td>${reg.registeredArea} sq.m - ${reg.registrationStatus}</td>
                </tr>

                <tr>
                    <td>Land Use</td>
                    <td>${r.landUse}</td>
                </tr>

                <tr>
                    <td>Planning Zone</td>
                    <td>${plan.zone}</td>
                </tr>

                <tr>
                    <td>Property Tax</td>
                    <td>${tax.taxStatus}</td>
                </tr>

                <tr>
                    <td>Building Permission</td>
                    <td>${build.permission}</td>
                </tr>

                <tr>
                    <td>Road Access</td>
                    <td>${gis.roadAccess}</td>
                </tr>

                <tr>
                    <td>Ownership</td>
                    <td>${own.ownerStatus}</td>
                </tr>

                <tr>
                    <td>Land Conversion</td>
                    <td>${conv.conversionStatus}</td>
                </tr>

                <tr>
                    <td>Restriction</td>
                    <td>${restriction.restriction}</td>
                </tr>

                <tr>
                    <td>Encumbrance</td>
                    <td>${enc.encumbrance}</td>
                </tr>
            </table>

            <h2>Due Diligence Findings</h2>

            ${
                due.issues.length
                ? `<ul>${due.issues.map(x => `<li>${x}</li>`).join("")}</ul>`
                : `<p>✓ No major issues detected in demo records.</p>`
            }

            <div class="warning">
                ⚠️ DEMO / FICTIONAL DATA
                <br>
                This report is only a prototype demonstration.
                The information shown is not official government data.
            </div>

            <button onclick="window.print()">
                Print / Save as PDF
            </button>

        </body>
        </html>
    `);

    win.document.close();
}


// ==========================================
// GIS LAYERS
// ==========================================

const roadLayer = L.layerGroup();
const restrictionLayer = L.layerGroup();


function createRoadLayer() {
    Object.keys(parcelLayers).forEach(id => {

        if (gisData[id].roadAccess === "Yes") {

            const center = parcelLayers[id].getBounds().getCenter();

            L.circleMarker(center, {
                radius: 6,
                color: "green",
                fillColor: "green",
                fillOpacity: 0.8
            })
            .bindPopup(
                `<strong>${id}</strong><br>Road Access: Yes`
            )
            .addTo(roadLayer);
        }
    });
}


function createRestrictionLayer() {
    Object.keys(parcelLayers).forEach(id => {

        if (restrictionData[id].restriction !== "None") {

            const center = parcelLayers[id].getBounds().getCenter();

            L.marker(center)
                .bindPopup(`
                    <strong>${id}</strong><br>
                    Restriction: ${restrictionData[id].restriction}
                `)
                .addTo(restrictionLayer);
        }
    });
}


function toggleParcelLayer() {
    const checked =
        document.getElementById("parcelLayerToggle").checked;

    Object.values(parcelLayers).forEach(layer => {

        if (checked) {
            if (!map.hasLayer(layer)) layer.addTo(map);
        } else {
            if (map.hasLayer(layer)) map.removeLayer(layer);
        }
    });
}


function toggleLandUseLayer() {
    const checked =
        document.getElementById("landUseLayerToggle").checked;

    Object.keys(parcelLayers).forEach(id => {

        parcelLayers[id].setStyle({
            fillOpacity: checked ? 0.45 : 0
        });
    });
}


function toggleRoadLayer() {
    const checked =
        document.getElementById("roadLayerToggle").checked;

    if (checked) {
        roadLayer.addTo(map);
    } else {
        map.removeLayer(roadLayer);
    }
}


function toggleRestrictionLayer() {
    const checked =
        document.getElementById("restrictionLayerToggle").checked;

    if (checked) {
        restrictionLayer.addTo(map);
    } else {
        map.removeLayer(restrictionLayer);
    }
}


// ==========================================
// HOME DASHBOARD
// ==========================================

function updateHomeDashboard() {

    const ids = Object.keys(revenueData);

    let clear = 0;
    let verification = 0;
    let attention = 0;

    ids.forEach(id => {

        const result = getDueDiligenceResult(id);

        if (result.status === "CLEAR TO PROCEED") {
            clear++;
        } else if (result.status === "VERIFICATION REQUIRED") {
            verification++;
        } else {
            attention++;
        }
    });

    const total = document.getElementById("totalParcels");
    const clearBox = document.getElementById("clearParcels");
    const verifyBox = document.getElementById("verificationParcels");
    const attentionBox = document.getElementById("attentionParcels");

    if (total) total.textContent = ids.length;
    if (clearBox) clearBox.textContent = clear;
    if (verifyBox) verifyBox.textContent = verification;
    if (attentionBox) attentionBox.textContent = attention;
}


// ==========================================
// START PARCEL SEARCH
// ==========================================

function startParcelSearch() {

    const section = document.querySelector(".map-section");

    if (section) {
        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


// ==========================================
// SHOW ALL PARCELS
// ==========================================

function fitAllParcels() {

    const layers = Object.values(parcelLayers);

    if (!layers.length) return;

    const group = L.featureGroup(layers);

    map.fitBounds(group.getBounds(), {
        padding: [20, 20]
    });
}


// ==========================================
// INITIALIZE
// ==========================================

createRoadLayer();
createRestrictionLayer();

updateHomeDashboard();

fitAllParcels();