// NASA Explorer 

const API_KEY = "4fBvrFSULhZzxjggballHdzFYOTN5TcCLwt59qUL";  // mi clave de la NASA 
const BASE_URL = "https://api.nasa.gov/planetary/apod";       // api de la foto astronómica del día
const G = document.getElementById("gallery");                 // donde van todas las tarjetas
const STATUS = document.getElementById("statusContainer");    // para mostrar el loader
const TODAY = new Date().toISOString().split("T")[0];         // fecha de hoy para limitar los inputs

// limito los date pickers para que no elijan futuro
document.getElementById("start").max = TODAY;
document.getElementById("neowsStart").max = TODAY;
document.getElementById("neowsEnd").max = TODAY;

const modalItems = new Map();          // guardo los objetos que abro en modal para usarlos después
let modalItemIdCounter = 0;            // contador para ids únicos en modales

const $ = id => document.getElementById(id);  // mi shortcut para no escribir tanto

function toast(msg) {                  // muestro mensajes rápidos que desaparecen solos
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}

function loading(on) {                 // activo/desactivo el loader
  STATUS.innerHTML = on ? '<div class="loader">Cargando...</div>' : '';
}

async function fetchAPOD(params = "") {   // traigo foto(s) de APOD
  loading(true);
  try {
    const r = await fetch(`${BASE_URL}?api_key=${API_KEY}${params}`);
    if (!r.ok) throw new Error();
    const d = await r.json();
    return Array.isArray(d) ? d : [d];    // siempre devuelvo array aunque sea una sola
  } catch {
    toast("Error al conectar con NASA");
    return [];
  } finally {
    loading(false);
  }
}

