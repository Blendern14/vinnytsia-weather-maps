// ===== КАРТА =====
const map = L.map('map').setView([49.2331, 28.4682], 9);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

// ===== МАЛЮВАННЯ =====
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

// ===== ПОГОДА =====
async function loadWeather(lat, lon) {
  const info = document.getElementById('info');
  info.innerHTML = '⏳ Завантаження погоди...';

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&current_weather=true` +
      `&timezone=Europe/Kyiv`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.current_weather) {
      throw new Error('Немає current_weather');
    }

    const w = data.current_weather;

    info.innerHTML = `
      🌡 Температура: ${w.temperature} °C<br>
      💨 Вітер: ${w.windspeed} км/год<br>
      🧭 Напрямок: ${w.winddirection}°
    `;
  } catch (err) {
    console.error(err);
    info.innerHTML = '❌ Помилка завантаження погоди';
  }
}

// ===== ПОДІЯ ВИДІЛЕННЯ =====
map.on(L.Draw.Event.CREATED, function (e) {
  drawnItems.clearLayers();
  drawnItems.addLayer(e.layer);

  const bounds = e.layer.getBounds();
  const center = bounds.getCenter();

  loadWeather(center.lat, center.lng);
});

