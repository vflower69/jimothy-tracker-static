async function loadSightings() {
  const container = document.getElementById("sightingListContainer");

  try {
    // Fetch backend data
    const response = await fetch("/api/sightings");
    const data = await response.json();

    // Extract the array
    const sightings = data.locations || [];

    // Sort newest → oldest
    sightings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Latest 5
    const recent = sightings.slice(0, 5);

    // Render each sighting
    container.innerHTML = recent
      .map(s => {
        const date = new Date(s.timestamp).toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short"
        });

        const note = s.note && s.note.trim() !== "" 
          ? s.note 
          : "No notes provided.";

        return `
          <div class="p-5 bg-white rounded-lg shadow-sm border border-gray-200">
            <p class="text-sm text-gray-500 mb-1">${date}</p>
            <p class="text-lg font-semibold">Lat: ${s.lat}, Lng: ${s.lng}</p>
            <p class="mt-2 text-gray-700">${note}</p>
          </div>
        `;
      })
      .join("");

  } catch (err) {
    console.error("Error loading sightings:", err);
    container.innerHTML = `
      <p class="text-red-600">Unable to load sightings at this time.</p>
    `;
  }
}

// Load sightings when page loads
document.addEventListener("DOMContentLoaded", loadSightings);
