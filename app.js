/**
 * CONFIGURACIÓN Y ESTADO
 */
const API_KEY = "4fBvrFSULhZzxjggballHdzFYOTN5TcCLwt59qUL";
const BASE_URL = "https://api.nasa.gov/planetary/apod";
const gallery = document.getElementById("gallery");
const statusContainer = document.getElementById("statusContainer");

// Restringir fecha máxima a hoy
const todayStr = new Date().toISOString().split("T")[0];
document.getElementById("start").max = todayStr;
document.getElementById("end").max = todayStr;

/**
 * SERVICIOS (LÓGICA DE DATOS)
 */
async function apiCall(params = "") {
    showLoading(true);
    try {
        const response = await fetch(`${BASE_URL}?api_key=${API_KEY}${params}`);
        if (!response.ok) throw new Error("Error en la respuesta de la NASA");
        const data = await response.json();
        return Array.isArray(data) ? data : [data];
    } catch (error) {
        showToast("🚀 Error de conexión");
        console.error(error);
        return [];
    } finally {
        showLoading(false);
    }
}

async function neowsApiCall(startDate, endDate) {
    showLoading(true);
    try {
        const response = await fetch(
            `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${API_KEY}`
        );
        if (!response.ok) throw new Error("Error al obtener asteroides");
        const data = await response.json();
        return Object.values(data.near_earth_objects).flat();
    } catch (error) {
        showToast("☄️ Error al obtener asteroides");
        console.error(error);
        return [];
    } finally {
        showLoading(false);
    }
}

/**
 * UI HELPERS
 */
function showToast(msg) {
    const t = document.getElementById("toast");
    t.innerText = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 3000);
}

function showLoading(isLoading) {
    statusContainer.innerHTML = isLoading ? '<div class="loader">Sincronizando con satélites...</div>' : '';
}

function renderGallery(items) {
    gallery.innerHTML = "";
    if (items.length === 0) {
        gallery.innerHTML = "<p style='text-align:center; grid-column: 1/-1;'>No se encontraron imágenes en este sector.</p>";
        return;
    }
    items.filter(item => item.media_type === "image").forEach(createCard);
}

function showControls(section) {
    document.getElementById("apodControls").style.display  = section === "apod"  ? "flex" : "none";
    document.getElementById("neowsControls").style.display = section === "neows" ? "flex" : "none";
}

/**
 * COMPONENTES
 */
