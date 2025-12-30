# 🎨 Recetas Rápidas para el Terminal del Sketcher

## ⚡ Ejemplos de Una Línea (Copia y Pega Directamente)

### Básicos:

```javascript
sketch.clear(); sketch.polygon(0, 0, 50, 6); sketch.fitView()
```

```javascript
sketch.clear(); sketch.star(0, 0, 60, 25, 5); sketch.fitView()
```

```javascript
sketch.clear(); sketch.grid(-100, -100, 200, 200, 5, 5); sketch.fitView()
```

```javascript
sketch.clear(); sketch.spiral(0, 0, 10, 100, 3, 30); sketch.fitView()
```

### Patrones con Bucles:

```javascript
sketch.clear(); for(let i=1; i<=5; i++) sketch.circle(0,0,i*20); sketch.fitView()
```

```javascript
sketch.clear(); for(let i=0; i<12; i++) sketch.polygon(0,0,80,6,i*15); sketch.fitView()
```

```javascript
sketch.clear(); for(let i=0; i<5; i++) for(let j=0; j<5; j++) sketch.rectangle(i*30,j*30,25,25); sketch.fitView()
```

```javascript
sketch.clear(); for(let x=-200; x<=200; x+=10) sketch.circle(x, 50*Math.sin(x/30), 3); sketch.fitView()
```

### Arrays Circulares:

```javascript
sketch.clear(); sketch.circle(0,0,15); sketch.circularArray((x,y)=>sketch.circle(x,y,20), 8, 0, 0, 50); sketch.fitView()
```

```javascript
sketch.clear(); sketch.circularArray((x,y)=>sketch.star(x,y,15,6,5), 12, 0, 0, 80); sketch.fitView()
```

```javascript
sketch.clear(); for(let r=1; r<=4; r++) sketch.circularArray((x,y)=>sketch.circle(x,y,8), r*6, 0, 0, r*30); sketch.fitView()
```

### Patrones Complejos:

```javascript
sketch.clear(); for(let i=0; i<24; i++) { let a=i*15*Math.PI/180; sketch.line(0,0,100*Math.cos(a),100*Math.sin(a)); } sketch.fitView()
```

```javascript
sketch.clear(); for(let i=0; i<8; i++) { let a=i*45; sketch.polygon(0,0,100,8,a); sketch.polygon(0,0,70,8,a+22.5); } sketch.circle(0,0,120); sketch.circle(0,0,50); sketch.fitView()
```

```javascript
sketch.clear(); for(let i=1; i<=20; i++) { let s=i*15; sketch.rectangle(-s/2,-s/2,s,s); } sketch.fitView()
```

```javascript
sketch.clear(); for(let i=0; i<20; i++) { let a=i*30*Math.PI/180, r=i*10, x=r*Math.cos(a), y=r*Math.sin(a), s=5+i*2; sketch.rectangle(x-s/2,y-s/2,s,s); } sketch.fitView()
```

### Engranajes y Mecánica:

```javascript
sketch.clear(); sketch.circle(0,0,60); for(let i=0; i<12; i++) { let a=(i*360/12)*Math.PI/180; sketch.rectangle(80*Math.cos(a)-4, 80*Math.sin(a)-6, 8, 12); } sketch.fitView()
```

```javascript
sketch.clear(); for(let i=0; i<3; i++) for(let j=0; j<3; j++) { let x=i*100-100, y=j*100-100; sketch.circle(x,y,30); for(let k=0; k<8; k++) { let a=k*45*Math.PI/180; sketch.rectangle(x+35*Math.cos(a)-3, y+35*Math.sin(a)-4, 6, 8); } } sketch.fitView()
```

### Arte Generativo:

```javascript
sketch.clear(); for(let i=0; i<100; i++) { let a=i*0.5, r=i*2, x=r*Math.cos(a), y=r*Math.sin(a); sketch.circle(x,y,2+Math.random()*4); } sketch.fitView()
```

```javascript
sketch.clear(); for(let a=0; a<360; a+=2) { let rad=a*Math.PI/180, r=80*Math.sin(5*rad); sketch.circle(r*Math.cos(rad), r*Math.sin(rad), 3); } sketch.fitView()
```

```javascript
sketch.clear(); for(let i=0; i<24; i++) { let a=i*15; sketch.star(0,0,100-i*2,50-i,5); } sketch.fitView()
```

### Tableros y Grillas:

```javascript
sketch.clear(); for(let i=0; i<8; i++) for(let j=0; j<8; j++) { let x=i*25-100, y=j*25-100; if((i+j)%2===0) sketch.rectangle(x,y,25,25); else sketch.circle(x+12.5,y+12.5,10); } sketch.fitView()
```

```javascript
sketch.clear(); let s=30; for(let i=-3; i<=3; i++) for(let j=-3; j<=3; j++) { let x=i*s*1.5, y=j*s*Math.sqrt(3)+(i%2)*s*Math.sqrt(3)/2; sketch.polygon(x,y,s,6); } sketch.fitView()
```

---

## 📝 Cómo Usar:

1. **Copia** cualquier línea completa
2. **Pega** en el terminal del Sketcher
3. **Presiona Enter**
4. ¡Disfruta del resultado instantáneo!

## 💡 Consejos:

- Todas las líneas empiezan con `sketch.clear()` para limpiar el canvas
- Todas terminan con `sketch.fitView()` para ajustar la vista
- Puedes modificar los números para crear variaciones
- Combina múltiples comandos con punto y coma (`;`)

## 🎯 Modificaciones Rápidas:

### Cambiar Tamaño:
- Busca números como `50`, `100`, `80` y cámbialos
- Ejemplo: `sketch.polygon(0, 0, 50, 6)` → `sketch.polygon(0, 0, 100, 6)`

### Cambiar Cantidad:
- Busca `i<5` o `i<=10` y cambia el número
- Ejemplo: `for(let i=1; i<=5; i++)` → `for(let i=1; i<=10; i++)`

### Cambiar Posición:
- Los primeros dos números suelen ser X, Y
- Ejemplo: `sketch.circle(0, 0, 30)` → `sketch.circle(50, 50, 30)`

---

**¡Experimenta y crea tus propios diseños! 🎨✨**
