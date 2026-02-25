const display = document.querySelector("#display");
const buttons = document.querySelectorAll("button");

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.id === "=") {
      display.value = eval(display.value);
    } else if (btn.id === "ac") {
      display.value = "";
    } else if (btn.id == "de") {
      display.value = display.value.slice(0, -1);
    } else {
      display.value += btn.id
    }
  })
})

// Obtener el elemento h2
const titulo = document.getElementById('titulo');

// Función para generar un color aleatorio en formato hexadecimal
function generarColorAleatorio() {
  const letras = '0123456789ABCDEF';
  let color = '#'; // El color debe empezar con #

  // Generar un color hex (6 caracteres)
  for (let i = 0; i < 6; i++) {
    color += letras[Math.floor(Math.random() * 16)];
  }

  return color;
}

// Función para cambiar el color al hacer clic
function cambiarColorAleatorio() {
  const nuevoColor = generarColorAleatorio();
  titulo.style.color = nuevoColor;  // Asignar el color aleatorio al h2
}

// Añadir el event listener para el clic
titulo.addEventListener('click', cambiarColorAleatorio);

let currentIndex = 0; // Índice inicial de los cards visibles

function moveCarousel(direction) {
  const container = document.querySelector('.carousel-container');
  const cards = document.querySelectorAll('.card');
  const visibleCards = 3; // Número de cards visibles

  // Calcula el desplazamiento en píxeles
  const cardWidth = cards[0].offsetWidth + 20; // Ancho del card más el margen
  const totalCards = cards.length;

  // Mueve el carrusel según la dirección
  currentIndex += direction;

  // Evita que el carrusel se desplace más allá de los límites
  if (currentIndex < 0) {
    currentIndex = totalCards - visibleCards;
  } else if (currentIndex > totalCards - visibleCards) {
    currentIndex = 0;
  }

  // Aplica el desplazamiento
  container.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
}


function inicio() {
  let p1 = document.getElementById('p1');
  p1.innerText = prompt("Por favor, ingresa un texto para el título:");
  while (p1.innerText === "" || p1.innerText === null) {
    p1.innerText = prompt("Por favor, ingresa un texto para el título:");
  }
  log.innerText = `${sign}`;
}