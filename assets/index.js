// ------------------------------
// CONFIG
// ------------------------------
const GITHUB_USER = "YOUR_USERNAME";
const GITHUB_REPO = "YOUR_REPO";
const GITHUB_FILE_PATH = "data/jimothy.json";
const GITHUB_TOKEN = "YOUR_GITHUB_PAT"; // repo:contents write

let map;
let marker;

// ------------------------------
// GOOGLE MAP INIT
// ------------------------------
window.initMap = function () {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 47.6062, lng: -122.3321 },
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
async function updateGitHubFile(newEntry) {
  // Get existing file + SHA
  const metaRes = await fetch(
    `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
    {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
    }
  );
  const meta = await metaRes.json();

  const content = JSON.parse(atob(meta.content));
  content.locations.push(newEntry);

  const updatedContent = btoa(JSON.stringify(content, null, 2));

  // PUT update
  await fetch(
    `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Add Jimothy sighting",
        content: updatedContent,
        sha: meta.sha,
      }),
    }
  );
}