async function fetchNeoWs(start, end) {   // traigo asteroides cercanos en rango
  loading(true);
  try {
    const r = await fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${start}&end_date=${end}&api_key=${API_KEY}`);
    if (!r.ok) throw new Error();
    const d = await r.json();
    return Object.values(d.near_earth_objects || {}).flat();
  } catch {
    toast("Error al cargar asteroides");
    return [];
  } finally {
    loading(false);
  }
}

function showControls(mode) {          // muestro/oculto los controles de fechas según la sección
  $("apodControls").style.display  = mode === "apod"  ? "flex" : "none";
  $("neowsControls").style.display = mode === "neows" ? "flex" : "none";
}

function renderItems(items, isAsteroid = false) {  // limpio galería y creo tarjetas
  G.innerHTML = items.length ? "" : "<p style='text-align:center; grid-column:1/-1'>No hay elementos</p>";
  items.forEach(item => isAsteroid ? createNeoCard(item) : createApodCard(item));
}

function createApodCard(d) {           // tarjeta para foto APOD
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <div class="card-img-container">
      <img src="${d.url}" alt="${d.title}" loading="lazy">
    </div>
    <div class="card-content">
      <small>${d.date}</small>
      <h3>${d.title}</h3>
    </div>`;
  card.onclick = () => openApodModal(d);
  G.appendChild(card);
}

function createNeoCard(n) {            // tarjeta para asteroide con info clave y color de peligro
  const a = n.close_approach_data[0];
  const diam = ((n.estimated_diameter.kilometers.estimated_diameter_min +
                 n.estimated_diameter.kilometers.estimated_diameter_max) / 2).toFixed(2);
  const speed = parseFloat(a.relative_velocity.kilometers_per_hour).toLocaleString();
  const dist  = parseFloat(a.miss_distance.kilometers).toLocaleString();
  const danger = n.is_potentially_hazardous_asteroid;

  const card = document.createElement("div");
  card.className = "card asteroid-card";
  card.innerHTML = `
    <div class="asteroid-header ${danger ? 'danger' : 'safe'}">
      <span>${danger ? '⚠️ PELIGROSO' : '✅ SEGURO'}</span>
      <span class="asteroid-icon">☄️</span>
    </div>
    <div class="card-content">
      <small>${a.close_approach_date}</small>
      <h3>${n.name}</h3>
      <div class="asteroid-stats">
        <div class="stat"><span class="stat-label">Ø aprox</span><span class="stat-value">${diam} km</span></div>
        <div class="stat"><span class="stat-label">Vel</span><span class="stat-value">${speed} km/h</span></div>
        <div class="stat"><span class="stat-label">Dist</span><span class="stat-value">${dist} km</span></div>
      </div>
    </div>`;
  card.onclick = () => openNeoModal(n);
  G.appendChild(card);
}

function openApodModal(d) {            // abro modal con foto, explicación y botones fav/HD
  const itemId = `apod_${modalItemIdCounter++}`;
  modalItems.set(itemId, d);

  const isFav = isFavorite(d.date);
  $("modalBody").innerHTML = `
    <small style="color:var(--primary)">${d.date}</small>
    <h2 style="margin:10px 0">${d.title}</h2>
    <img src="${d.hdurl || d.url}">
    <p style="line-height:1.6; color:#cbd5e1; margin-bottom:20px">${d.explanation}</p>
    <div style="display:flex; gap:10px">
      <button class="btn" style="background:${isFav ? '#ef4444' : '#22c55e'}; color:white"
        onclick="toggleApodById('${itemId}')">
        ${isFav ? '🗑️ Eliminar' : '❤️ Guardar'}
      </button>
      <a href="${d.hdurl || d.url}" target="_blank" class="btn" style="background:#334155; color:white; text-decoration:none">
        📥 HD
      </a>
    </div>`;
  $("modal").classList.add("active");
  document.body.classList.add("modal-open");
}

function openNeoModal(n) {             // modal con detalles del asteroide + fav + link JPL
  const itemId = `neo_${modalItemIdCounter++}`;
  modalItems.set(itemId, n);

  const a = n.close_approach_data[0];
  const diam = n.estimated_diameter.kilometers;
  const danger = n.is_potentially_hazardous_asteroid;
  const isFav = isFavorite(n.id);

  $("modalBody").innerHTML = `
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px">
      <span style="font-size:3rem">☄️</span>
      <div>
        <small style="color:var(--primary)">${a.close_approach_date}</small>
        <h2 style="margin:4px 0">${n.name}</h2>
        <span style="background:${danger ? '#ef4444' : '#22c55e'}; color:white; padding:4px 12px; border-radius:20px; font-size:0.8rem; font-weight:700">
          ${danger ? '⚠️ Peligroso' : '✅ Seguro'}
        </span>
      </div>
    </div>
    <div class="asteroid-modal-grid">
      <div class="asteroid-modal-stat"><span class="stat-label">Ø min</span><span class="stat-value">${diam.estimated_diameter_min.toFixed(3)} km</span></div>
      <div class="asteroid-modal-stat"><span class="stat-label">Ø max</span><span class="stat-value">${diam.estimated_diameter_max.toFixed(3)} km</span></div>
      <div class="asteroid-modal-stat"><span class="stat-label">Vel</span><span class="stat-value">${parseFloat(a.relative_velocity.kilometers_per_hour).toLocaleString()} km/h</span></div>
      <div class="asteroid-modal-stat"><span class="stat-label">Dist</span><span class="stat-value">${parseFloat(a.miss_distance.kilometers).toLocaleString()} km</span></div>
      <div class="asteroid-modal-stat"><span class="stat-label">Mag</span><span class="stat-value">${n.absolute_magnitude_h}</span></div>
    </div>
    <div style="display:flex; gap:10px; margin-top:20px">
      <button class="btn" style="background:${isFav ? '#ef4444' : '#22c55e'}; color:white"
        onclick="toggleNeoById('${itemId}')">
        ${isFav ? '🗑️ Eliminar' : '❤️ Guardar'}
      </button>
      <a href="${n.nasa_jpl_url}" target="_blank" class="btn" style="background:#334155; color:white; text-decoration:none">
        🔗 JPL
      </a>
    </div>`;
  $("modal").classList.add("active");
  document.body.classList.add("modal-open");
}

function closeModal() {                // cierro el modal y quito la clase del body
  $("modal").classList.remove("active");
  document.body.classList.remove("modal-open");
  // Limpiamos los items viejos 
  // modalItems.clear();
}

// Favoritos 

function getFavs() {                   // leo los favoritos guardados en localStorage
  try {
    return JSON.parse(localStorage.getItem("nasa_favs")) || [];
  } catch {
    return [];
  }
}

function favId(item) {                 // obtengo el id único según tipo (date o id)
  return item._type === "asteroid" ? item.id : item.date;
}

function isFavorite(id) {              // chequeo si ya está en favoritos
  return getFavs().some(f => favId(f) === id);
}

function toggleApodById(itemId) {      // agrego o quito APOD de favoritos
  const d = modalItems.get(itemId);
  if (!d) return toast("Error: elemento no encontrado");
  
  let favs = getFavs();
  const idx = favs.findIndex(f => favId(f) === d.date);
  if (idx === -1) {
    favs.push(d);
    toast("Guardado ❤️");
  } else {
    favs.splice(idx, 1);
    toast("Eliminado 🗑️");
  }
  localStorage.setItem("nasa_favs", JSON.stringify(favs));
  closeModal();
  modalItems.delete(itemId);
  if (G.dataset.view === "favorites") showFavorites();
}

function toggleNeoById(itemId) {       // agrego o quito asteroide de favoritos
  const n = modalItems.get(itemId);
  if (!n) return toast("Error: elemento no encontrado");
  
  let favs = getFavs();
  const idx = favs.findIndex(f => favId(f) === n.id);
  if (idx === -1) {
    n._type = "asteroid";
    favs.push(n);
    toast("Guardado ☄️");
  } else {
    favs.splice(idx, 1);
    toast("Eliminado 🗑️");
  }
  localStorage.setItem("nasa_favs", JSON.stringify(favs));
  closeModal();
  modalItems.delete(itemId);
  if (G.dataset.view === "favorites") showFavorites();
}

function showFavorites() {             // renderizo solo los favoritos guardados
  G.dataset.view = "favorites";
  showControls("apod");
  const favs = getFavs();
  if (!favs.length) {
    G.innerHTML = "<p style='text-align:center; grid-column:1/-1'>No tienes favoritos</p>";
    return;
  }
  G.innerHTML = "";
  favs.forEach(f => f._type === "asteroid" ? createNeoCard(f) : createApodCard(f));
}

// Acciones principales

async function loadToday() {           // cargo la foto del día al iniciar
  G.dataset.view = "all";
  showControls("apod");
  renderItems(await fetchAPOD());
}

async function loadRange() {           // cargo rango de fechas para APOD
  const s = $("start").value;
  const e = $("end").value;
  if (!s || !e) return toast("Selecciona ambas fechas");
  if (s > e) return toast("Fecha inicial > final");
  G.dataset.view = "all";
  showControls("apod");
  renderItems((await fetchAPOD(`&start_date=${s}&end_date=${e}`)).reverse());
}

function showNeowsSection() {          // preparo la sección de asteroides (últimos 7 días por defecto)
  G.dataset.view = "neows";
  showControls("neows");
  const end = TODAY;
  const start = new Date(Date.now() - 6 * 86400000).toISOString().split("T")[0];
  $("neowsStart").value = start;
  $("neowsEnd").value = end;
  loadAsteroids();
}

async function loadAsteroids() {       // cargo y muestro asteroides del rango
  const s = $("neowsStart").value;
  const e = $("neowsEnd").value;
  if (!s || !e) return toast("Selecciona fechas");
  if (s > e) return toast("Inicio > fin");
  const days = (new Date(e) - new Date(s)) / 86400000;
  if (days > 7) return toast("Máximo 7 días");
  const data = await fetchNeoWs(s, e);
  G.innerHTML = data.length ? "" : "<p style='text-align:center; grid-column:1/-1'>No hay asteroides</p>";
  data.sort((a,b) => b.is_potentially_hazardous_asteroid - a.is_potentially_hazardous_asteroid)
      .forEach(createNeoCard);
}

// Inicio
loadToday();