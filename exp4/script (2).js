// ---------- API endpoints (Open-Meteo: free, no API key) ----------
const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

// ---------- State ----------
let units = "metric";     // "metric" = °C, km/h  |  "imperial" = °F, mph
let place = null;         // { name, latitude, longitude }
let requestId = 0;        // used to ignore out-of-date responses

// ---------- DOM elements ----------
const form = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const locateBtn = document.getElementById("locate-btn");
const unitButtons = document.querySelectorAll(".unit-btn");
const statusEl = document.getElementById("status");
const dashboard = document.getElementById("dashboard");

const el = {
  placeName: document.getElementById("place-name"),
  localTime: document.getElementById("local-time"),
  icon: document.getElementById("current-icon"),
  temp: document.getElementById("current-temp"),
  desc: document.getElementById("current-desc"),
  feels: document.getElementById("feels-like"),
  humidity: document.getElementById("humidity"),
  wind: document.getElementById("wind"),
  precip: document.getElementById("precip"),
  sunrise: document.getElementById("sunrise"),
  sunset: document.getElementById("sunset"),
  hourly: document.getElementById("hourly"),
  daily: document.getElementById("daily")
};

// ---------- Weather codes -> text and emoji ----------
function describeWeather(code, isDay) {
  const day = isDay !== 0;
  if (code === 0) return { text: "Clear sky", icon: day ? "☀️" : "🌙" };
  if (code === 1) return { text: "Mostly clear", icon: day ? "🌤️" : "🌙" };
  if (code === 2) return { text: "Partly cloudy", icon: "⛅" };
  if (code === 3) return { text: "Overcast", icon: "☁️" };
  if (code === 45 || code === 48) return { text: "Fog", icon: "🌫️" };
  if (code >= 51 && code <= 55) return { text: "Drizzle", icon: "🌦️" };
  if (code === 56 || code === 57) return { text: "Freezing drizzle", icon: "🌧️" };
  if (code >= 61 && code <= 65) return { text: "Rain", icon: "🌧️" };
  if (code === 66 || code === 67) return { text: "Freezing rain", icon: "🌧️" };
  if (code >= 71 && code <= 75) return { text: "Snow", icon: "🌨️" };
  if (code === 77) return { text: "Snow grains", icon: "🌨️" };
  if (code >= 80 && code <= 82) return { text: "Rain showers", icon: "🌦️" };
  if (code === 85 || code === 86) return { text: "Snow showers", icon: "🌨️" };
  if (code === 95) return { text: "Thunderstorm", icon: "⛈️" };
  if (code === 96 || code === 99) return { text: "Thunderstorm with hail", icon: "⛈️" };
  return { text: "Unknown", icon: "❔" };
}

// ---------- Small helpers ----------
function setStatus(message, isError) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", Boolean(isError));
}

function fetchJson(url) {
  return fetch(url).then(function (response) {
    if (!response.ok) {
      throw new Error("The weather service returned an error (" + response.status + ").");
    }
    return response.json();
  });
}

function round(n) {
  return Math.round(n);
}

function tempUnit() {
  return units === "metric" ? "°C" : "°F";
}

function windUnit() {
  return units === "metric" ? "km/h" : "mph";
}

function precipUnit() {
  return units === "metric" ? "mm" : "in";
}

// API times look like "2026-10-08T14:00" (already in the place's local time)
function formatHour(iso) {
  const hour = Number(iso.slice(11, 13));
  const suffix = hour >= 12 ? "pm" : "am";
  return (hour % 12 || 12) + " " + suffix;
}

function formatClock(iso) {
  const hour = Number(iso.slice(11, 13));
  const minutes = iso.slice(14, 16);
  const suffix = hour >= 12 ? "pm" : "am";
  return (hour % 12 || 12) + ":" + minutes + " " + suffix;
}

function formatDay(isoDate, index) {
  if (index === 0) return "Today";
  const date = new Date(isoDate + "T12:00:00");
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

function formatLongDate(iso) {
  const date = new Date(iso.slice(0, 10) + "T12:00:00");
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }) +
    ", " + formatClock(iso);
}

// Build a small <li> with spans, using textContent (safe, no HTML injection)
function makeItem(className, parts) {
  const li = document.createElement("li");
  li.className = className;
  parts.forEach(function (part) {
    const span = document.createElement("span");
    span.className = part.cls;
    span.textContent = part.text;
    if (part.label) span.setAttribute("aria-label", part.label);
    li.appendChild(span);
  });
  return li;
}

// ---------- Step 1: turn a city name into coordinates ----------
function findCity(name) {
  const url = GEOCODE_URL + "?name=" + encodeURIComponent(name) + "&count=1&language=en&format=json";
  return fetchJson(url).then(function (data) {
    if (!data.results || data.results.length === 0) {
      throw new Error('No place found for "' + name + '". Check the spelling and try again.');
    }
    const r = data.results[0];
    const label = [r.name, r.admin1, r.country].filter(Boolean).join(", ");
    return { name: label, latitude: r.latitude, longitude: r.longitude };
  });
}

// ---------- Step 2: get the forecast for those coordinates ----------
function getForecast(p) {
  const params = new URLSearchParams({
    latitude: p.latitude,
    longitude: p.longitude,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",
    hourly: "temperature_2m,weather_code,precipitation_probability,is_day",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",
    forecast_days: "7",
    timezone: "auto",
    temperature_unit: units === "metric" ? "celsius" : "fahrenheit",
    wind_speed_unit: units === "metric" ? "kmh" : "mph",
    precipitation_unit: units === "metric" ? "mm" : "inch"
  });
  return fetchJson(FORECAST_URL + "?" + params.toString());
}

