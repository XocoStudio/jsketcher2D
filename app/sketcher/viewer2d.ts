import { ParametricManager } from './parametric';
import { HistoryManager } from './history';
import { ToolManager } from './tools/manager';
import { PanTool } from './tools/pan';
import { Segment } from './shapes/segment';
import { EndPoint } from './shapes/point';
import { ReferencePoint } from './shapes/reference-point';
import { BasisOrigin } from './shapes/basis-origin';
import Vector from 'math/vector';

import * as draw_utils from './shapes/draw-utils';
import sketcherStreams, { SketcherStreams } from './sketcherStreams';
import { BBox, IO } from "./io";
import { Shape } from "./shapes/shape";
import { Circle } from './shapes/circle';
import { Arc } from './shapes/arc';
import { SketchObject } from "./shapes/sketch-object";
import { Styles } from './styles';
import { Dimension } from "./shapes/dim";
import { GroundObjectsGeneratorSchema } from "./generators/groundObjectsGenerator";
import { SketchGenerator } from "./generators/sketchGenerator";
import { Generator } from "./id-generator";
import { Matrix3x4 } from "math/matrix";
import { Label } from "sketcher/shapes/label";

export class Viewer {

  presicion: number;
  canvas: any;
  io: IO;
  streams: SketcherStreams;
  retinaPxielRatio: number;
  ctx: CanvasRenderingContext2D;
  onWindowResize: () => void;
  private _activeLayer: Layer;
  layers: Layer<SketchObject>[];
  dimLayer: Layer<Dimension>;
  annotationLayer: Layer<Dimension>;
  labelLayer: Layer<Label>;
  dimLayers: Layer<Dimension>[];
  private readonly _workspace: Layer[][];

  referencePoint: Shape;
  snapPoint: EndPoint;
  toolManager: any;
  parametricManager: any;
  translate: { x: number; y: number };
  scale: number;
  captured: {
    highlight2: any[],
    tool: any[],
    highlight: any[],
    selection: any[]
  };
  historyManager: any;
  transformation: any;
  screenToModelMatrix: any;
  private readonly _serviceWorkspace: Layer<Shape>[][];
  private __prevStyle: null;
  interactiveScale: number;
  unscale: number;
  customSelectionHandler: any;
  applicationContext: any;

  osnapEnabled: boolean;
  orthoMode: boolean;
  polarMode: boolean;
  smartGuidesEnabled: boolean;
  smartGuideLines: Array<{ x1: number, y1: number, x2: number, y2: number, type: string }>;

  constructor(canvas, IO, applicationContext) {

    this.applicationContext = applicationContext;
    this.presicion = 3;
    this.canvas = canvas;
    this.io = new IO(this);
    this.streams = sketcherStreams(this);
    const viewer = this;
    this.retinaPxielRatio = window.devicePixelRatio > 1 ? window.devicePixelRatio : 1;

    function updateCanvasSize() {
      const canvasWidth = canvas.parentNode.offsetWidth;
      const canvasHeight = canvas.parentNode.offsetHeight;

      canvas.width = canvasWidth * viewer.retinaPxielRatio;
      canvas.height = canvasHeight * viewer.retinaPxielRatio;

      canvas.style.width = canvasWidth + "px";
      canvas.style.height = canvasHeight + "px";
    }

    this.onWindowResize = function () {
      updateCanvasSize();
      viewer.refresh();
    };
    updateCanvasSize();
    window.addEventListener('resize', this.onWindowResize, false);

    this.ctx = this.canvas.getContext("2d");
    this._activeLayer = null;
    this.layers = [
      this.createLayer(PREDEFINED_LAYERS.GROUND, Styles.DEFAULT),
      this.createLayer(PREDEFINED_LAYERS.SKETCH, Styles.DEFAULT)
      // this.createLayer("_construction_", Styles.CONSTRUCTION) 
    ];
    this.dimLayer = this.createLayer("_dim", Styles.DIM);
    this.annotationLayer = this.createLayer<Dimension>("_annotations", Styles.ANNOTATIONS);
    this.labelLayer = this.createLayer<Label>("_labels", Styles.ANNOTATIONS);
    this.dimLayers = [this.dimLayer, this.annotationLayer, this.labelLayer];
    this.streams.dimScale.attach(() => this.refresh());

    this._workspace = [this.layers, this.dimLayers];


    this.referencePoint = new ReferencePoint();
    this.referencePoint.visible = false;

    this.snapPoint = new EndPoint(0, 0);
    this.snapPoint.visible = false;

    this.toolManager = new ToolManager(this, new PanTool(this));
    this.parametricManager = new ParametricManager(this);
    this.createGroundObjects();

    this.translate = { x: 0.0, y: 0.0 };
    this.scale = 1.0;

    this.osnapEnabled = true;
    this.orthoMode = false;
    this.polarMode = false;
    this.smartGuidesEnabled = true;
    this.smartGuideLines = [];

    // @ts-ignore
    this.captured = {
    };
    Object.keys(CAPTURES).forEach(key => this.captured[key] = []);

    this.historyManager = new HistoryManager(this);
    this.transformation = null;
    this.screenToModelMatrix = null;

    this._serviceWorkspace = [this._createServiceLayers()];

    this.refresh();
  }

