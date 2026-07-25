// ------------------------------
// CONFIG
// ------------------------------
const GITHUB_USER = "vflower69";
const GITHUB_REPO = "jimothy-tracker-static";
const GITHUB_FILE_PATH = "data/jimothy.json";

let map;
let marker;

// ------------------------------
// GOOGLE MAP INIT
// ------------------------------

//Center the map at the South Entrance of the Seattle Ballard Locks when refresh browser with view of its neighborhood + nearby areas
window.initMap = function () {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 47.66498, lng: -122.39688 },
    zoom: 12,
  });

  // Click to place marker
  map.addListener("click", (e) => {
    placeMarker(e.latLng);
    document.getElementById("locationInput").value =
      `${e.latLng.lat().toFixed(6)}, ${e.latLng.lng().toFixed(6)}`;
  });

  // Autocomplete
  const input = document.getElementById("locationInput");
  const autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry) return;
    placeMarker(place.geometry.location);
    map.panTo(place.geometry.location);
  });

  loadJournal();
};

// ------------------------------
// PLACE MARKER
// ------------------------------
function placeMarker(latLng) {
  if (marker) marker.setMap(null);
  marker = new google.maps.Marker({
    position: latLng,
    map,
  });
}

// ------------------------------
// LOAD JOURNAL
// ------------------------------
async function loadJournal() {
  try {
    const res = await fetch(`https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/${GITHUB_FILE_PATH}`);
    const data = await res.json();

    // Draw markers on map
    loadSightingsOnMap(data.locations);

    const list = document.getElementById("journalList");
    list.innerHTML = "";

    data.locations
      .slice()
      .reverse()
      .forEach((loc) => {
        const li = document.createElement("li");
        li.className = "p-4 bg-white rounded shadow";
        li.innerHTML = `
          <div class="font-semibold">${loc.timestamp}</div>
          <div>${loc.lat}, ${loc.lng}</div>
          <div class="text-sm text-[#858481]">${loc.note || ""}</div>
        `;
        list.appendChild(li);
      });

    document.getElementById("journalError").classList.add("hidden");
  } catch (err) {
    document.getElementById("journalError").classList.remove("hidden");
  }
}

document.getElementById("reloadJournal").onclick = loadJournal;

// ------------------------------
// SUBMIT SIGHTING
// ------------------------------
document.getElementById("sightingForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const location = document.getElementById("locationInput").value.trim();
  const time = document.getElementById("timeInput").value;
  const note = document.getElementById("noteInput").value.trim();

  let lat = null;
  let lng = null;

  // Parse coordinates
  if (location.includes(",")) {
    const [la, ln] = location.split(",").map((x) => parseFloat(x));
    lat = la;
    lng = ln;
  }

  if (!lat || !lng) {
    alert("Please click the map or enter coordinates.");
    return;
  }

  const newEntry = {
    timestamp: new Date(time).toISOString(),
    lat,
    lng,
    note,
  };

  await updateGitHubFile(newEntry);
  await loadJournal();

  alert("Sighting shared!");
});

// ------------------------------
// UPDATE GITHUB FILE
// ------------------------------
async function updateGitHubFile(newEntry, fullPayload) {
  await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/dispatches`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN_JIMOTHY}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github.everest-preview+json"
    },
    body: JSON.stringify({
      event_type: "update-log",
      client_payload: {
        new_entry: newEntry,
        payload: content
      }
    })
  });
}

// ------------------------------
// SUBMIT JIMOTHY LOCATION
// ------------------------------
async function submitFormSighting() {
  // Read comma-separated location input
  const loc = document.getElementById("locationInput").value.trim();
  const note = document.getElementById("noteInput").value.trim();

  if (!loc) {
    alert("Please click the map or enter a location.");
    return;
  }

  // Parse "lat, lng"
  const parts = loc.split(",");
  if (parts.length !== 2) {
    alert("Location must be in 'lat, lng' format.");
    return;
  }

  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);

  if (isNaN(lat) || isNaN(lng)) {
    alert("Latitude and longitude must be valid numbers.");
    return;
  }

  // Timestamp
  const timestamp = new Date().toISOString();

  // Build payload for Cloudflare Worker
  const payload = {
    lat,
    lng,
    timestamp,
    note
  };

  try {
    const res = await fetch("https://api.jimothytracker.org", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success) {
      alert("Jimothy sighting submitted successfully.");
      document.getElementById("noteInput").value = "";
    } else {
      alert("Error submitting sighting: " + data.error);
    }
  } catch (err) {
    alert("Network error: " + err.message);
  }
}

// ---------------------------------------------------
// DRAW ALL SIGHTINGS ON MAP WITH 'J' IN ORANGE CIRCLE
// ---------------------------------------------------
function loadSightingsOnMap(locations) {
  locations.forEach((loc) => {
    new google.maps.Marker({
      position: { lat: loc.lat, lng: loc.lng },
      map,
      label: "J",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "orange",
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: "#b85c00"
      }
    });
  });
}
