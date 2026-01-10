// ================= КАРТА =================
const map = L.map("map").setView([49.2331, 28.4682], 8);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// ================= ВИДІЛЕННЯ =================
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

// ================= ПОГОДА =================
const info = document.getElementById("info");

async function loadWeather(lat, lon) {
  info.innerHTML = "⏳ Завантаження погоди...";

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}` +
    `&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,pressure_msl,wind_speed_10m,cloud_cover` +
    `&hourly=precipitation` +
    `&daily=moon_phase` +
    `&timezone=Europe/Kyiv`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const c = data.current;
    const rain = data.hourly.precipitation[0];
    const moon = data.daily.moon_phase[0];

    info.innerHTML = `
      🌡 <b>Температура:</b> ${c.temperature_2m} °C<br>
      🤒 <b>Відчувається як:</b> ${c.apparent_temperature} °C<br>
      💧 <b>Вологість:</b> ${c.relative_humidity_2m}%<br>
      🔵 <b>Тиск:</b> ${c.pressure_msl} гПа<br>
      🌧 <b>Опади:</b> ${rain} мм<br>
      💨 <b>Вітер:</b> ${c.wind_speed_10m} м/с<br>
      ☁️ <b>Хмарність:</b> ${c.cloud_cover}%<br>
      🌙 <b>Фаза Місяця:</b> ${moon}<br>
      ⏰ <small>Оновлено: ${c.time}</small>
    `;
  } catch (e) {
    console.error(e);
    info.innerHTML = "❌ Помилка завантаження погоди";
  }
}

// ================= ПОДІЯ =================
map.on(L.Draw.Event.CREATED, function (e) {
  drawnItems.clearLayers();
  drawnItems.addLayer(e.layer);

  const center = e.layer.getBounds().getCenter();
  loadWeather(center.lat, center.lng);
});

// ================= СТАРТОВА ПОГОДА =================
loadWeather(49.2331, 28.4682);