  get dimScale() {
    return this.streams.dimScale.value;
  }

  get selected() {
    return this.captured.selection;
  }

  get snapped() {
    const s = this.captured.tool[0];
    if (!s) return null;
    return s === this.snapPoint ? s.copy() : s;
  }

  dispose() {
    window.removeEventListener('resize', this.onWindowResize, false);
    this.canvas = null;
    this.toolManager.dispose();
    Generator.resetIDGenerator();
  }

  isDisposed() {
    return this.canvas === null;
  }

  setTransformation(a, b, c, d, e, f, zoom) {
    this.transformation = [a, b, c, d, e, f];
    this.scale = zoom;
    if (this.screenToModelMatrix === null) {
      this.screenToModelMatrix = new Matrix3x4();
    }
    this.screenToModelMatrix.set3x4(
      a, c, 0, e,
      b, d, 0, f,
      0, 0, 1, 0
    )._invert();
  }

  roundToPrecision(value) {
    return value.toFixed(this.presicion);
  }

  addSegment(x1, y1, x2, y2, layer) {
    const line = new Segment(x1, y1, x2, y2);
    layer.add(line);
    return line;
  }

  remove(obj) {
    this.removeAll([obj]);
  }

  removeAll(objects) {
    this.deselectAll();
    this.parametricManager.removeObjects(objects);
  }

  add(obj, layer) {
    layer.add(obj);
  }

  search(x, y, buffer, deep, onlyPoints, filter) {

    buffer /= this.scale / this.retinaPxielRatio;
    buffer *= 0.5;

    const pickResult = [];
    const aim = new Vector(x, y);

    let heroIdx = 0;
    const unreachable = buffer * 2;
    let heroLength = unreachable; // unreachable

    function isFiltered(o) {
      for (let i = 0; i < filter.length; ++i) {
        if (filter[i] === o) return true;
      }
      return false;
    }

    for (const layers of this._workspace) {
      for (let i = 0; i < layers.length; i++) {
        const objs = layers[i].objects;
        for (let j = 0; j < objs.length; j++) {
          let l = unreachable + 1;
          const before = pickResult.length;
          objs[j].accept((o) => {
            if (!o.visible) return true;
            if (onlyPoints && !isEndPoint(o)) {
              return true;
            }
            l = o.normalDistance(aim, this.scale / this.retinaPxielRatio);
            if (l >= 0 && l <= buffer && !isFiltered(o)) {
              pickResult.push(o);
              return false;
            }
            return true;
          });
          const hit = before - pickResult.length != 0;
          if (hit) {
            if (!deep && pickResult.length != 0) return pickResult;
            if (l >= 0 && l < heroLength) {
              heroLength = l;
              heroIdx = pickResult.length - 1;
            }
          }
        }
      }
    }
    if (pickResult.length > 0) {
      const _f = pickResult[0];
      pickResult[0] = pickResult[heroIdx];
      pickResult[heroIdx] = _f;
    }
    return pickResult;
  }

