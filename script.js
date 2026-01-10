// ===== КАРТА =====
const map = L.map("map").setView([49.2331, 28.4682], 8);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// ===== ВИДІЛЕННЯ =====
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

const drawControl = new L.Control.Draw({
  draw: {
    polygon: true,
    rectangle: true,
    polyline: false,
    marker: false,
    circle: false,
    circlemarker: false
  },
  edit: { featureGroup: drawnItems }
});
map.addControl(drawControl);

const info = document.getElementById("info");

// ===== ПОГОДА =====
async function loadWeather(lat, lon) {
  info.innerHTML = "⏳ Завантаження погоди...";

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}` +
    `&longitude=${lon}` +
    `&current_weather=true` +
    `&timezone=Europe/Kyiv`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("API error");

    const data = await res.json();
    const w = data.current_weather;

    info.innerHTML = `
      🌡 <b>Температура:</b> ${w.temperature} °C<br>
      💨 <b>Вітер:</b> ${w.windspeed} м/с<br>
      🧭 <b>Напрям вітру:</b> ${w.winddirection}°<br>
      ⏰ <small>${w.time}</small>
    `;
  } catch (e) {
    console.error(e);
    info.innerHTML = "❌ Не вдалося завантажити погоду";
  }
}

// ===== ПОДІЯ =====
map.on(L.Draw.Event.CREATED, function (e) {
  drawnItems.clearLayers();
  drawnItems.addLayer(e.layer);
  const c = e.layer.getBounds().getCenter();
  loadWeather(c.lat, c.lng);
});

// ===== СТАРТ =====
loadWeather(49.2331, 28.4682);

