// ================== КАРТА ==================
const map = L.map("map").setView([49.2331, 28.4682], 8);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// ================== ВИДІЛЕННЯ ==================
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
  edit: {
    featureGroup: drawnItems
  }
});
map.addControl(drawControl);

// ================== БЛОК ІНФО ==================
const info = document.getElementById("info");

// ================== ПОГОДА ==================
async function loadWeather(lat, lon) {
  info.innerHTML = "⏳ Завантаження погоди...";

  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${lat}` +
    `&longitude=${lon}` +
    `&current_weather=true` +
    `&daily=moon_phase` +
    `&forecast_days=1` +
    `&timezone=Europe/Kyiv`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("API error");

    const data = await response.json();
    const w = data.current_weather;

    info.innerHTML = `
      🌡 <b>Температура:</b> ${w.temperature} °C<br>
      💨 <b>Вітер:</b> ${w.windspeed} м/с<br>
      🧭 <b>Напрям вітру:</b> ${w.winddirection}°<br>
      🌙 <b>Фаза Місяця:</b> ${data.daily.moon_phase[0]}<br>
      ⏰ <small>${w.time}</small>
    `;
  } catch (err) {
    console.error(err);
    info.innerHTML = "❌ Не вдалося завантажити погоду";
  }
}

// ================== ПОДІЯ ВИДІЛЕННЯ ==================
map.on(L.Draw.Event.CREATED, function (e) {
  drawnItems.clearLayers();
  drawnItems.addLayer(e.layer);

  const center = e.layer.getBounds().getCenter();
  loadWeather(center.lat, center.lng);
});

// ================== СТАРТ ==================
loadWeather(49.2331, 28.4682);