  _createServiceLayers(): Layer<Shape>[] {
    const layer = this.createLayer<Shape>("_service", Styles.SERVICE);
    //  layer.objects.push(new CrossHair(0, 0, 20));
    //  layer.objects.push(new Point(0, 0, 2));
    layer.objects.push(this.referencePoint);
    layer.objects.push(this.snapPoint);
    layer.objects.push(new BasisOrigin(null, this));
    return [layer];
  }

  createGroundObjects() {
    const groundObjectsGenerator = new SketchGenerator({}, GroundObjectsGeneratorSchema);
    this.parametricManager.addGeneratorToStage(groundObjectsGenerator, this.parametricManager.groundStage);
  }

  refresh() {
    const viewer = this;
    window.requestAnimationFrame(function () {
      if (!viewer.isDisposed()) {
        viewer.repaint();
      }
    });
  }

  repaint() {

    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.transform(1, 0, 0, -1, 0, this.canvas.height);

    if (this.transformation) {
      const [a, b, c, d, e, f] = this.transformation;
      ctx.transform(a, b, c, d, e, f);
    } else {
      ctx.transform(1, 0, 0, 1, this.translate.x, this.translate.y);
      ctx.transform(this.scale, 0, 0, this.scale, 0, 0);
    }

    this.__prevStyle = null;

    this.interactiveScale = this.scale / this.retinaPxielRatio;
    this.unscale = 1 / this.interactiveScale;

    this.__drawWorkspace(ctx, this._workspace, Viewer.__SKETCH_DRAW_PIPELINE);
    this.__drawWorkspace(ctx, this._serviceWorkspace, Viewer.__SIMPLE_DRAW_PIPELINE);

    // Draw smart guide lines
    if (this.smartGuidesEnabled && this.smartGuideLines.length > 0) {
      this.drawSmartGuides(ctx);
    }
  }

  toggleOSnap() {
    this.osnapEnabled = !this.osnapEnabled;
    this.streams.osnapEnabled.next(this.osnapEnabled);
    this.streams.tool.$message.next('OSNAP: ' + (this.osnapEnabled ? 'ON' : 'OFF'));
    this.refresh();
  }

  toggleOrtho() {
    this.orthoMode = !this.orthoMode;
    this.streams.orthoMode.next(this.orthoMode);
    this.streams.tool.$message.next('ORTHO: ' + (this.orthoMode ? 'ON' : 'OFF'));
    // If Polar is on, turn it off
    if (this.orthoMode && this.polarMode) {
      this.polarMode = false;
      this.streams.polarMode.next(false);
      this.streams.tool.$message.next('POLAR: OFF');
    }
    this.refresh();
  }

  togglePolar() {
    this.polarMode = !this.polarMode;
    this.streams.polarMode.next(this.polarMode);
    this.streams.tool.$message.next('POLAR: ' + (this.polarMode ? 'ON' : 'OFF'));
    // If Ortho is on, turn it off
    if (this.polarMode && this.orthoMode) {
      this.orthoMode = false;
      this.streams.orthoMode.next(false);
      this.streams.tool.$message.next('ORTHO: OFF');
    }
    this.refresh();
  }

  toggleSmartGuides() {
    this.smartGuidesEnabled = !this.smartGuidesEnabled;
    this.streams.smartGuides.next(this.smartGuidesEnabled);
    this.streams.tool.$message.next('Smart Guides: ' + (this.smartGuidesEnabled ? 'ON' : 'OFF'));
    this.refresh();
  }

  applyInputConstraints(p: { x: number, y: number }, base?: { x: number, y: number }) {
    if (!base) base = this.referencePoint;

    if (this.orthoMode && base) {
      const dx = Math.abs(p.x - base.x);
      const dy = Math.abs(p.y - base.y);
      if (dx > dy) {
        p.y = base.y;
      } else {
        p.x = base.x;
      }
    } else if (this.polarMode && base) {
      const dx = p.x - base.x;
      const dy = p.y - base.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      // Snap to 45 degree increments
      let angle = Math.atan2(dy, dx);
      const increment = Math.PI / 4; // 45 degrees
      const snappedAngle = Math.round(angle / increment) * increment;

      // If close to the angle (within ~5 degrees?), stick to it.
      // But usually Polar just locks "if nearby". For simplicity, let's just lock it 
      // or check if it's "close enough".
      // Text says: "Crea guías invisibles... Cuando muevas el cursor cerca de esos ángulos..."
      const threshold = 5 * Math.PI / 180;
      if (Math.abs(angle - snappedAngle) < threshold) {
        p.x = base.x + dist * Math.cos(snappedAngle);
        p.y = base.y + dist * Math.sin(snappedAngle);
      }
    }
    return p;
  }

