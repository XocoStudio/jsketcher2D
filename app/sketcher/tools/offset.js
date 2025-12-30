import { Tool } from './tool';
import { Segment } from '../shapes/segment';
import { Circle } from '../shapes/circle';
import { Arc } from '../shapes/arc';

/**
 * Offset Tool - Creates parallel copies of selected objects at a specified distance
 */
export class OffsetTool extends Tool {
    constructor(viewer) {
        super('offset', viewer);
        this.distance = 10; // Default offset distance
        this.selectedObjects = [];
        this.previewObjects = [];
    }

    restart() {
        this.selectedObjects = [];
        this.previewObjects = [];
        this.sendMessage('Select objects to offset, then specify distance');
    }

    cleanup() {
        this.clearPreview();
        this.selectedObjects = [];
    }

    clearPreview() {
        this.previewObjects.forEach(obj => {
            const layer = obj.layer;
            if (layer) {
                layer.remove(obj);
            }
        });
        this.previewObjects = [];
        this.viewer.refresh();
    }

    mouseup(e) {
        const picked = this.viewer.pick(e);

        if (picked.length > 0) {
            const obj = picked[0];

            // Toggle selection
            const index = this.selectedObjects.indexOf(obj);
            if (index === -1) {
                this.selectedObjects.push(obj);
                this.sendMessage(`Selected ${this.selectedObjects.length} object(s). Click to select more or type distance.`);
            } else {
                this.selectedObjects.splice(index, 1);
                this.sendMessage(`Deselected. ${this.selectedObjects.length} object(s) selected.`);
            }

            this.viewer.select(this.selectedObjects, true);
        }
    }

    processCommand(command) {
        const distance = parseFloat(command);

        if (isNaN(distance)) {
            return 'Please enter a valid number for offset distance';
        }

        if (this.selectedObjects.length === 0) {
            return 'Please select objects first';
        }

        this.distance = distance;
        this.createOffset();
        this.viewer.toolManager.releaseControl();
    }

    createOffset() {
        this.viewer.historyManager.checkpoint();

        const offsetObjects = [];

        for (const obj of this.selectedObjects) {
            if (obj instanceof Segment) {
                const offset = this.offsetSegment(obj, this.distance);
                if (offset) {
                    offsetObjects.push(offset);
                }
            } else if (obj instanceof Circle) {
                const offset = this.offsetCircle(obj, this.distance);
                if (offset) {
                    offsetObjects.push(offset);
                }
            } else if (obj instanceof Arc) {
                const offset = this.offsetArc(obj, this.distance);
                if (offset) {
                    offsetObjects.push(offset);
                }
            }
        }

        // Add all offset objects to the layer
        offsetObjects.forEach(obj => {
            this.viewer.activeLayer.add(obj);
        });

        this.viewer.parametricManager.prepare(offsetObjects);
        this.viewer.refresh();

        this.sendMessage(`Created ${offsetObjects.length} offset object(s)`);
    }

    offsetSegment(segment, distance) {
        // Calculate perpendicular vector
        const dx = segment.b.x - segment.a.x;
        const dy = segment.b.y - segment.a.y;
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length === 0) return null;

        // Perpendicular unit vector
        const perpX = -dy / length;
        const perpY = dx / length;

        // Offset points
        const x1 = segment.a.x + perpX * distance;
        const y1 = segment.a.y + perpY * distance;
        const x2 = segment.b.x + perpX * distance;
        const y2 = segment.b.y + perpY * distance;

        return new Segment(x1, y1, x2, y2);
    }

    offsetCircle(circle, distance) {
        const newRadius = circle.r.get() + distance;

        if (newRadius <= 0) {
            this.sendMessage('Warning: Offset distance too large for circle, creating point');
            return null;
        }

        const offsetCircle = new Circle(circle.c.x, circle.c.y);
        offsetCircle.r.set(newRadius);

        return offsetCircle;
    }

    offsetArc(arc, distance) {
        const newRadius = arc.r.get() + distance;

        if (newRadius <= 0) {
            this.sendMessage('Warning: Offset distance too large for arc');
            return null;
        }

        // Calculate new arc points
        const centerX = arc.c.x;
        const centerY = arc.c.y;

        // Get angles
        const startAngle = Math.atan2(arc.a.y - centerY, arc.a.x - centerX);
        const endAngle = Math.atan2(arc.b.y - centerY, arc.b.x - centerX);

        // New points at new radius
        const x1 = centerX + newRadius * Math.cos(startAngle);
        const y1 = centerY + newRadius * Math.sin(startAngle);
        const x2 = centerX + newRadius * Math.cos(endAngle);
        const y2 = centerY + newRadius * Math.sin(endAngle);

        const offsetArc = new Arc(x1, y1, x2, y2);
        offsetArc.c.x = centerX;
        offsetArc.c.y = centerY;
        offsetArc.r.set(newRadius);

        return offsetArc;
    }

    keydown(e) {
        // ESC to cancel
        if (e.keyCode === 27) {
            this.viewer.toolManager.releaseControl();
            return true;
        }
        return false;
    }
}
