// ===== КАРТА =====
const map = L.map("map").setView([49.2331, 28.4682], 8);

// супутникова карта
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
    polyline: true,
    marker: false,
    circle: false,
    circlemarker: false
  },
  edit: { featureGroup: drawnItems }
});

map.addControl(drawControl);

const info = document.getElementById("info");


// ===== ФАЗА МІСЯЦЯ =====
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


// ===== РОЗРАХУНОК ПЛОЩІ =====
function calculateArea(layer) {
  if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
    const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
    return (area / 1000000).toFixed(2);
  }
  return null;
}


// ===== РОЗРАХУНОК ДИСТАНЦІЇ =====
function calculateDistance(layer) {
  if (layer instanceof L.Polyline) {

    const latlngs = layer.getLatLngs();
    let distance = 0;

    for (let i = 1; i < latlngs.length; i++) {
      distance += latlngs[i - 1].distanceTo(latlngs[i]);
    }

    return (distance / 1000).toFixed(2); // км
  }

  return null;
}


// ===== ПОГОДА =====
async function loadWeather(lat, lon, areaKm = null, distanceKm = null) {

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

    const windMS = (w.windspeed / 3.6).toFixed(1);

    let pressure = "невідомо";
    if (data.hourly?.pressure_msl) {
      pressure = Math.round(data.hourly.pressure_msl[0] * 0.75006);
    }

    let precipitation = "0";
    if (data.hourly?.precipitation) {
      precipitation = data.hourly.precipitation[0];
    }

    info.innerHTML = `
      🌡 <b>Температура:</b> ${w.temperature} °C<br>
      💨 <b>Вітер:</b> ${windMS} м/с<br>
      🌧 <b>Опади:</b> ${precipitation} мм<br>
      🔵 <b>Тиск:</b> ${pressure} мм рт. ст.<br>
      🌙 <b>Фаза місяця:</b> ${getMoonPhase()}<br>
      ⏰ <small>${w.time}</small>
      ${areaKm ? `<br>📐 <b>Площа:</b> ${areaKm} км²` : ""}
      ${distanceKm ? `<br>📏 <b>Дистанція:</b> ${distanceKm} км` : ""}
    `;

  }
  catch (e) {
    console.error(e);
    info.innerHTML = "❌ Немає інтернету";
  }
}


// ===== ПОДІЯ =====
map.on(L.Draw.Event.CREATED, function (e) {

  drawnItems.clearLayers();
  drawnItems.addLayer(e.layer);

  const center = e.layer.getBounds().getCenter();

  const areaKm = calculateArea(e.layer);
  const distanceKm = calculateDistance(e.layer);

  loadWeather(center.lat, center.lng, areaKm, distanceKm);

});


// ===== СТАРТ =====
loadWeather(49.2331, 28.4682);
