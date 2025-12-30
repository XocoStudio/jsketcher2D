/**
 * Sketcher Scripting API
 * Permite generar geometría paramétrica y automatizar dibujos
 */

import { Segment } from '../shapes/segment';
import { Circle } from '../shapes/circle';
import { Arc } from '../shapes/arc';
import { EndPoint } from '../shapes/point';

export class SketchAPI {
    constructor(viewer) {
        this.viewer = viewer;
        this.layer = viewer.activeLayer;
    }

    // ==================== PRIMITIVAS BÁSICAS ====================

    /**
     * Crea un punto
     * @param {number} x - Coordenada X
     * @param {number} y - Coordenada Y
     * @returns {EndPoint}
     */
    point(x, y) {
        const pt = new EndPoint(x, y);
        this.layer.add(pt);
        return pt;
    }

    /**
     * Crea una línea
     * @param {number} x1 - X inicial
     * @param {number} y1 - Y inicial
     * @param {number} x2 - X final
     * @param {number} y2 - Y final
     * @returns {Segment}
     */
    line(x1, y1, x2, y2) {
        const seg = new Segment(x1, y1, x2, y2);
        this.layer.add(seg);
        this.viewer.parametricManager.prepare([seg]);
        return seg;
    }

    /**
     * Crea un círculo
     * @param {number} cx - Centro X
     * @param {number} cy - Centro Y
     * @param {number} radius - Radio
     * @returns {Circle}
     */
    circle(cx, cy, radius) {
        const circ = new Circle(cx, cy);
        circ.r.set(radius);
        this.layer.add(circ);
        this.viewer.parametricManager.prepare([circ]);
        return circ;
    }

    /**
     * Crea un arco
     * @param {number} cx - Centro X
     * @param {number} cy - Centro Y
     * @param {number} radius - Radio
     * @param {number} startAngle - Ángulo inicial (grados)
     * @param {number} endAngle - Ángulo final (grados)
     * @returns {Arc}
     */
    arc(cx, cy, radius, startAngle, endAngle) {
        const startRad = startAngle * Math.PI / 180;
        const endRad = endAngle * Math.PI / 180;

        const x1 = cx + radius * Math.cos(startRad);
        const y1 = cy + radius * Math.sin(startRad);
        const x2 = cx + radius * Math.cos(endRad);
        const y2 = cy + radius * Math.sin(endRad);

        const a = new Arc(x1, y1, x2, y2);
        a.c.x = cx;
        a.c.y = cy;
        a.r.set(radius);

        this.layer.add(a);
        this.viewer.parametricManager.prepare([a]);
        return a;
    }

    // ==================== GEOMETRÍA PARAMÉTRICA ====================

    /**
     * Crea un rectángulo
     * @param {number} x - X esquina inferior izquierda
     * @param {number} y - Y esquina inferior izquierda
     * @param {number} width - Ancho
     * @param {number} height - Alto
     * @returns {Array<Segment>}
     */
    rectangle(x, y, width, height) {
        const lines = [
            this.line(x, y, x + width, y),
            this.line(x + width, y, x + width, y + height),
            this.line(x + width, y + height, x, y + height),
            this.line(x, y + height, x, y)
        ];
        return lines;
    }

    /**
     * Crea un polígono regular
     * @param {number} cx - Centro X
     * @param {number} cy - Centro Y
     * @param {number} radius - Radio
     * @param {number} sides - Número de lados
     * @param {number} rotation - Rotación inicial (grados)
     * @returns {Array<Segment>}
     */
    polygon(cx, cy, radius, sides, rotation = 0) {
        const lines = [];
        const angleStep = (2 * Math.PI) / sides;
        const startAngle = rotation * Math.PI / 180;

        for (let i = 0; i < sides; i++) {
            const angle1 = startAngle + i * angleStep;
            const angle2 = startAngle + (i + 1) * angleStep;

            const x1 = cx + radius * Math.cos(angle1);
            const y1 = cy + radius * Math.sin(angle1);
            const x2 = cx + radius * Math.cos(angle2);
            const y2 = cy + radius * Math.sin(angle2);

            lines.push(this.line(x1, y1, x2, y2));
        }

        return lines;
    }

