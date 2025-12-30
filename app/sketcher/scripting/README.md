# 📐 Sketcher Scripting API - Guía Completa

## 🚀 Introducción

El **Editor de Código del Sketcher** te permite generar geometría paramétrica y automatizar dibujos usando JavaScript. Accede al terminal presionando la tecla correspondiente o desde el menú.

## 📖 Comandos Básicos

### Ayuda
```javascript
help        // Muestra todos los comandos disponibles
examples    // Muestra ejemplos de scripts
```

## 🎨 API de Dibujo

### Primitivas Básicas

#### Línea
```javascript
sketch.line(x1, y1, x2, y2)
// Ejemplo: sketch.line(0, 0, 100, 50)
```

#### Círculo
```javascript
sketch.circle(cx, cy, radius)
// Ejemplo: sketch.circle(0, 0, 30)
```

#### Arco
```javascript
sketch.arc(cx, cy, radius, startAngle, endAngle)
// Ejemplo: sketch.arc(0, 0, 50, 0, 180)  // Semicírculo
```

#### Punto
```javascript
sketch.point(x, y)
// Ejemplo: sketch.point(10, 20)
```

### Geometría Paramétrica

#### Rectángulo
```javascript
sketch.rectangle(x, y, width, height)
// Ejemplo: sketch.rectangle(0, 0, 100, 50)
```

#### Polígono Regular
```javascript
sketch.polygon(cx, cy, radius, sides, rotation)
// Ejemplo: sketch.polygon(0, 0, 50, 6)  // Hexágono
// Ejemplo: sketch.polygon(0, 0, 50, 5, 90)  // Pentágono rotado 90°
```

#### Estrella
```javascript
sketch.star(cx, cy, outerRadius, innerRadius, points)
// Ejemplo: sketch.star(0, 0, 60, 25, 5)  // Estrella de 5 puntas
```

#### Grilla/Cuadrícula
```javascript
sketch.grid(x, y, width, height, cols, rows)
// Ejemplo: sketch.grid(-100, -100, 200, 200, 5, 5)  // Grilla 5x5
```

#### Espiral
```javascript
sketch.spiral(cx, cy, startRadius, endRadius, turns, segments)
// Ejemplo: sketch.spiral(0, 0, 10, 100, 3, 30)  // Espiral de 3 vueltas
```

### Patrones y Arrays

#### Array Lineal
```javascript
sketch.linearArray(createFunc, count, dx, dy)
// Ejemplo: Crear 5 círculos en línea horizontal
sketch.linearArray((x, y) => sketch.circle(x, y, 10), 5, 30, 0)
```

#### Array Circular
```javascript
sketch.circularArray(createFunc, count, cx, cy, radius)
// Ejemplo: Crear 8 círculos en patrón circular
sketch.circularArray((x, y) => sketch.circle(x, y, 15), 8, 0, 0, 80)
```

### Utilidades

```javascript
sketch.clear()      // Limpia todos los objetos
sketch.refresh()    // Refresca la vista
sketch.fitView()    // Ajusta la vista para ver todos los objetos
```

## 💡 Ejemplos Prácticos

### Ejemplo 1: Círculos Concéntricos
```javascript
for(let i = 1; i <= 5; i++) {
  sketch.circle(0, 0, i * 20)
}
```

### Ejemplo 2: Patrón de Cuadrados
```javascript
for(let i = 0; i < 5; i++) {
  for(let j = 0; j < 5; j++) {
    sketch.rectangle(i * 30, j * 30, 25, 25)
  }
}
```

### Ejemplo 3: Flor con Pétalos
```javascript
// Centro
sketch.circle(0, 0, 15)
// Pétalos
sketch.circularArray((x, y) => sketch.circle(x, y, 20), 8, 0, 0, 50)
```

### Ejemplo 4: Engranaje Simple
```javascript
const teeth = 12
const outerR = 50
const innerR = 40

sketch.circle(0, 0, innerR)

for(let i = 0; i < teeth; i++) {
  const angle = (i * 360 / teeth) * Math.PI / 180
  const x = outerR * Math.cos(angle)
  const y = outerR * Math.sin(angle)
  sketch.rectangle(x - 3, y - 5, 6, 10)
}
```

