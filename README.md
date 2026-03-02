# 🚀 NASA Space Explorer – Pro Edition

Aplicación web interactiva para explorar datos espaciales reales utilizando las APIs oficiales de la NASA.

Permite consultar:

- 🌌 Imagen Astronómica del Día (APOD)
- ☄️ Asteroides cercanos a la Tierra (NeoWs)

## 🌌 ¿Qué permite hacer?

### 📷 APOD – Astronomy Picture of the Day

- Consultar la imagen astronómica del día
- Buscar imágenes por rango de fechas
- Visualizar detalles en modal interactivo
- Descargar imagen en HD
- Guardar en favoritos

### ☄️ Asteroides Cercanos (NeoWs)

- Consultar asteroides en rango máximo de 7 días
- Ver diámetro mínimo y máximo
- Ver velocidad y distancia a la Tierra
- Identificar si es potencialmente peligroso
- Acceder al enlace oficial JPL
- Guardar en favoritos

## 🔭 APIs Utilizadas

### 📡 APOD – Astronomy Picture of the Day

```
https://api.nasa.gov/planetary/apod
```

### ☄️ NeoWs – Near Earth Object Web Service

```
https://api.nasa.gov/neo/rest/v1/feed
```

Documentación oficial:
 https://api.nasa.gov/

## 🏗️ Arquitectura del Proyecto

```
📁 nasa-space-explorer/
│
├── index.html     → Estructura principal
├── styles.css     → Diseño, animaciones y layout
└── app.js         → Lógica, APIs, renderizado y favoritos
```

## 🧠 Tecnologías Utilizada

- HTML5
- CSS3 (Glassmorphism + Animaciones modernas)
- JavaScript ES6+
- Fetch API
- LocalStorage
- Map() para gestión dinámica de modales
- APIs públicas de la NASA

## ❤️ Sistema de Favoritos Avanzado

Características:

- Persistencia con `localStorage`
- Manejo de múltiples tipos de datos (APOD + Asteroides)
- Identificación dinámica según tipo
- Renderizado condicional
- Eliminación en tiempo real

Clave utilizada:

```
nasa_favs
```

## 🧩 Arquitectura Interna (JavaScript)

| Capa          | Responsabilidad                               |
| ------------- | --------------------------------------------- |
| Configuración | API_KEY, BASE_URL, referencias DOM            |
| Servicios     | fetchAPOD(), fetchNeoWs()                     |
| UI Helpers    | toast(), loading(), renderItems()             |
| Componentes   | createApodCard(), createNeoCard()             |
| Modales       | openApodModal(), openNeoModal(), closeModal() |
| Estado        | modalItems (Map), dataset views               |
| Acciones      | loadToday(), loadRange(), loadAsteroids()     |

## 🛡️ Validaciones Implementadas

### APOD

- No permite fechas futuras
- Fecha inicial no puede ser mayor a la final

### Asteroides

- Máximo 7 días por consulta
- Validación de fechas obligatorias
- Orden automático por peligrosidad

## 🎨 Diseño y UX

- Glassmorphism moderno
- Gradientes espaciales
- Hover effects con profundidad
- Animaciones `fadeIn` y `slideUp`
- Modal dinámico interactivo
- Toast de notificaciones
- Diseño completamente responsive

## 📱 Responsive Design

Implementado con CSS Grid adaptable:

```
grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
```

Compatible con:

- Desktop
- Tablet
- Mobile

## 🧪 Flujo de Usuario

1. La aplicación carga automáticamente la imagen del día
2. El usuario puede cambiar a sección de asteroides
3. Selecciona rango de fechas
4. Visualiza resultados en grid dinámico
5. Abre modal con información detallada
6. Guarda o elimina de favoritos
7. Consulta favoritos desde el navbar

## 🛡️ Manejo de Errores

- Toast en errores de conexión
- Control de estado loading
- Mensajes cuando no hay datos disponibles
- Validaciones antes de consumir API

## 🚀 Posibles Mejoras Futuras

-  Soporte para videos en APOD
-  Skeleton loaders
-  Filtros por asteroides peligrosos
-  Backend proxy para ocultar API Key
-  Deploy en Vercel o Netlify
-  Compartir imágenes
-  Paginación inteligente

## 🏆 Objetivo del Proyecto

Este proyecto demuestra:

- Consumo de APIs REST reales
- Manipulación avanzada del DOM
- Gestión de estado en frontend puro
- Persistencia en cliente
- Arquitectura modular sin frameworks
- Experiencia de usuario moderna

## 👨‍💻 Autor

**Tomás Esteban González Quintero**
 D1 

## 📅 Año

2026