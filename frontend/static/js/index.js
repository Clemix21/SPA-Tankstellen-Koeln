// DOM-Elemente auswählen
const appContainer = document.getElementById("app");
const sortButton = document.getElementById("sortButton");
const searchInput = document.getElementById("searchInput");

// Globale Variable zur Speicherung der Tankstellendaten
let tankstellenData = null;

// Funktion zum Abrufen der JSON-Daten
async function getTankstellenData() {
    try {
        const response = await fetch("https://geoportal.stadt-koeln.de/arcgis/rest/services/verkehr/gefahrgutstrecken/MapServer/0/query?where=objectid+is+not+null&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=4326&havingClause=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=pjson");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
    }
}

// Funktion zum Rendern der Daten in einer Tabelle
function renderData(data) {
    const table = document.createElement("table");
    table.innerHTML = `
        <thead>
            <tr>
                <th>Straße</th>
                <th>PLZ/Ort</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;

    const tbody = table.querySelector("tbody");
    if (data && data.features && data.features.length > 0) {
        data.features.forEach((feature) => {
            const tankstelle = feature.attributes;
            const { adresse } = tankstelle;
            const [strasse, plzOrt] = adresse.split(" (");
            const plzOrtTeile = plzOrt.slice(0, -1).split(" ");
            const plz = plzOrtTeile[0];
            const ort = plzOrtTeile.slice(1).join(" ");

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${strasse}</td>
                <td>${plz} / ${ort}</td>
            `;

            tbody.appendChild(row);
        });
    } else {
        const noDataMessage = document.createElement("p");
        noDataMessage.textContent = "Keine Daten gefunden.";
        appContainer.appendChild(noDataMessage);
    }

    appContainer.innerHTML = "";
    appContainer.appendChild(table);
}

// Funktion zum Filtern der Daten nach Straßennamen
function filterData(searchTerm) {
    if (tankstellenData) {
        const filteredData = tankstellenData.features.filter((feature) => {
            const strasse = feature.attributes.adresse.toLowerCase();
            return strasse.includes(searchTerm.toLowerCase());
        });
        renderData({ features: filteredData });
    }
}

// Funktion zum Sortieren der Daten
function sortData(ascending) {
    if (tankstellenData && tankstellenData.features) {
        tankstellenData.features.sort((a, b) => {
            const strasseA = a.attributes.adresse.toLowerCase();
            const strasseB = b.attributes.adresse.toLowerCase();
            return ascending ? strasseA.localeCompare(strasseB) : strasseB.localeCompare(strasseA);
        });
        renderData(tankstellenData);
    }
}

// Event-Listener für das Suchfeld
searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.trim();
    filterData(searchTerm);
});

// Event-Listener für den Sortieren-Button
sortButton.addEventListener("click", () => {
    const ascending = sortButton.dataset.sortOrder === "asc";
    sortData(!ascending);
    sortButton.dataset.sortOrder = ascending ? "desc" : "asc";
    sortButton.textContent = `Sortieren (${ascending ? "absteigend" : "aufsteigend"})`;
});

// Die SPA starten
async function startApp() {
    tankstellenData = await getTankstellenData();
    renderData(tankstellenData);
}

console.log("Server running on port 5000")

// Die SPA starten
startApp();