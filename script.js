const map = L.map("map").setView([49.2331, 28.4682], 8);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

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

async function loadWeather(lat, lon) {
  info.innerHTML = "⏳ Завантаження погоди...";

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m,pressure_msl,cloudcover,precipitation&daily=moon_phase&timezone=Europe/Kyiv`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const w = data.current_weather;

    info.innerHTML = `
      🌡 <b>Температура:</b> ${w.temperature} °C<br>
      💨 <b>Вітер:</b> ${w.windspeed} м/с<br>
      🧭 <b>Напрям вітру:</b> ${w.winddirection}°<br>
      🔵 <b>Тиск:</b> ${data.hourly.pressure_msl[0]} гПа<br>
      💧 <b>Вологість:</b> ${data.hourly.relativehumidity_2m[0]}%<br>
      ☁️ <b>Хмарність:</b> ${data.hourly.cloudcover[0]}%<br>
      🌧 <b>Опади:</b> ${data.hourly.precipitation[0]} мм<br>
      🌙 <b>Фаза Місяця:</b> ${data.daily.moon_phase[0]}<br>
      ⏰ <small>${w.time}</small>
    `;
  } catch (e) {
    console.error(e);
    info.innerHTML = "❌ Помилка завантаження погоди";
  }
}

map.on(L.Draw.Event.CREATED, function (e) {
  drawnItems.clearLayers();
  drawnItems.addLayer(e.layer);
  const c = e.layer.getBounds().getCenter();
  loadWeather(c.lat, c.lng);
});

loadWeather(49.2331, 28.4682);