  __drawWorkspace(ctx, workspace, pipeline) {
    for (const drawPredicate of pipeline) {
      for (const layers of workspace) {
        for (const layer of layers) {
          for (const obj of layer.objects) {
            obj.accept((obj) => {
              if (!obj.visible) return true;
              if (drawPredicate(obj)) {
                try {
                  this.__draw(ctx, layer, obj);
                } catch (e) {
                  console.log(e);
                }
              }
              return true;
            });
          }
        }
      }
    }
  }

  __draw(ctx, layer, obj) {
    const style = this.getStyleForObject(layer, obj);
    if (style !== this.__prevStyle) {
      this.setStyle(style, ctx);
    }
    this.__prevStyle = style;
    obj.draw(ctx, this.scale / this.retinaPxielRatio, this);
  }

  getStyleForObject(layer, obj) {
    if (obj.style != null) {
      return obj.style;
    } else if (obj.role != null) {
      const style = layer.stylesByRoles[obj.role];
      if (style) {
        return style;
      }
    }
    return layer.style;
  }

  setStyle(style, ctx) {
    draw_utils.SetStyle(style, ctx, this.scale / this.retinaPxielRatio);
  }

  drawSmartGuides(ctx) {
    ctx.save();
    ctx.strokeStyle = '#66bb6a'; // Green color
    ctx.lineWidth = 1 / this.interactiveScale;
    ctx.setLineDash([5 / this.interactiveScale, 5 / this.interactiveScale]);

    for (const guide of this.smartGuideLines) {
      ctx.beginPath();
      ctx.moveTo(guide.x1, guide.y1);
      ctx.lineTo(guide.x2, guide.y2);
      ctx.stroke();
    }

    ctx.restore();
  }

  updateSmartGuides(currentPoint: { x: number, y: number }, excludeObjects: any[] = []) {
    this.smartGuideLines = [];

    if (!this.smartGuidesEnabled || !currentPoint) {
      return;
    }

    const TOLERANCE = 5 / this.interactiveScale;
    const GUIDE_EXTENSION = 1000; // How far the guide line extends

    // Collect all points from objects
    const points: Array<{ x: number, y: number, obj: any }> = [];

    for (const layer of this.layers) {
      for (const obj of layer.objects) {
        if (excludeObjects.includes(obj)) continue;

        obj.accept((o) => {
          if (o._class === 'TCAD.TWO.EndPoint' && o.visible) {
            points.push({ x: o.x, y: o.y, obj: o });
          }
          return true;
        });
      }
    }

    // Check for horizontal and vertical alignments
    for (const pt of points) {
      // Vertical alignment (same X)
      if (Math.abs(currentPoint.x - pt.x) < TOLERANCE) {
        this.smartGuideLines.push({
          x1: pt.x,
          y1: pt.y - GUIDE_EXTENSION,
          x2: pt.x,
          y2: pt.y + GUIDE_EXTENSION,
          type: 'vertical'
        });
      }

      // Horizontal alignment (same Y)
      if (Math.abs(currentPoint.y - pt.y) < TOLERANCE) {
        this.smartGuideLines.push({
          x1: pt.x - GUIDE_EXTENSION,
          y1: pt.y,
          x2: pt.x + GUIDE_EXTENSION,
          y2: pt.y,
          type: 'horizontal'
        });
      }
    }
  }

