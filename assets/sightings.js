// -------------------------------
// Neighborhood Lookup (simple zones)
// -------------------------------
function getNeighborhood(lat, lng) {
  // Very simple bounding boxes — can refine later
  if (lat > 47.67 && lng < -122.40) return "Ballard";
  if (lat > 47.66 && lng < -122.33) return "Green Lake";
  if (lat > 47.62 && lng < -122.35) return "Queen Anne";
  if (lat > 47.61 && lng < -122.33) return "Downtown Seattle";
  if (lat > 47.65 && lng < -122.30) return "University District";
  if (lat > 47.66 && lng < -122.31) return "Ravenna";
  if (lat > 47.63 && lng < -122.30) return "Capitol Hill";
  if (lat > 47.60 && lng < -122.33) return "Pioneer Square";

  return "Seattle Area";
}

// -------------------------------
// Icon selection based on note
// -------------------------------
function getSightingIcon(note) {
  if (!note || note.trim() === "") return "🦝"; // default raccoon

  const n = note.toLowerCase();

  if (n.includes("water") || n.includes("bay") || n.includes("pond")) return "🌊";
  if (n.includes("park")) return "🌳";
  if (n.includes("crossing") || n.includes("road")) return "🚶";
  if (n.includes("far") || n.includes("not sure")) return "👀";
  if (n.includes("hanging")) return "😎";

  return "🦝";
}

// -------------------------------
// Map preview (static image)
// -------------------------------
function getMapPreview(lat, lng) {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=400x200&markers=color:red|${lat},${lng}&key=YOUR_GOOGLE_MAPS_API_KEY`;
}

// -------------------------------
// Heatmap data (for your map page)
// -------------------------------
function generateHeatmapData(sightings) {
  return sightings.map(s => ({
    lat: s.lat,
    lng: s.lng,
    weight: 1 // You can increase weight for certain notes
  }));
}

// -------------------------------
// Main loader
// -------------------------------
async function loadSightings() {
  const container = document.getElementById("sightingListContainer");

  try {
    const response = await fetch("/api/sightings");
    const data = await response.json();

    const sightings = data.locations || [];

    // Sort newest → oldest
    sightings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Latest 5
    const recent = sightings.slice(0, 5);

    // Render
    container.innerHTML = recent
      .map(s => {
        const date = new Date(s.timestamp).toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short"
        });

        const neighborhood = getNeighborhood(s.lat, s.lng);
        const icon = getSightingIcon(s.note);
        const mapUrl = getMapPreview(s.lat, s.lng);

        const note = s.note && s.note.trim() !== "" 
          ? s.note 
          : "No notes provided.";

        return `
          <div class="p-5 bg-white rounded-lg shadow-sm border border-gray-200 space-y-3">
            <div class="flex items-center gap-3">
              <span class="text-3xl">${icon}</span>
              <div>
                <p class="text-sm text-gray-500">${date}</p>
                <p class="text-lg font-semibold">${neighborhood}</p>
              </div>
            </div>

            <img src="${mapUrl}" 
                 alt="Map preview"
                 class="rounded-lg border border-gray-300" />

            <p class="text-gray-700">${note}</p>

            <p class="text-xs text-gray-500">
              Lat: ${s.lat}, Lng: ${s.lng}
            </p>
          </div>
        `;
      })
      .join("");

    // Make heatmap data available globally
    window.jimothyHeatmapData = generateHeatmapData(sightings);

  } catch (err) {
    console.error("Error loading sightings:", err);
    container.innerHTML = `
      <p class="text-red-600">Unable to load sightings at this time.</p>
    `;
  }
}

document.addEventListener("DOMContentLoaded", loadSightings);
