/* =========================================================
   Book & Bugs — Memoria de Proyecto  |  script.js
   Funcionalidades:
     1. Scroll-reveal animations (IntersectionObserver)
     2. Active nav link highlight on scroll
     3. Header shrink on scroll
     4. Hamburger menu (mobile)
     5. Gantt interactivo HTML/CSS (datos reales del PNG)
     6. Canvas animations de fondo (Hex, Symbols, Circuits)
   ========================================================= */

/* ──────────────────────────────────────────────────────────
   6. CANVAS ANIMACIONES — Book & Bugs Cyber-Library
   ────────────────────────────────────────────────────────── */
(function() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  let time = 0;
  let rafId = null;
  
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    canvas.style.display = 'none';
    return;
  }
  
  // Iconos biblioteca + tech
  const bookIcons = ['📚', '📖', '📕', '📗', '🔖', '📔', '📙', '📓'];
  const techIcons = ['◉', '◎', '◇', '◆', '✦', '✧', '⚡', '💡'];
  
  const state = {
    books: [],
    nodes: [],
    packets: [],
    scanlines: [],
    grid: [],
    glows: []
  };
  
  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    
    initBooks();
    initNodes();
    initPackets();
    initScanlines();
    initGrid();
    initGlows();
  }
  
  // 📚 Libros flotando con glow
  function initBooks() {
    state.books = [];
    for (let i = 0; i < 12; i++) {
      state.books.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.15 - Math.random() * 0.25,
        icon: bookIcons[Math.floor(Math.random() * bookIcons.length)],
        scale: 0.4 + Math.random() * 0.8,
        alpha: 0,
        targetAlpha: 0.08 + Math.random() * 0.12,
        glow: 8 + Math.random() * 16,
        rot: (Math.random() - 0.5) * 0.6,
        vRot: (Math.random() - 0.5) * 0.004,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }
  
  function drawBooks() {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (const b of state.books) {
      b.x += b.vx;
      b.y += b.vy;
      b.rot += b.vRot;
      b.pulse += 0.025;
      
      // Fade in/out basado en posición
      const progress = b.y / h;
      if (progress < 0.15) b.alpha += 0.004;
      else if (progress > 0.85) b.alpha -= 0.006;
      else b.alpha += (b.targetAlpha - b.alpha) * 0.02;
      
      // Reset cuando sale
      if (b.y < -60 || b.alpha <= 0) {
        b.y = h + 60;
        b.x = Math.random() * w;
        b.alpha = 0;
        b.icon = bookIcons[Math.floor(Math.random() * bookIcons.length)];
      }
      
      if (b.alpha < 0.015) continue;
      
      const glowPulse = Math.sin(b.pulse) * 0.3 + 0.7;
      const currentGlow = b.glow * glowPulse;
      
      // Glow exterior
      ctx.save();
      ctx.globalAlpha = b.alpha * 0.3;
      ctx.font = `${b.scale * 38}px sans-serif`;
      ctx.shadowColor = '#60a5fa';
      ctx.shadowBlur = currentGlow;
      ctx.fillText(b.icon, b.x, b.y);
      ctx.restore();
      
      // Icono principal
      ctx.globalAlpha = b.alpha;
      ctx.font = `${b.scale * 32}px sans-serif`;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.fillText(b.icon, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  
  // 🔗 Red de nodos cyber
  function initNodes() {
    state.nodes = [];
    const spacing = Math.max(140, Math.min(220, w * 0.09));
    const cols = Math.ceil(w / spacing) + 1;
    const rows = Math.ceil(h / spacing) + 1;
    const grid = [];
    
    for (let gy = 0; gy < rows; gy++) {
      grid[gy] = [];
      for (let gx = 0; gx < cols; gx++) {
        const nx = gx * spacing + (Math.random() - 0.5) * spacing * 0.35;
        const ny = gy * spacing + (Math.random() - 0.5) * spacing * 0.35;
        const n = { 
          x: nx, y: ny, 
          conns: [], 
          pulse: Math.random() * Math.PI * 2,
          isHub: Math.random() > 0.85
        };
        grid[gy][gx] = n;
        state.nodes.push(n);
      }
    }
    
    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        const n = grid[gy][gx];
        if (gx < cols - 1 && Math.random() > 0.22) n.conns.push({ to: grid[gy][gx + 1], delay: 0 });
        if (gy < rows - 1 && Math.random() > 0.22) n.conns.push({ to: grid[gy + 1][gx], delay: 0 });
      }
    }
  }
  
  function drawNodes() {
    ctx.save();
    
    for (const n of state.nodes) {
      n.pulse += 0.02;
      
      for (const conn of n.conns) {
        const pulse = Math.sin(n.pulse + conn.delay) * 0.4 + 0.5;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(conn.to.x, conn.to.y);
        ctx.strokeStyle = `rgba(59, 130, 246, ${0.06 * pulse})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      
      // Nodo
      const nodePulse = Math.sin(n.pulse * 0.6) * 0.5 + 0.5;
      const isHub = n.isHub;
      
      // Glow para hubs
      if (isHub) {
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 12);
        grad.addColorStop(0, `rgba(96, 165, 250, ${0.2 * nodePulse})`);
        grad.addColorStop(1, 'rgba(96, 165, 250, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 12, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.beginPath();
      ctx.arc(n.x, n.y, isHub ? 2.5 : 1.2, 0, Math.PI * 2);
      ctx.fillStyle = isHub 
        ? `rgba(96, 165, 250, ${0.5 + nodePulse * 0.3})`
        : `rgba(96, 165, 250, ${0.3 + nodePulse * 0.2})`;
      ctx.fill();
    }
    ctx.restore();
  }
  
  // 💫 Paquetes de datos moviéndose
  function initPackets() {
    state.packets = [];
    for (let i = 0; i < 15; i++) {
      state.packets.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        r: 1 + Math.random() * 2,
        trail: [],
        maxTrail: 6 + Math.floor(Math.random() * 8)
      });
    }
  }
  
  function drawPackets() {
    for (const p of state.packets) {
      p.x += p.vx;
      p.y += p.vy;
      
      // Wrap
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;
      
      // Trail
      p.trail.unshift({ x: p.x, y: p.y });
      if (p.trail.length > p.maxTrail) p.trail.pop();
      
      // Draw trail
      for (let i = 0; i < p.trail.length; i++) {
        const t = p.trail[i];
        const alpha = (1 - i / p.trail.length) * 0.25;
        const size = p.r * (1 - i / p.trail.length);
        
        ctx.beginPath();
        ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96, 165, 250, ${alpha})`;
        ctx.fill();
      }
      
      // Head
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(147, 197, 253, 0.7)';
      ctx.fill();
    }
  }
  
  // 📺 Scanlines horizontales
  function initScanlines() {
    state.scanlines = [];
    for (let i = 0; i < 3; i++) {
      state.scanlines.push({
        y: Math.random() * h,
        speed: 0.8 + Math.random() * 1.5,
        width: 200 + Math.random() * 400,
        alpha: 0
      });
    }
  }
  
  function drawScanlines() {
    ctx.save();
    
    for (const line of state.scanlines) {
      line.y += line.speed;
      
      if (line.y > h + 100) {
        line.y = -100;
        line.x = Math.random() * w;
        line.width = 200 + Math.random() * 400;
      }
      
      // Appear/disappear
      if (line.y < 50) line.alpha += 0.02;
      else line.alpha = Math.min(line.alpha + 0.01, 0.06);
      if (line.y > h - 50) line.alpha -= 0.03;
      
      if (line.alpha < 0.01) continue;
      
      ctx.globalAlpha = line.alpha;
      
      // Línea principal
      ctx.beginPath();
      ctx.moveTo(line.x, line.y);
      ctx.lineTo(line.x + line.width, line.y);
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Reflejo
      ctx.beginPath();
      ctx.moveTo(line.x, line.y + 2);
      ctx.lineTo(line.x + line.width, line.y + 2);
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.3)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  
  // Grid de fondo sutil
  function initGrid() {
    state.grid = {
      spacing: 60,
      lines: [],
      offset: 0
    };
  }
  
  function drawGrid() {
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 0.5;
    
    const spacing = state.grid.spacing;
    state.grid.offset = (state.grid.offset + 0.15) % spacing;
    
    // Verticales
    for (let x = state.grid.offset; x < w; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    
    // Horizontales
    const vertOffset = (state.grid.offset * 0.5) % spacing;
    for (let y = vertOffset; y < h; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  
  // 🌟 Glow effects centrales
  function initGlows() {
    state.glows = [
      { x: 0.2, y: 0.15, r: 300, color: [59, 130, 246] },
      { x: 0.8, y: 0.85, r: 250, color: [139, 92, 246] }
    ];
  }
  
  function drawGlows() {
    ctx.save();
    
    for (const g of state.glows) {
      const x = g.x * w;
      const y = g.y * h;
      const pulse = Math.sin(time * 0.001) * 0.2 + 0.8;
      
      const grad = ctx.createRadialGradient(x, y, 0, x, y, g.r * pulse);
      grad.addColorStop(0, `rgba(${g.color.join(',')}, 0.06)`);
      grad.addColorStop(0.5, `rgba(${g.color.join(',')}, 0.02)`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
  }
  
  function render(t) {
    time = t;
    ctx.clearRect(0, 0, w, h);
    
    drawGlows();
    drawGrid();
    drawNodes();
    drawPackets();
    drawScanlines();
    drawBooks();
  }
  
  function loop(t) {
    render(t);
    rafId = requestAnimationFrame(loop);
  }
  
  window.addEventListener('resize', () => {
    clearTimeout(window.__rT);
    window.__rT = setTimeout(resize, 120);
  }, { passive: true });
  
  resize();
  rafId = requestAnimationFrame(loop);
})();

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
  { threshold: 0.15 }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* ──────────────────────────────────────────────────────────
   2. ACTIVE NAV LINK (highlight on scroll)
   ────────────────────────────────────────────────────────── */
const sections   = document.querySelectorAll('main section[id]');
const navLinks   = document.querySelectorAll('.nav-links .nav-link');
const mobileLinks= document.querySelectorAll('.mob-link');

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        
        // Handle desktop nav links
        navLinks.forEach((a) => {
          const href = a.getAttribute('href');
          if (href) {
            a.classList.toggle('active', href === `#${id}`);
          }
        });

        // Handle mobile links
        mobileLinks.forEach((a) => {
          const href = a.getAttribute('href');
          if (href) {
            a.classList.toggle('active', href === `#${id}`);
          }
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
window.addEventListener('scroll', () => {
  document.body.classList.toggle('scrolled', window.scrollY > 20);
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

const TOTAL_COLS = 60;

// Definición de columnas del encabezado secundario (vacío, sólo para rellenar)
// El encabezado de meses ya está en HTML, aquí sólo generamos las filas de datos.

const tasks = [
  {
    name:  'Análisis de requisitos',
    type:  'critical',
    start:  1,
    span:   4,
  },
  {
    name:  'Diseño de Base de Datos',
    type:  'normal',
    start:  5,
    span:   3,
  },
  {
    name:  'Diseño de interfaces UI',
    type:  'normal',
    start:  5,
    span:   3,
  },
  {
    name:  'Diseño modelo libros',
    type:  'normal',
    start:  5,
    span:   3,
  },
  {
    name:  'Diseño módulo Admin',
    type:  'normal',
    start:  5,
    span:   3,
  },
  {
    name:  '🎄 Vacaciones de Navidad (18 dic – 4 ene)',
    type:  'vacation',
    start:  8,
    span:   14,
    isVacation: true,
  },
  {
    name:  'Configuración Git',
    type:  'normal',
    start: 22,
    span:   2,
  },
  {
    name:  'Entidades JPA / Hibernate',
    type:  'critical',
    start: 24,
    span:   4,
  },
  {
    name:  'DAO y lógica de datos',
    type:  'critical',
    start: 28,
    span:   8,
  },
  {
    name:  'Controladores / Login',
    type:  'critical',
    start: 28,
    span:   8,
  },
  {
    name:  'CRUD Admin',
    type:  'critical',
    start: 28,
    span:   8,
  },
  {
    name:  'Tienda, Carrito, Historial',
    type:  'critical',
    start: 36,
    span:   7,
  },
  {
    name:  'Libros y comentarios',
    type:  'normal',
    start: 36,
    span:   7,
  },
  {
    name:  'JasperReports',
    type:  'normal',
    start: 43,
    span:   7,
  },
  {
    name:  'Tests y corrección de bugs',
    type:  'test',
    start: 50,
    span:   5,
  },
  {
    name:  'Manual y JavaDoc',
    type:  'normal',
    start: 50,
    span:   5,
  },
  {
    name:  'Memoria final',
    type:  'normal',
    start: 50,
    span:   7,
  },
];

function buildGantt() {
  const tbody = document.getElementById('gantt-body');
  if (!tbody) return;

  tasks.forEach((task) => {
    const tr = document.createElement('tr');
    tr.className = 'gantt-row' + (task.isVacation ? ' vacation-row' : '');

    const tdName = document.createElement('td');
    tdName.className = 'task-name';
    tdName.textContent = task.name;
    tdName.title = task.name;
    tr.appendChild(tdName);

    for (let col = 1; col <= TOTAL_COLS; col++) {
      const td = document.createElement('td');
      td.className = 'bar-cell';

      if (col === task.start) {
        td.setAttribute('colspan', String(task.span));
        const bar = document.createElement('div');
        bar.className = `gantt-bar bar-${task.type}`;
        bar.style.animationDelay = `${(tasks.indexOf(task) * 0.08).toFixed(2)}s`;
        bar.title = task.name;
        td.appendChild(bar);
        tr.appendChild(td);
        col += task.span - 1;
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
