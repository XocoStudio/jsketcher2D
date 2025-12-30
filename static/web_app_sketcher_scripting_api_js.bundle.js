"use strict";
(self["webpackChunkjsketcher"] = self["webpackChunkjsketcher"] || []).push([["web_app_sketcher_scripting_api_js"],{

/***/ "./web/app/sketcher/scripting/api.js":
/*!*******************************************!*\
  !*** ./web/app/sketcher/scripting/api.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SketchAPI": () => (/* binding */ SketchAPI),
/* harmony export */   "createSketchAPI": () => (/* binding */ createSketchAPI)
/* harmony export */ });
/* harmony import */ var _shapes_segment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../shapes/segment */ "./web/app/sketcher/shapes/segment.ts");
/* harmony import */ var _shapes_circle__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../shapes/circle */ "./web/app/sketcher/shapes/circle.js");
/* harmony import */ var _shapes_arc__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../shapes/arc */ "./web/app/sketcher/shapes/arc.ts");
/* harmony import */ var _shapes_point__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../shapes/point */ "./web/app/sketcher/shapes/point.ts");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

/**
 * Sketcher Scripting API
 * Permite generar geometría paramétrica y automatizar dibujos
 */




var SketchAPI = /*#__PURE__*/function () {
  function SketchAPI(viewer) {
    _classCallCheck(this, SketchAPI);

    this.viewer = viewer;
    this.layer = viewer.activeLayer;
  } // ==================== PRIMITIVAS BÁSICAS ====================

  /**
   * Crea un punto
   * @param {number} x - Coordenada X
   * @param {number} y - Coordenada Y
   * @returns {EndPoint}
   */


  _createClass(SketchAPI, [{
    key: "point",
    value: function point(x, y) {
      var pt = new _shapes_point__WEBPACK_IMPORTED_MODULE_3__.EndPoint(x, y);
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

  }, {
    key: "line",
    value: function line(x1, y1, x2, y2) {
      var seg = new _shapes_segment__WEBPACK_IMPORTED_MODULE_0__.Segment(x1, y1, x2, y2);
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

  }, {
    key: "circle",
    value: function circle(cx, cy, radius) {
      var circ = new _shapes_circle__WEBPACK_IMPORTED_MODULE_1__.Circle(cx, cy);
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

  }, {
    key: "arc",
    value: function arc(cx, cy, radius, startAngle, endAngle) {
      var startRad = startAngle * Math.PI / 180;
      var endRad = endAngle * Math.PI / 180;
      var x1 = cx + radius * Math.cos(startRad);
      var y1 = cy + radius * Math.sin(startRad);
      var x2 = cx + radius * Math.cos(endRad);
      var y2 = cy + radius * Math.sin(endRad);
      var a = new _shapes_arc__WEBPACK_IMPORTED_MODULE_2__.Arc(x1, y1, x2, y2);
      a.c.x = cx;
      a.c.y = cy;
      a.r.set(radius);
      this.layer.add(a);
      this.viewer.parametricManager.prepare([a]);
      return a;
    } // ==================== GEOMETRÍA PARAMÉTRICA ====================

    /**
     * Crea un rectángulo
     * @param {number} x - X esquina inferior izquierda
     * @param {number} y - Y esquina inferior izquierda
     * @param {number} width - Ancho
     * @param {number} height - Alto
     * @returns {Array<Segment>}
     */

  }, {
    key: "rectangle",
    value: function rectangle(x, y, width, height) {
      var lines = [this.line(x, y, x + width, y), this.line(x + width, y, x + width, y + height), this.line(x + width, y + height, x, y + height), this.line(x, y + height, x, y)];
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

  }, {
    key: "polygon",
    value: function polygon(cx, cy, radius, sides) {
      var rotation = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
      var lines = [];
      var angleStep = 2 * Math.PI / sides;
      var startAngle = rotation * Math.PI / 180;

      for (var i = 0; i < sides; i++) {
        var angle1 = startAngle + i * angleStep;
        var angle2 = startAngle + (i + 1) * angleStep;
        var x1 = cx + radius * Math.cos(angle1);
        var y1 = cy + radius * Math.sin(angle1);
        var x2 = cx + radius * Math.cos(angle2);
        var y2 = cy + radius * Math.sin(angle2);
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

  }, {
    key: "star",
    value: function star(cx, cy, outerRadius, innerRadius, points) {
      var lines = [];
      var angleStep = Math.PI / points;

      for (var i = 0; i < points * 2; i++) {
        var angle1 = i * angleStep;
        var angle2 = (i + 1) * angleStep;
        var r1 = i % 2 === 0 ? outerRadius : innerRadius;
        var r2 = (i + 1) % 2 === 0 ? outerRadius : innerRadius;
        var x1 = cx + r1 * Math.cos(angle1);
        var y1 = cy + r1 * Math.sin(angle1);
        var x2 = cx + r2 * Math.cos(angle2);
        var y2 = cy + r2 * Math.sin(angle2);
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

  }, {
    key: "grid",
    value: function grid(x, y, width, height, cols, rows) {
      var lines = [];
      var cellWidth = width / cols;
      var cellHeight = height / rows; // Líneas verticales

      for (var i = 0; i <= cols; i++) {
        var xPos = x + i * cellWidth;
        lines.push(this.line(xPos, y, xPos, y + height));
      } // Líneas horizontales


      for (var _i = 0; _i <= rows; _i++) {
        var yPos = y + _i * cellHeight;
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

  }, {
    key: "spiral",
    value: function spiral(cx, cy, startRadius, endRadius, turns) {
      var segments = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 20;
      var lines = [];
      var totalSegments = turns * segments;
      var radiusStep = (endRadius - startRadius) / totalSegments;
      var angleStep = 2 * Math.PI / segments;

      for (var i = 0; i < totalSegments; i++) {
        var r1 = startRadius + i * radiusStep;
        var r2 = startRadius + (i + 1) * radiusStep;
        var angle1 = i * angleStep;
        var angle2 = (i + 1) * angleStep;
        var x1 = cx + r1 * Math.cos(angle1);
        var y1 = cy + r1 * Math.sin(angle1);
        var x2 = cx + r2 * Math.cos(angle2);
        var y2 = cy + r2 * Math.sin(angle2);
        lines.push(this.line(x1, y1, x2, y2));
      }

      return lines;
    } // ==================== PATRONES Y ARRAYS ====================

    /**
     * Array lineal - repite objetos en línea
     * @param {Function} createFunc - Función que crea el objeto
     * @param {number} count - Número de repeticiones
     * @param {number} dx - Desplazamiento X
     * @param {number} dy - Desplazamiento Y
     */

  }, {
    key: "linearArray",
    value: function linearArray(createFunc, count, dx, dy) {
      var objects = [];

      for (var i = 0; i < count; i++) {
        var offsetX = i * dx;
        var offsetY = i * dy;
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

  }, {
    key: "circularArray",
    value: function circularArray(createFunc, count, cx, cy, radius) {
      var objects = [];
      var angleStep = 2 * Math.PI / count;

      for (var i = 0; i < count; i++) {
        var angle = i * angleStep;
        var x = cx + radius * Math.cos(angle);
        var y = cy + radius * Math.sin(angle);
        objects.push(createFunc(x, y, i, angle));
      }

      return objects;
    } // ==================== UTILIDADES ====================

    /**
     * Limpia todos los objetos del dibujo
     */

  }, {
    key: "clear",
    value: function clear() {
      this.layer.objects = [];
      this.viewer.refresh();
    }
    /**
     * Refresca la vista
     */

  }, {
    key: "refresh",
    value: function refresh() {
      this.viewer.refresh();
    }
    /**
     * Ajusta la vista para ver todos los objetos
     */

  }, {
    key: "fitView",
    value: function fitView() {
      this.viewer.fit();
    }
  }]);

  return SketchAPI;
}();
/**
 * Crea una instancia de la API de scripting
 * @param {Viewer} viewer - Instancia del viewer
 * @returns {SketchAPI}
 */

function createSketchAPI(viewer) {
  return new SketchAPI(viewer);
}

/***/ })

}]);
//# sourceMappingURL=web_app_sketcher_scripting_api_js.bundle.js.map