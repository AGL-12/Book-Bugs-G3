/* =========================================================
   Book & Bugs — Memoria de Proyecto  |  script.js
   Funcionalidades:
     1. Scroll-reveal animations (IntersectionObserver)
     2. Active nav link highlight on scroll
     3. Header shrink on scroll
     4. Hamburger menu (mobile)
     5. Gantt interactivo HTML/CSS (datos reales del PNG)
   ========================================================= */

/* ──────────────────────────────────────────────────────────
   1. SCROLL-REVEAL
   ────────────────────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // one-shot
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* ──────────────────────────────────────────────────────────
   2. ACTIVE NAV LINK (highlight on scroll)
   ────────────────────────────────────────────────────────── */
const sections   = document.querySelectorAll('main section[id]');
const navLinks   = document.querySelectorAll('.nav-link');
const mobileLinks= document.querySelectorAll('.mob-link');

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((a) => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach((s) => navObserver.observe(s));

/* ──────────────────────────────────────────────────────────
   3. HEADER SHRINK / SHADOW on scroll
   ────────────────────────────────────────────────────────── */
const header = document.getElementById('main-header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    header.style.boxShadow = '0 4px 32px rgba(80,132,193,.18)';
    header.style.background = 'rgba(255,255,255,.95)';
  } else {
    header.style.boxShadow = '0 2px 16px rgba(80,132,193,.10)';
    header.style.background = 'rgba(255,255,255,.82)';
  }
}, { passive: true });

/* ──────────────────────────────────────────────────────────
   4. HAMBURGER MENU (mobile)
   ────────────────────────────────────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
});

// Close menu when a link is clicked
mobileLinks.forEach((link) => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// Close on outside click
document.addEventListener('click', (e) => {
  if (!header.contains(e.target) && !mobileMenu.contains(e.target)) {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
});

/* ──────────────────────────────────────────────────────────
   5. GANTT INTERACTIVO — Datos del Proyecto BookBugs.png
   ────────────────────────────────────────────────────────── */

/**
 * La escala del Gantt cubre 46 celdas de día:
 *   Dic 09 → Dic 26  (18 días)  → columnas 1-18
 *   Nav.   → Ene 07  ( 3 cols representativas de vacaciones)
 *   Ene 08 → Ene 31  (22 días)  → columnas 22-43
 *   Feb 01 → Feb 09  ( 9 días)  → columnas 44-52 (display hasta 9)
 *
 * Cada tarea tiene:  nombre, tipo de barra, columna inicio (1-based), duración (en celdas)
 * Basado exactamente en el diagrama GanttProject del README:
 */

// Referencia de columnas (días):
// Dic: col1=9dic, col2=10dic, ... col12=20dic, col13=22dic, col14=23dic, col15=24dic, col16=26dic
//      (saltamos 19, 20, 21 dic ya pasado)
// VAC: col17=22dic, col18=24dic, col19=5ene (representados con 3 cols de vacaciones)
// Ene: col20=8ene, col21=9ene, col22=12ene...
// (Para simplificar, mapeamos linealmente sobre 46 columnas representativas)

const TOTAL_COLS = 46;

// Definición de columnas del encabezado secundario (vacío, sólo para rellenar)
// El encabezado de meses ya está en HTML, aquí sólo generamos las filas de datos.