  snap(x, y, excl) {
    this.cleanSnap();
    if (!this.osnapEnabled) return null;
    const snapTo = this.search(x, y, DEFAULT_SEARCH_BUFFER, true, false, excl);

    let bestDist = Number.MAX_VALUE;
    let bestPoint = null;
    const sScale = this.scale / this.retinaPxielRatio;

    for (let i = 0; i < snapTo.length; i++) {
      const o = snapTo[i];
      if (isEndPoint(o)) {
        // Distance is already checked by search to be within buffer, but effectively we want closest
        // We can re-check simple distance
        const dist = Math.hypot(o.x - x, o.y - y);
        if (dist < bestDist) {
          bestDist = dist;
          bestPoint = o;
        }
      } else {
        const center = o.labelCenter;
        if (center) {
          const dist = Math.hypot(center.x - x, center.y - y);
          if (dist * sScale <= DEFAULT_SEARCH_BUFFER && dist < bestDist) {
            bestDist = dist;
            this.snapPoint.x = center.x;
            this.snapPoint.y = center.y;
            bestPoint = this.snapPoint;
          }
        }
      }
    }

    // New Snapping Logic: Quadrants and Intersections
    // Quadrants (Circles and Arcs)
    for (let i = 0; i < snapTo.length; i++) {
      const o = snapTo[i];
      if (o instanceof Circle || o instanceof Arc) {
        const c = o instanceof Circle ? o.c : o.c;
        const r = o instanceof Circle ? o.r.get() : o.r.get();
        const quads = [
          { x: c.x + r, y: c.y },
          { x: c.x - r, y: c.y },
          { x: c.x, y: c.y + r },
          { x: c.x, y: c.y - r }
        ];
        for (let q of quads) {
          const dist = Math.hypot(q.x - x, q.y - y);
          if (dist * sScale <= DEFAULT_SEARCH_BUFFER && dist < bestDist) {
            bestDist = dist;
            this.snapPoint.x = q.x;
            this.snapPoint.y = q.y;
            bestPoint = this.snapPoint;
          }
        }
      }
    }

    // Intersection (Segment-Segment)
    // Only check intersections between objects in 'snapTo' to avoid N^2 global check
    for (let i = 0; i < snapTo.length; i++) {
      for (let j = i + 1; j < snapTo.length; j++) {
        const o1 = snapTo[i];
        const o2 = snapTo[j];
        if (o1 instanceof Segment && o2 instanceof Segment) {
          // Calculate intersection
          const det = (o1.b.x - o1.a.x) * (o2.b.y - o2.a.y) - (o2.b.x - o2.a.x) * (o1.b.y - o1.a.y);
          if (det !== 0) {
            const lambda = ((o2.b.y - o2.a.y) * (o2.b.x - o1.a.x) + (o2.a.x - o2.b.x) * (o2.b.y - o1.a.y)) / det;
            const gamma = ((o1.a.y - o1.b.y) * (o2.b.x - o1.a.x) + (o1.b.x - o1.a.x) * (o2.b.y - o1.a.y)) / det;
            if ((0 <= lambda && lambda <= 1) && (0 <= gamma && gamma <= 1)) {
              const ix = o1.a.x + lambda * (o1.b.x - o1.a.x);
              const iy = o1.a.y + lambda * (o1.b.y - o1.a.y);

              const dist = Math.hypot(ix - x, iy - y);
              if (dist * sScale <= DEFAULT_SEARCH_BUFFER && dist < bestDist) {
                bestDist = dist;
                this.snapPoint.x = ix;
                this.snapPoint.y = iy;
                bestPoint = this.snapPoint;
              }
            }
          }
        }
      }
    }

    if (bestPoint !== null) {
      if (bestPoint === this.snapPoint) {
        this.snapPoint.visible = true;
      } else {
        this.snapPoint.visible = false;
      }
      this.capture('tool', [bestPoint], true);
    }
    return this.snapped;
  }

  cleanSnap() {
    this.withdrawAll('tool');
    this.snapPoint.visible = false;
  }

  showBounds(x1, y1, x2, y2) {
    const dx = Math.max(x2 - x1, 1);
    const dy = Math.max(y2 - y1, 1);
    const cRatio = this.canvas.width / this.canvas.height;

    if (dy * cRatio >= dx) {
      this.scale = this.canvas.height / dy;
    } else {
      this.scale = this.canvas.width / dx;
    }
    this.translate.x = -x1 * this.scale;
    this.translate.y = -y1 * this.scale;
  }

