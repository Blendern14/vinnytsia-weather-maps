// ===== КАРТА =====
const map = L.map("map").setView([49.2331, 28.4682], 8);

// супутник
L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  { attribution: "© Esri Satellite" }
).addTo(map);

// підписи міст
L.tileLayer(
  "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
  { attribution: "© Esri Labels" }
).addTo(map);


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


// ===== ФАЗА МІСЯЦЯ (офлайн) =====
function getMoonPhase() {

  const now = new Date();

  const lp = 2551443;

  const newMoon = new Date(1970, 0, 7, 20, 35, 0);

  const phase = ((now - newMoon) / 1000) % lp;

  const percent = phase / lp;

  if (percent < 0.03) return "🌑 Молодик";
  if (percent < 0.22) return "🌒 Зростаючий серп";
  if (percent < 0.28) return "🌓 Перша чверть";
  if (percent < 0.47) return "🌔 Зростаючий місяць";
  if (percent < 0.53) return "🌕 Повня";
  if (percent < 0.72) return "🌖 Спадаючий місяць";
  if (percent < 0.78) return "🌗 Остання чверть";

  return "🌘 Старий серп";
}


// ===== ПОГОДА =====
async function loadWeather(lat, lon) {

  info.innerHTML = "⏳ Завантаження погоди...";

  try {

    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}` +
      `&longitude=${lon}` +
      `&current_weather=true` +
      `&hourly=pressure_msl,precipitation` +
      `&timezone=auto`;

    const res = await fetch(url);

    const data = await res.json();

    const w = data.current_weather;

    // тиск
    let pressure = "невідомо";

    if (data.hourly && data.hourly.pressure_msl) {
      pressure = Math.round(data.hourly.pressure_msl[0] * 0.75006);
    }

    // опади
    let precipitation = "0";

    if (data.hourly && data.hourly.precipitation) {
      precipitation = data.hourly.precipitation[0];
    }

    info.innerHTML = `
      🌡 <b>Температура:</b> ${w.temperature} °C<br>
      💨 <b>Вітер:</b> ${w.windspeed} км/год<br>
      🌧 <b>Опади:</b> ${precipitation} мм<br>
      🔵 <b>Тиск:</b> ${pressure} мм рт. ст.<br>
      🌙 <b>Фаза місяця:</b> ${getMoonPhase()}<br>
      ⏰ <small>${w.time}</small>
    `;

  }
  catch (e) {

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
