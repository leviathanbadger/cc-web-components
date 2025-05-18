import { LitElement, css, unsafeCSS } from 'lit';
import componentStyles from './style.css?inline';
import { template } from './template';
import { process_drag } from '../../wasm-bindings/cc_web_components.js';

export type DraggableNumberType = 'raw' | 'whole-rotation' | 'part-rotation';

export class DraggableNumber extends LitElement {
    static styles = css`${unsafeCSS(componentStyles)}`;

    static properties = {
        value: { type: Number, reflect: true },
        type: { type: String }
    } as const;

    private _dragging = false;
    private _startValue = 0;
    private _startX = 0;

    value = 0;
    type: DraggableNumberType = 'raw';

    render() {
        return template(
            this._formatValue(),
            this._onChange.bind(this),
            this._onPointerDown.bind(this),
            this._onPointerMove.bind(this),
            this._stopDrag.bind(this)
        );
    }

    private _onChange(e: Event) {
        const input = e.target as HTMLInputElement;
        const raw = parseFloat(input.value);
        if (!isNaN(raw)) {
            this.value = this._parseValue(raw);
            this.dispatchEvent(new Event('change'));
        }
    }

    private _onPointerDown(e: PointerEvent) {
        const input = e.target as HTMLInputElement;
        this._dragging = true;
        this._startX = e.clientX;
        this._startValue = this.value;
        input.setPointerCapture(e.pointerId);
    }

    private _onPointerMove(e: PointerEvent) {
        if (!this._dragging) return;
        const delta = e.clientX - this._startX;
        let change = process_drag(delta);
        if (this.type === 'whole-rotation') {
            change *= 360;
        }
        this.value = this._startValue + change;
        this.dispatchEvent(new Event('change'));
    }

    private _formatValue(): number {
        if (this.type === 'whole-rotation') {
            return Math.trunc(this.value / 360);
        }
        if (this.type === 'part-rotation') {
            const rotations = Math.trunc(this.value / 360);
            return this.value - rotations * 360;
        }
        return this.value;
    }

    private _parseValue(input: number): number {
        if (this.type === 'whole-rotation') {
            const remainder = this.value - Math.trunc(this.value / 360) * 360;
            return input * 360 + remainder;
        }
        if (this.type === 'part-rotation') {
            const rotations = Math.trunc(this.value / 360);
            return rotations * 360 + input;
        }
        return input;
    }

    private _stopDrag(e: PointerEvent) {
        const input = e.target as HTMLInputElement;
        this._dragging = false;
        input.releasePointerCapture(e.pointerId);
    }
}

export function defineDraggableNumber() {
    if (!customElements.get('cc-draggable-number')) {
        customElements.define('cc-draggable-number', DraggableNumber);
    }
}