  fit() {
    let count = 0;
    const bbox = new BBox();
    this.accept(obj => {
      count++;
      bbox.check(obj);
      return true;
    });
    if (count < 2 || !bbox.isValid()) {
      return;
    }

    const bounds = bbox.bbox;
    this.showBounds(bounds[0], bounds[1], bounds[2], bounds[3]);
    bbox.inc(20 / this.scale);
    this.showBounds(bounds[0], bounds[1], bounds[2], bounds[3]);
  }

  screenToModel2(x, y, out) {
    out.x = x * this.retinaPxielRatio;
    out.y = this.canvas.height - y * this.retinaPxielRatio;

    if (this.transformation) {
      out.z = 0;
      this.screenToModelMatrix._apply(out);
    } else {
      out.x -= this.translate.x;
      out.y -= this.translate.y;

      out.x /= this.scale;
      out.y /= this.scale;
    }
  }

  screenToModel(e) {
    return this._screenToModel(e.offsetX, e.offsetY);
  }

  _screenToModel(x, y) {
    const out = { x: 0, y: 0 };
    this.screenToModel2(x, y, out);
    return out;
  }

  screenToModelDistance(dist) {
    measurer.x = 0;
    measurer.y = 0;
    this.screenToModel2(0, 0, measurer);
    const x0 = measurer.x;
    this.screenToModel2(dist, 0, measurer);
    return Math.abs(measurer.x - x0);
  }

  accept = visitor => {
    for (const layer of this.layers) {
      for (const object of layer.objects) {
        if (!object.accept(visitor)) {
          return false;
        }
      }
    }
  };

  //same as accept but without controlling when to break the flow
  traverse(visitor) {
    for (const layer of this.layers) {
      layer.traverseSketchObjects(visitor)
    }
  }

  findLayerByName(name) {
    for (let i = 0; i < this.layers.length; i++) {
      if (this.layers[i].name == name) {
        return this.layers[i];
      }
    }
    return null;
  }

  findById(id) {
    let result = null;
    this.accept(function (o) {
      if (o.id === id) {
        result = o;
        return false;
      }
      return true;
    });
    return result;
  }

  createIndex() {
    const index = {};
    this.traverse(o => index[o.id] = o);
    return index;
  }

  select(objs, exclusive) {
    if (this.customSelectionHandler) {
      this.customSelectionHandler(objs, exclusive);
      return;
    }
    this.capture('selection', objs, exclusive);
    this.streams.selection.next(this.selected);
  }

  capture(type, objs, exclusive) {
    if (exclusive) this.withdrawAll(type);
    const captured = this.captured[type];
    for (let i = 0; i < objs.length; i++) {
      const obj = objs[i];
      if (captured.indexOf(obj) === -1) {
        captured.push(obj);
        obj.addMarker(CAPTURES[type]);
      }
    }
  }


  withdraw(type, obj) {
    const captured = this.captured[type];
    for (let i = 0; i < captured.length; i++) {
      if (obj === captured[i]) {
        captured.splice(i, 1)[0].removeMarker(CAPTURES[type]);
        break;
      }
    }
  }

  withdrawAll(type) {
    const captured = this.captured[type];
    for (let i = 0; i < captured.length; i++) {
      captured[i].removeMarker(CAPTURES[type]);
    }
    while (captured.length > 0) captured.pop();
  }

  withdrawGlobal() {
    Object.keys(this.captured).forEach(type => this.withdrawAll(type));
    this.streams.selection.next(this.selected);
  }

  deselect(obj) {
    this.withdraw('selection', obj);
    this.streams.selection.next(this.selected);
  }

  deselectAll() {
    this.withdrawAll('selection');
    this.streams.selection.next(this.selected);
  }

  highlight(objs, exclusive) {
    this.capture('highlight', objs, exclusive);
  }

  unHighlightAll(objs) {
    this.withdrawAll('highlight');
  }

  unHighlight(objs) {
    this.withdraw('highlight', objs);
  }

  pick(e) {
    const m = this.screenToModel(e);
    return this.search(m.x, m.y, DEFAULT_SEARCH_BUFFER, true, false, []);
  }