    /**
     * Crea una estrella
     * @param {number} cx - Centro X
     * @param {number} cy - Centro Y
     * @param {number} outerRadius - Radio exterior
     * @param {number} innerRadius - Radio interior
     * @param {number} points - Número de puntas
     * @returns {Array<Segment>}
     */
    star(cx, cy, outerRadius, innerRadius, points) {
        const lines = [];
        const angleStep = Math.PI / points;

        for (let i = 0; i < points * 2; i++) {
            const angle1 = i * angleStep;
            const angle2 = (i + 1) * angleStep;
            const r1 = i % 2 === 0 ? outerRadius : innerRadius;
            const r2 = (i + 1) % 2 === 0 ? outerRadius : innerRadius;

            const x1 = cx + r1 * Math.cos(angle1);
            const y1 = cy + r1 * Math.sin(angle1);
            const x2 = cx + r2 * Math.cos(angle2);
            const y2 = cy + r2 * Math.sin(angle2);

            lines.push(this.line(x1, y1, x2, y2));
        }

        return lines;
    }

    /**
     * Crea una grilla/cuadrícula
     * @param {number} x - X inicial
     * @param {number} y - Y inicial
     * @param {number} width - Ancho total
     * @param {number} height - Alto total
     * @param {number} cols - Número de columnas
     * @param {number} rows - Número de filas
     * @returns {Array<Segment>}
     */
    grid(x, y, width, height, cols, rows) {
        const lines = [];
        const cellWidth = width / cols;
        const cellHeight = height / rows;

        // Líneas verticales
        for (let i = 0; i <= cols; i++) {
            const xPos = x + i * cellWidth;
            lines.push(this.line(xPos, y, xPos, y + height));
        }

        // Líneas horizontales
        for (let i = 0; i <= rows; i++) {
            const yPos = y + i * cellHeight;
            lines.push(this.line(x, yPos, x + width, yPos));
        }

        return lines;
    }

    /**
     * Crea una espiral
     * @param {number} cx - Centro X
     * @param {number} cy - Centro Y
     * @param {number} startRadius - Radio inicial
     * @param {number} endRadius - Radio final
     * @param {number} turns - Número de vueltas
     * @param {number} segments - Segmentos por vuelta
     * @returns {Array<Segment>}
     */
    spiral(cx, cy, startRadius, endRadius, turns, segments = 20) {
        const lines = [];
        const totalSegments = turns * segments;
        const radiusStep = (endRadius - startRadius) / totalSegments;
        const angleStep = (2 * Math.PI) / segments;

        for (let i = 0; i < totalSegments; i++) {
            const r1 = startRadius + i * radiusStep;
            const r2 = startRadius + (i + 1) * radiusStep;
            const angle1 = i * angleStep;
            const angle2 = (i + 1) * angleStep;

            const x1 = cx + r1 * Math.cos(angle1);
            const y1 = cy + r1 * Math.sin(angle1);
            const x2 = cx + r2 * Math.cos(angle2);
            const y2 = cy + r2 * Math.sin(angle2);

            lines.push(this.line(x1, y1, x2, y2));
        }

        return lines;
    }

    // ==================== PATRONES Y ARRAYS ====================

    /**
     * Array lineal - repite objetos en línea
     * @param {Function} createFunc - Función que crea el objeto
     * @param {number} count - Número de repeticiones
     * @param {number} dx - Desplazamiento X
     * @param {number} dy - Desplazamiento Y
     */
    linearArray(createFunc, count, dx, dy) {
        const objects = [];
        for (let i = 0; i < count; i++) {
            const offsetX = i * dx;
            const offsetY = i * dy;
            objects.push(createFunc(offsetX, offsetY, i));
        }
        return objects;
    }

    /**
     * Array circular - repite objetos en círculo
     * @param {Function} createFunc - Función que crea el objeto
     * @param {number} count - Número de repeticiones
     * @param {number} cx - Centro X
     * @param {number} cy - Centro Y
     * @param {number} radius - Radio
     */
    circularArray(createFunc, count, cx, cy, radius) {
        const objects = [];
        const angleStep = (2 * Math.PI) / count;

        for (let i = 0; i < count; i++) {
            const angle = i * angleStep;
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            objects.push(createFunc(x, y, i, angle));
        }
        return objects;
    }

    // ==================== UTILIDADES ====================

    /**
     * Limpia todos los objetos del dibujo
     */
    clear() {
        this.layer.objects = [];
        this.viewer.refresh();
    }

    /**
     * Refresca la vista
     */
    refresh() {
        this.viewer.refresh();
    }

    /**
     * Ajusta la vista para ver todos los objetos
     */
    fitView() {
        this.viewer.fit();
    }
}

/**
 * Crea una instancia de la API de scripting
 * @param {Viewer} viewer - Instancia del viewer
 * @returns {SketchAPI}
 */
export function createSketchAPI(viewer) {
    return new SketchAPI(viewer);
}