const tasks = [
  {
    name:  'Análisis de requisitos y definición de roles y flujos',
    type:  'critical',
    start:  1,   // Dic 9
    span:   3,   // Dic 9–12
  },
  {
    name:  'Diseño de la Base de Datos (Modelo ER y físico)',
    type:  'normal',
    start:  5,   // Dic 15
    span:   3,   // Dic 15–17
  },
  {
    name:  'Diseño de interfaces UI/UX',
    type:  'normal',
    start:  8,   // Dic 17
    span:   3,   // Dic 17–19
  },
  {
    name:  '🎄 Vacaciones de Navidad (22 dic – 7 ene)',
    type:  'vacation',
    start: 12,
    span:   7,
    isVacation: true,
  },
  {
    name:  'Configuración del proyecto, Git y dependencias',
    type:  'normal',
    start: 20,   // Ene 8
    span:   2,   // Ene 8–9
  },
  {
    name:  'Creación de Entidades/Modelos JPA y HibernateUtil',
    type:  'critical',
    start: 23,   // Ene 12
    span:   4,   // Ene 12–15
  },
  {
    name:  'Desarrollo de la lógica de acceso a datos',
    type:  'critical',
    start: 27,   // Ene 15
    span:   8,   // Ene 15–22
  },
  {
    name:  'Desarrollo de controladores: Autenticación y Menús',
    type:  'critical',
    start: 31,   // Ene 21
    span:   7,   // Ene 21–27
  },
  {
    name:  'Desarrollo entorno Cliente: Tienda, Carrito e Historial',
    type:  'critical',
    start: 36,   // Ene 29
    span:   8,   // Ene 29 – Feb 5
  },
  {
    name:  'Creación y ejecución de tests de interfaz gráfica',
    type:  'test',
    start: 40,   // Feb 3
    span:   7,   // Feb 3–9
  },
  {
    name:  'Gestión de excepciones, logs y resolución de bugs',
    type:  'test',
    start: 41,   // Feb 4
    span:   3,   // Feb 4–6
  },
  {
    name:  'Redacción del Manual de Usuario y JavaDoc',
    type:  'normal',
    start: 41,   // Feb 4
    span:   3,   // Feb 4–6
  },
  {
    name:  'Elaboración de la Memoria Final web y repaso defensa',
    type:  'normal',
    start: 42,   // Feb 5
    span:   5,   // Feb 5–9
  },
];

function buildGantt() {
  const tbody = document.getElementById('gantt-body');
  if (!tbody) return;

  tasks.forEach((task) => {
    const tr = document.createElement('tr');
    tr.className = 'gantt-row' + (task.isVacation ? ' vacation-row' : '');

    // Nombre de tarea
    const tdName = document.createElement('td');
    tdName.className = 'task-name';
    tdName.textContent = task.name;
    tdName.title = task.name;
    tr.appendChild(tdName);

    // Celdas de timeline
    for (let col = 1; col <= TOTAL_COLS; col++) {
      const td = document.createElement('td');
      td.className = 'bar-cell';

      if (col === task.start) {
        // Crear barra que ocupa 'span' columnas usando colspan
        td.setAttribute('colspan', String(task.span));
        const bar = document.createElement('div');
        bar.className = `gantt-bar bar-${task.type}`;
        bar.style.animationDelay = `${(tasks.indexOf(task) * 0.08).toFixed(2)}s`;
        bar.title = task.name;
        td.appendChild(bar);
        tr.appendChild(td);
        col += task.span - 1; // saltar las columnas ocupadas
      } else {
        tr.appendChild(td);
      }
    }

    tbody.appendChild(tr);
  });
}

// Ejecutar al cargar
buildGantt();

/* ──────────────────────────────────────────────────────────
   6. SMOOTH SCROLL para enlaces internos
   ────────────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const headerH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--header-h')
      ) || 72;
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ──────────────────────────────────────────────────────────
   7. DOWNLOAD BUTTON — efecto pulsación
   ────────────────────────────────────────────────────────── */
const btnDownload = document.getElementById('btn-download');
if (btnDownload) {
  btnDownload.addEventListener('click', (e) => {
    // Si el archivo no existe, prevenir 404 y mostrar mensaje
    fetch(btnDownload.href, { method: 'HEAD' })
      .then((r) => { if (!r.ok) throw new Error(); })
      .catch(() => {
        e.preventDefault();
        alert('📘 El Manual de Usuario aún no está disponible.\nRuta esperada: documents/Manual_Usuario.pdf');
      });
  });
}

/* ──────────────────────────────────────────────────────────
   8. YEAR automático en el footer
   ────────────────────────────────────────────────────────── */
(function() {
  const yearEl = document.querySelector('footer');
  // El año ya está hardcodeado; no necesitamos cambiarlo dinámicamente.
})();