// ---------- Step 3: show the data on the page ----------
function renderCurrent(data) {
  const c = data.current;
  const info = describeWeather(c.weather_code, c.is_day);

  el.placeName.textContent = place.name;
  el.localTime.textContent = "Local time: " + formatLongDate(c.time);
  el.icon.textContent = info.icon;
  el.temp.textContent = round(c.temperature_2m) + tempUnit();
  el.desc.textContent = info.text;
  el.feels.textContent = round(c.apparent_temperature) + tempUnit();
  el.humidity.textContent = c.relative_humidity_2m + "%";
  el.wind.textContent = round(c.wind_speed_10m) + " " + windUnit();
  el.precip.textContent = c.precipitation + " " + precipUnit();
  el.sunrise.textContent = formatClock(data.daily.sunrise[0]);
  el.sunset.textContent = formatClock(data.daily.sunset[0]);
}

function renderHourly(data) {
  el.hourly.innerHTML = "";
  const h = data.hourly;

  // Start from the current hour, then show 24 hours
  const startKey = data.current.time.slice(0, 13) + ":00";
  let start = h.time.findIndex(function (t) { return t >= startKey; });
  if (start === -1) start = 0;

  for (let i = start; i < start + 24 && i < h.time.length; i++) {
    const info = describeWeather(h.weather_code[i], h.is_day[i]);
    const rain = h.precipitation_probability[i];
    el.hourly.appendChild(makeItem("hour", [
      { cls: "time", text: i === start ? "Now" : formatHour(h.time[i]) },
      { cls: "icon", text: info.icon, label: info.text },
      { cls: "temp", text: round(h.temperature_2m[i]) + "°" },
      { cls: "rain", text: rain != null ? rain + "%" : "", label: "Chance of rain" }
    ]));
  }
}

function renderDaily(data) {
  el.daily.innerHTML = "";
  const d = data.daily;

  d.time.forEach(function (date, i) {
    const info = describeWeather(d.weather_code[i], 1);
    const rain = d.precipitation_probability_max[i];
    const li = makeItem("day", [
      { cls: "name", text: formatDay(date, i) },
      { cls: "icon", text: info.icon, label: info.text },
      { cls: "range", text: "" },
      { cls: "rain", text: rain != null ? rain + "% rain" : "" }
    ]);

    // High and low temperatures inside the "range" span
    const range = li.querySelector(".range");
    range.textContent = round(d.temperature_2m_max[i]) + "° ";
    const low = document.createElement("span");
    low.className = "lo";
    low.textContent = round(d.temperature_2m_min[i]) + "°";
    range.appendChild(low);

    el.daily.appendChild(li);
  });
}

// ---------- Load and display weather for the current place ----------
function loadWeather() {
  const thisRequest = ++requestId;
  setStatus("Loading weather…", false);

  getForecast(place)
    .then(function (data) {
      if (thisRequest !== requestId) return; // a newer request replaced this one
      renderCurrent(data);
      renderHourly(data);
      renderDaily(data);
      dashboard.hidden = false;
      setStatus("", false);
      document.title = round(data.current.temperature_2m) + tempUnit() + " in " + place.name.split(",")[0] + " – Weather";
    })
    .catch(function (error) {
      if (thisRequest !== requestId) return;
      setStatus(error.message || "Could not load the forecast. Check your connection.", true);
    });
}

// ---------- Search by city ----------
function searchCity(name) {
  const thisRequest = ++requestId;
  setStatus("Searching for " + name + "…", false);

  findCity(name)
    .then(function (found) {
      if (thisRequest !== requestId) return;
      place = found;
      saveLastCity(name);
      loadWeather();
    })
    .catch(function (error) {
      if (thisRequest !== requestId) return;
      setStatus(error.message || "Could not search right now.", true);
    });
}

// ---------- Use the browser's location ----------
function useMyLocation() {
  if (!navigator.geolocation) {
    setStatus("Your browser does not support location.", true);
    return;
  }
  setStatus("Getting your location…", false);

  navigator.geolocation.getCurrentPosition(
    function (pos) {
      place = {
        name: "Your location",
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude
      };
      loadWeather();
    },
    function () {
      setStatus("Could not get your location. Allow location access or search for a city instead.", true);
    },
    { timeout: 10000 }
  );
}

// ---------- Remember the last city (saved in the browser) ----------
function saveLastCity(name) {
  try { localStorage.setItem("weatherLastCity", name); } catch (e) {}
}

function getLastCity() {
  try { return localStorage.getItem("weatherLastCity"); } catch (e) { return null; }
}

// ---------- Events ----------
form.addEventListener("submit", function (event) {
  event.preventDefault();
  const name = cityInput.value.trim();
  if (name) searchCity(name);
});

locateBtn.addEventListener("click", useMyLocation);

unitButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {
    units = btn.dataset.units;
    unitButtons.forEach(function (b) {
      const active = b === btn;
      b.classList.toggle("active", active);
      b.setAttribute("aria-pressed", String(active));
    });
    if (place) loadWeather(); // re-fetch in the new units
  });
});

// ---------- Start: show the last searched city, or London ----------
const first = getLastCity() || "London";
cityInput.value = first;
searchCity(first);
