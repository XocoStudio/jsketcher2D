/**
 * Ejemplos de Scripts para el Editor de Código del Sketcher
 * Copia y pega estos ejemplos en el terminal para generar geometría
 */

// ==================== EJEMPLOS BÁSICOS ====================

// Ejemplo 1: Crear un rectángulo simple
// sketch.rectangle(0, 0, 100, 50)

// Ejemplo 2: Crear un círculo
// sketch.circle(0, 0, 30)

// Ejemplo 3: Crear un hexágono
// sketch.polygon(0, 0, 50, 6)

// Ejemplo 4: Crear una estrella de 5 puntas
// sketch.star(0, 0, 60, 25, 5)

// ==================== EJEMPLOS PARAMÉTRICOS ====================

// Ejemplo 5: Crear múltiples círculos concéntricos
// for(let i = 1; i <= 5; i++) { sketch.circle(0, 0, i * 20) }

// Ejemplo 6: Patrón de cuadrados
// for(let i = 0; i < 5; i++) { sketch.rectangle(i * 60, 0, 50, 50) }

// Ejemplo 7: Espiral
// sketch.spiral(0, 0, 10, 100, 3, 30)

// Ejemplo 8: Grilla 5x5
// sketch.grid(-100, -100, 200, 200, 5, 5)

// ==================== EJEMPLOS AVANZADOS ====================

// Ejemplo 9: Flor con pétalos (círculos en array circular)
// sketch.circularArray((x, y) => sketch.circle(x, y, 20), 8, 0, 0, 50)

// Ejemplo 10: Patrón de estrellas
// for(let i = 0; i < 3; i++) {
//   for(let j = 0; j < 3; j++) {
//     sketch.star(i * 100, j * 100, 30, 12, 5)
//   }
// }

// Ejemplo 11: Engranaje simple
// const teeth = 12
// const outerR = 50
// const innerR = 40
// sketch.circle(0, 0, innerR)
// for(let i = 0; i < teeth; i++) {
//   const angle = (i * 360 / teeth) * Math.PI / 180
//   const x = outerR * Math.cos(angle)
//   const y = outerR * Math.sin(angle)
//   sketch.rectangle(x - 3, y - 5, 6, 10)
// }

// Ejemplo 12: Patrón de ondas
// for(let x = -200; x <= 200; x += 10) {
//   const y = 50 * Math.sin(x / 30)
//   sketch.circle(x, y, 3)
// }

// Ejemplo 13: Fractal simple (triángulo de Sierpinski - 2 niveles)
// function triangle(x, y, size) {
//   const h = size * Math.sqrt(3) / 2
//   sketch.line(x, y, x + size, y)
//   sketch.line(x + size, y, x + size/2, y + h)
//   sketch.line(x + size/2, y + h, x, y)
// }
// triangle(-100, -50, 200)
// triangle(-50, -50, 100)
// triangle(0, 36.6, 100)
// triangle(-100, 36.6, 100)

// Ejemplo 14: Patrón de polígonos rotados
// for(let i = 0; i < 12; i++) {
//   sketch.polygon(0, 0, 80, 6, i * 15)
// }

// Ejemplo 15: Espiral de cuadrados
// for(let i = 0; i < 20; i++) {
//   const angle = i * 30 * Math.PI / 180
//   const r = i * 10
//   const x = r * Math.cos(angle)
//   const y = r * Math.sin(angle)
//   const size = 5 + i * 2
//   sketch.rectangle(x - size/2, y - size/2, size, size)
// }

// ==================== UTILIDADES ====================

// Limpiar todo el dibujo
// sketch.clear()

// Ajustar vista para ver todo
// sketch.fitView()

// Refrescar la vista
// sketch.refresh()

// ==================== FUNCIONES PERSONALIZADAS ====================

// Ejemplo 16: Función para crear una casa
// function house(x, y, size) {
//   sketch.rectangle(x, y, size, size)
//   sketch.polygon(x + size/2, y + size + size/2, size/2, 3, 180)
//   sketch.rectangle(x + size * 0.3, y, size * 0.3, size * 0.5)
//   sketch.rectangle(x + size * 0.6, y + size * 0.5, size * 0.25, size * 0.35)
// }
// house(-50, -50, 100)

// Ejemplo 17: Patrón de casas
// for(let i = 0; i < 3; i++) {
//   house(i * 150 - 200, -50, 80)
// }

// Ejemplo 18: Mandala simple
// for(let ring = 1; ring <= 4; ring++) {
//   const radius = ring * 30
//   const count = ring * 6
//   sketch.circularArray((x, y) => sketch.circle(x, y, 8), count, 0, 0, radius)
// }

// Ejemplo 19: Patrón de líneas radiales
// for(let i = 0; i < 24; i++) {
//   const angle = i * 15 * Math.PI / 180
//   sketch.line(0, 0, 100 * Math.cos(angle), 100 * Math.sin(angle))
// }

// Ejemplo 20: Tablero de ajedrez
// for(let i = 0; i < 8; i++) {
//   for(let j = 0; j < 8; j++) {
//     if((i + j) % 2 === 0) {
//       sketch.rectangle(i * 20 - 80, j * 20 - 80, 20, 20)
//     }
//   }
// }