  get activeLayer() {
    let layer = this._activeLayer;
    if (layer == null || layer.readOnly) {
      layer = null;
      for (let i = 0; i < this.layers.length; i++) {
        const l = this.layers[i];
        if (!l.readOnly) {
          layer = l;
          break;
        }
      }
    }
    return this.findLayerByName(PREDEFINED_LAYERS.SKETCH);
  }

  set activeLayerName(layerName) {
    const layer = this.findLayerByName(layerName);
    if (layer) {
      this._activeLayer = layer;
    } else {
      console.warn("layer doesn't exist: " + layerName);
    }
  }

  setActiveLayer(layer) {
    if (!layer.readOnly) {
      this._activeLayer = layer;
    }
  }

  fullHeavyUIRefresh() {
    this.refresh();
    this.parametricManager.notify();
  }

  createLayer<T>(name, style) {
    return new Layer<T>(name, style, this)
  }

  objectsUpdate = () => this.streams.objectsUpdate.next();

  get addingRoleMode() {
    return this.streams.addingRoleMode.value;
  }

  set addingRoleMode(value) {
    this.streams.addingRoleMode.next(value);
  }

  static __SKETCH_DRAW_PIPELINE = [
    (obj) => !isEndPoint(obj) && !obj.marked && isConstruction(obj),
    (obj) => !isEndPoint(obj) && !obj.marked && !isConstruction(obj),
    (obj) => !isEndPoint(obj) && obj.marked,
    (obj) => isEndPoint(obj) && !obj.marked,
    (obj) => isEndPoint(obj) && obj.marked
  ];

  static __SIMPLE_DRAW_PIPELINE = [
    (obj) => true
  ];
}

const isEndPoint = o => o._class === 'TCAD.TWO.EndPoint';
const isConstruction = o => o.role === 'construction';

export class Layer<T = Shape> {

  name: any;
  style: any;
  stylesByRoles: { virtual: any; objectConstruction: any; construction: any };
  objects: T[];
  readOnly: boolean;
  viewer: Viewer;

  constructor(name, style, viewer) {
    this.name = name;
    this.style = style;
    this.stylesByRoles = {
      'objectConstruction': Styles.CONSTRUCTION_OF_OBJECT,
      'construction': Styles.CONSTRUCTION,
      'virtual': Styles.VIRTUAL
    };
    this.objects = [];
    this.readOnly = false; // This is actually a mark for boundary layers coming from 3D
    this.viewer = viewer;
  }

  remove(object) {
    const idx = this.objects.indexOf(object);
    if (idx !== -1) {
      this.objects.splice(idx, 1);
      object.stage.unassignObject(object);
      this.viewer.objectsUpdate();
      return true;
    }
    return false;
  }

  add(object) {
    if (object.layer !== undefined) {
      if (object.layer != null) {
        object.layer.remove(object);
      }
      if (object.layer !== this) {
        object.layer = this;
        this._addAndNotify(object);
      }
    } else {
      this._addAndNotify(object);
    }
  }

  traverseSketchObjects(callback) {
    this.objects.forEach(o => {
      if (o instanceof SketchObject) {
        o.traverse(callback)
      }
    });
  }

  _addAndNotify(object) {
    if (this.viewer.addingRoleMode) {
      object.role = this.viewer.addingRoleMode;
    }
    this.objects.push(object);
    if (!object.stage) {
      this.viewer.parametricManager.stage.assignObject(object);
    }
    this.viewer.objectsUpdate();
  }
}

const CAPTURES = {
  highlight2: {
    ...Styles.HIGHLIGHT2,
    priority: 1
  },
  tool: {
    ...Styles.TOOL_HELPER,
    priority: 2
  },
  highlight: {
    ...Styles.HIGHLIGHT,
    priority: 3
  },
  selection: {
    ...Styles.SELECTION,
    priority: 4
  },
};

const measurer = { x: 0, y: 0, z: 0 };

export const DEFAULT_SEARCH_BUFFER = 20;

export const PREDEFINED_LAYERS = {
  SKETCH: "sketch",
  GROUND: "ground",
};

export { Styles };