function createCard(data) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
        <div class="card-img-container">
            <img src="${data.url}" alt="${data.title}" loading="lazy">
        </div>
        <div class="card-content">
            <small>${data.date}</small>
            <h3>${data.title}</h3>
        </div>
    `;
    card.onclick = () => openModal(data);
    gallery.appendChild(card);
}

function createAsteroidCard(neo) {
    const approach = neo.close_approach_data[0];
    const diameter = neo.estimated_diameter.kilometers;
    const diamAvg  = ((diameter.estimated_diameter_min + diameter.estimated_diameter_max) / 2).toFixed(2);
    const speed    = parseFloat(approach.relative_velocity.kilometers_per_hour).toLocaleString();
    const distance = parseFloat(approach.miss_distance.kilometers).toLocaleString();
    const danger   = neo.is_potentially_hazardous_asteroid;

    const card = document.createElement("div");
    card.className = "card asteroid-card";
    card.innerHTML = `
        <div class="asteroid-header ${danger ? 'danger' : 'safe'}">
            <span>${danger ? '⚠️ PELIGROSO' : '✅ SEGURO'}</span>
            <span class="asteroid-icon">☄️</span>
        </div>
        <div class="card-content">
            <small>${approach.close_approach_date}</small>
            <h3>${neo.name}</h3>
            <div class="asteroid-stats">
                <div class="stat">
                    <span class="stat-label">Diámetro aprox.</span>
                    <span class="stat-value">${diamAvg} km</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Velocidad</span>
                    <span class="stat-value">${speed} km/h</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Distancia a la Tierra</span>
                    <span class="stat-value">${distance} km</span>
                </div>
            </div>
        </div>
    `;
    card.onclick = () => openAsteroidModal(neo);
    gallery.appendChild(card);
}

function openModal(data) {
    const isFavorite = checkIfFavorite(data.date);
    document.getElementById("modalBody").innerHTML = `
        <small style="color:var(--primary)">${data.date}</small>
        <h2 style="margin:10px 0">${data.title}</h2>
        <img src="${data.hdurl || data.url}">
        <p style="line-height:1.6; color:#cbd5e1; margin-bottom:20px">${data.explanation}</p>
        <div style="display:flex; gap:10px">
            <button class="btn" style="background:${isFavorite ? '#ef4444':'#22c55e'}; color:white"
                onclick='toggleFavorite(${JSON.stringify(data).replace(/'/g, "&apos;")})'>
                ${isFavorite ? '🗑️ Eliminar de Favoritos' : '❤️ Guardar en Favoritos'}
            </button>
            <a href="${data.hdurl || data.url}" target="_blank" class="btn" style="background:#334155; color:white; text-decoration:none">
                📥 Descargar HD
            </a>
        </div>
    `;
    document.getElementById("modal").classList.add("active");
    document.body.classList.add("modal-open");
}

function openAsteroidModal(neo) {
    const approach = neo.close_approach_data[0];
    const diameter = neo.estimated_diameter.kilometers;
    const danger   = neo.is_potentially_hazardous_asteroid;
    // ✅ Usamos neo.id como identificador único del asteroide
    const isFavorite = checkIfFavorite(neo.id);

    document.getElementById("modalBody").innerHTML = `
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px">
            <span style="font-size:3rem">☄️</span>
            <div>
                <small style="color:var(--primary)">${approach.close_approach_date}</small>
                <h2 style="margin:4px 0">${neo.name}</h2>
                <span style="background:${danger ? '#ef4444' : '#22c55e'}; color:white; padding:4px 12px; border-radius:20px; font-size:0.8rem; font-weight:700">
                    ${danger ? '⚠️ Potencialmente Peligroso' : '✅ No Peligroso'}
                </span>
            </div>
        </div>
        <div class="asteroid-modal-grid">
            <div class="asteroid-modal-stat">
                <span class="stat-label">Diámetro mínimo</span>
                <span class="stat-value">${diameter.estimated_diameter_min.toFixed(3)} km</span>
            </div>
            <div class="asteroid-modal-stat">
                <span class="stat-label">Diámetro máximo</span>
                <span class="stat-value">${diameter.estimated_diameter_max.toFixed(3)} km</span>
            </div>
            <div class="asteroid-modal-stat">
                <span class="stat-label">Velocidad</span>
                <span class="stat-value">${parseFloat(approach.relative_velocity.kilometers_per_hour).toLocaleString()} km/h</span>
            </div>
            <div class="asteroid-modal-stat">
                <span class="stat-label">Distancia a la Tierra</span>
                <span class="stat-value">${parseFloat(approach.miss_distance.kilometers).toLocaleString()} km</span>
            </div>
            <div class="asteroid-modal-stat">
                <span class="stat-label">Magnitud absoluta</span>
                <span class="stat-value">${neo.absolute_magnitude_h}</span>
            </div>
            <div class="asteroid-modal-stat">
                <span class="stat-label">Fecha aproximación</span>
                <span class="stat-value">${approach.close_approach_date}</span>
            </div>
        </div>
        <div style="display:flex; gap:10px; margin-top:20px">
            <button class="btn" style="background:${isFavorite ? '#ef4444':'#22c55e'}; color:white"
                onclick='toggleAsteroidFavorite(${JSON.stringify(neo).replace(/'/g, "&apos;")})'>
                ${isFavorite ? '🗑️ Eliminar de Favoritos' : '❤️ Guardar en Favoritos'}
            </button>
            <a href="${neo.nasa_jpl_url}" target="_blank" class="btn" style="background:#334155; color:white; text-decoration:none">
                🔗 Ver en NASA JPL
            </a>
        </div>
    `;
    document.getElementById("modal").classList.add("active");
    document.body.classList.add("modal-open");
}

function closeModal() {
    document.getElementById("modal").classList.remove("active");
    document.body.classList.remove("modal-open");
}

/**
 * GESTIÓN DE FAVORITOS (LOCALSTORAGE)
 * Los APOD se identifican por .date
 * Los asteroides se identifican por .id (campo nativo de la API)
 * Ambos conviven en el mismo array nasa_favs con un campo _type para distinguirlos
 */
function getFavorites() {
    return JSON.parse(localStorage.getItem("nasa_favs")) || [];
}

// ID unificado: asteroides usan .id, APOD usan .date
function getFavId(item) {
    return item._type === "asteroid" ? item.id : item.date;
}

function checkIfFavorite(id) {
    return getFavorites().some(f => getFavId(f) === id);
}

// Favorito para APOD
function toggleFavorite(data) {
    let favs = getFavorites();
    const index = favs.findIndex(f => getFavId(f) === data.date);
    if (index === -1) {
        favs.push(data); // APOD no necesita _type, usa .date
        showToast("Guardado en favoritos 🚀");
    } else {
        favs.splice(index, 1);
        showToast("Eliminado de favoritos");
    }
    localStorage.setItem("nasa_favs", JSON.stringify(favs));
    closeModal();
    if (gallery.dataset.view === "favorites") showFavorites();
}

// ✅ NUEVO: Favorito para asteroides
function toggleAsteroidFavorite(neo) {
    let favs = getFavorites();
    const index = favs.findIndex(f => getFavId(f) === neo.id);
    if (index === -1) {
        neo._type = "asteroid"; // marcamos el tipo para distinguirlo en favoritos
        favs.push(neo);
        showToast("Asteroide guardado en favoritos ☄️");
    } else {
        favs.splice(index, 1);
        showToast("Eliminado de favoritos");
    }
    localStorage.setItem("nasa_favs", JSON.stringify(favs));
    closeModal();
    if (gallery.dataset.view === "favorites") showFavorites();
}

function showFavorites() {
    gallery.dataset.view = "favorites";
    showControls("apod");
    gallery.innerHTML = "";
    const favs = getFavorites();
    if (favs.length === 0) {
        gallery.innerHTML = "<p style='text-align:center; grid-column: 1/-1;'>No tienes favoritos guardados.</p>";
        return;
    }
    // ✅ Renderizar cada favorito según su tipo
    favs.forEach(item => {
        if (item._type === "asteroid") {
            createAsteroidCard(item);
        } else {
            createCard(item);
        }
    });
}

/**
 * ACCIONES PRINCIPALES - APOD
 */
async function loadToday() {
    gallery.dataset.view = "all";
    showControls("apod");
    const data = await apiCall();
    renderGallery(data);
}

async function loadRange() {
    const start = document.getElementById("start").value;
    const end   = document.getElementById("end").value;
    if (!start || !end) return showToast("Faltan fechas");
    if (start > end)    return showToast("Fecha inicio mayor a fin");
    gallery.dataset.view = "all";
    showControls("apod");
    const data = await apiCall(`&start_date=${start}&end_date=${end}`);
    renderGallery(data.reverse());
}

/**
 * ACCIONES NEOWS
 */
function showNeowsSection() {
    gallery.dataset.view = "neows";
    showControls("neows");

    const end   = new Date().toISOString().split("T")[0];
    const start = new Date(Date.now() - 6 * 86400000).toISOString().split("T")[0];
    document.getElementById("neowsStart").value = start;
    document.getElementById("neowsEnd").value   = end;
    document.getElementById("neowsStart").max   = todayStr;
    document.getElementById("neowsEnd").max     = todayStr;

    loadAsteroids();
}

async function loadAsteroids() {
    const start = document.getElementById("neowsStart").value;
    const end   = document.getElementById("neowsEnd").value;

    if (!start || !end) return showToast("Selecciona un rango de fechas");
    if (start > end)    return showToast("Fecha inicio mayor a fin");

    const diffDays = (new Date(end) - new Date(start)) / 86400000;
    if (diffDays > 7)  return showToast("⚠️ Máximo 7 días de rango");

    const asteroids = await neowsApiCall(start, end);
    gallery.innerHTML = "";

    if (asteroids.length === 0) {
        gallery.innerHTML = "<p style='text-align:center; grid-column: 1/-1;'>☄️ No se encontraron asteroides.</p>";
        return;
    }

    asteroids
        .sort((a, b) => b.is_potentially_hazardous_asteroid - a.is_potentially_hazardous_asteroid)
        .forEach(createAsteroidCard);
}

// Carga inicial
loadToday();