### Ejemplo 5: Patrón de Ondas
```javascript
for(let x = -200; x <= 200; x += 10) {
  const y = 50 * Math.sin(x / 30)
  sketch.circle(x, y, 3)
}
```

### Ejemplo 6: Mandala
```javascript
for(let ring = 1; ring <= 4; ring++) {
  const radius = ring * 30
  const count = ring * 6
  sketch.circularArray(
    (x, y) => sketch.circle(x, y, 8), 
    count, 
    0, 
    0, 
    radius
  )
}
```

### Ejemplo 7: Espiral de Cuadrados
```javascript
for(let i = 0; i < 20; i++) {
  const angle = i * 30 * Math.PI / 180
  const r = i * 10
  const x = r * Math.cos(angle)
  const y = r * Math.sin(angle)
  const size = 5 + i * 2
  sketch.rectangle(x - size/2, y - size/2, size, size)
}
```

### Ejemplo 8: Tablero de Ajedrez
```javascript
for(let i = 0; i < 8; i++) {
  for(let j = 0; j < 8; j++) {
    if((i + j) % 2 === 0) {
      sketch.rectangle(i * 20 - 80, j * 20 - 80, 20, 20)
    }
  }
}
```

### Ejemplo 9: Función Personalizada - Casa
```javascript
function house(x, y, size) {
  // Base
  sketch.rectangle(x, y, size, size)
  // Techo
  sketch.polygon(x + size/2, y + size + size/2, size/2, 3, 180)
  // Puerta
  sketch.rectangle(x + size * 0.3, y, size * 0.3, size * 0.5)
  // Ventana
  sketch.rectangle(x + size * 0.6, y + size * 0.5, size * 0.25, size * 0.35)
}

// Crear varias casas
for(let i = 0; i < 3; i++) {
  house(i * 150 - 200, -50, 80)
}
```

### Ejemplo 10: Polígonos Rotados
```javascript
for(let i = 0; i < 12; i++) {
  sketch.polygon(0, 0, 80, 6, i * 15)
}
```

## 🔧 Funciones Avanzadas

### Usar Variables
```javascript
const radius = 50
const sides = 8
sketch.polygon(0, 0, radius, sides)
```

### Bucles Anidados
```javascript
for(let i = 0; i < 3; i++) {
  for(let j = 0; j < 3; j++) {
    sketch.star(i * 100, j * 100, 30, 12, 5)
  }
}
```

### Funciones Matemáticas
```javascript
// Usar Math para cálculos
const angle = 45 * Math.PI / 180
const x = 100 * Math.cos(angle)
const y = 100 * Math.sin(angle)
sketch.line(0, 0, x, y)
```

### Condicionales
```javascript
for(let i = 0; i < 10; i++) {
  if(i % 2 === 0) {
    sketch.circle(i * 30, 0, 10)
  } else {
    sketch.rectangle(i * 30 - 10, -10, 20, 20)
  }
}
```

## 📝 Consejos y Trucos

1. **Usa `sketch.clear()`** antes de ejecutar un nuevo script para limpiar el canvas
2. **Usa `sketch.fitView()`** después de generar geometría para ver todo
3. **Guarda tus scripts** en un archivo de texto para reutilizarlos
4. **Experimenta con parámetros** para crear variaciones
5. **Combina funciones** para crear diseños complejos

## 🎯 Casos de Uso

- **Diseño Mecánico**: Engranajes, patrones de agujeros
- **Arquitectura**: Grillas, patrones de ventanas
- **Arte Generativo**: Mandalas, fractales, patrones
- **Prototipado Rápido**: Generar múltiples variaciones
- **Educación**: Enseñar geometría y programación

## 🚨 Solución de Problemas

### El script no funciona
- Verifica la sintaxis de JavaScript
- Revisa que los parámetros sean números válidos
- Usa `help` para ver la lista de funciones disponibles

### Los objetos no se ven
- Usa `sketch.fitView()` para ajustar la vista
- Verifica que las coordenadas estén en un rango razonable

### Error en el terminal
- Lee el mensaje de error
- Verifica que estés usando la función correcta
- Comprueba que los parámetros sean del tipo correcto

## 📚 Recursos Adicionales

- Escribe `help` en el terminal para ver todos los comandos
- Escribe `examples` para ver ejemplos rápidos
- Experimenta con los parámetros para aprender

---

**¡Diviértete creando geometría paramétrica! 🎨✨**
