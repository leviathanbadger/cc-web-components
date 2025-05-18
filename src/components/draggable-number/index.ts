import { LitElement, css, unsafeCSS } from 'lit';
import componentStyles from './style.css?inline';
import { template } from './template';
import { process_drag } from '../../wasm-bindings/cc_web_components.js';

// Register the custom property for configurable colors if supported
if (typeof CSS !== 'undefined' && 'registerProperty' in CSS) {
    try {
        CSS.registerProperty({
            name: '--cc-mutable-property-color',
            syntax: '<color>',
            inherits: true,
            initialValue: 'currentColor',
        });
    } catch {
        // Ignore errors from re-registering or unsupported browsers
    }
}

export type DraggableNumberType =
    | 'raw'
    | 'whole-rotation'
    | 'part-rotation'
    | 'percent';

export class DraggableNumber extends LitElement {
    static styles = css`
        ${unsafeCSS(componentStyles)}
    `;

    static properties = {
        value: { type: Number, reflect: true },
        type: { type: String },
        min: { type: Number, reflect: true },
        max: { type: Number, reflect: true }
    } as const;

    private _dragging = false;
    private _moved = false;
    private _prevX = 0;
    private _lockDelta = 0;

    declare value: number;
    declare type: DraggableNumberType;
    declare min: number | null;
    declare max: number | null;

    constructor() {
        super();
        if (!this.hasAttribute('value')) {
            this.value = 0;
        }
        if (!this.hasAttribute('type')) {
            this.type = 'raw';
        }
        if (!this.hasAttribute('min')) {
            this.min = null;
        }
        if (!this.hasAttribute('max')) {
            this.max = null;
        }
    }

    private _editing = false;
    private _focusDisplayNext = false;

    get editing() {
        return this._editing;
    }

    private _setEditing(val: boolean) {
        const old = this._editing;
        this._editing = val;
        this.requestUpdate('editing', old);
    }

    updated(changed: Map<string, unknown>) {
        super.updated(changed);
        if (changed.has('editing')) {
            if (this.editing) {
                const input = this.shadowRoot?.querySelector('input');
                if (input) {
                    input.focus();
                    if (typeof input.select === 'function') {
                        input.select();
                    }
                }
            } else if (this._focusDisplayNext) {
                const span = this.shadowRoot?.querySelector('span');
                span?.focus();
                this._focusDisplayNext = false;
            }
        }
    }

    render() {
        return template(
            this._formatValue(),
            this.editing,
            this._onBlur.bind(this),
            this._onKeyDown.bind(this),
            this._onPointerDown.bind(this),
            this._onPointerMove.bind(this),
            this._stopDrag.bind(this),
            this._onClick.bind(this),
            this.min,
            this.max
        );
    }

    private _onBlur(e: Event) {
        const input = e.target as HTMLInputElement;
        const raw = parseFloat(input.value);
        if (!isNaN(raw)) {
            this.value = this._applyBounds(this._parseValue(raw));
            this.dispatchEvent(new Event('change'));
        }
        this._setEditing(false);
    }

    private _onPointerDown(e: PointerEvent) {
        const target = e.target as HTMLElement;
        this._dragging = true;
        this._moved = false;
        this._lockDelta = 0;
        this._prevX = e.clientX;
        target.setPointerCapture(e.pointerId);
        if (target.requestPointerLock) {
            target.requestPointerLock();
        }
    }

    private _onPointerMove(e: PointerEvent) {
        if (!this._dragging) return;
        let delta: number;
        const hasLock =
            typeof document !== 'undefined' && document.pointerLockElement;
        if (hasLock) {
            this._lockDelta += e.movementX;
            delta = this._lockDelta;
        } else {
            delta = e.clientX - this._prevX;
        }

        if (delta !== 0) this._moved = true;
        let change = process_drag(delta);
        if (this.type === 'whole-rotation') {
            change *= 360;
        } else if (this.type === 'percent') {
            change /= 100;
        }

        this.value = this._applyBounds(this.value + change);
        if (!hasLock) {
            this._prevX = e.clientX;
        }
        this.dispatchEvent(new Event('change'));
    }

    private _formatValue(): string | number {
        if (this.type === 'whole-rotation') {
            return Math.trunc(this.value / 360);
        }
        if (this.type === 'part-rotation') {
            const rotations = Math.trunc(this.value / 360);
            const val = this.value - rotations * 360;
            const sign = val >= 0 ? '+' : '-';
            return `${sign}${Math.abs(val)}`;
        }
        if (this.type === 'percent') {
            return this.value * 100;
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
        if (this.type === 'percent') {
            return input / 100;
        }
        return input;
    }

    private _applyBounds(val: number): number {
        if (typeof this.min === 'number') {
            val = Math.max(val, this.min);
        }
        if (typeof this.max === 'number') {
            val = Math.min(val, this.max);
        }
        return val;
    }

    private _stopDrag(e: PointerEvent) {
        const target = e.target as HTMLElement;
        this._dragging = false;
        this._lockDelta = 0;
        target.releasePointerCapture(e.pointerId);
        if (typeof document !== 'undefined' && document.exitPointerLock) {
            document.exitPointerLock();
        }
    }

    private _onClick() {
        if (!this._moved) {
            this._setEditing(true);
        }
        this._moved = false;
    }

    private _onKeyDown(e: KeyboardEvent) {
        if (this.editing) {
            if (e.key === 'Enter' || e.key === 'Escape') {
                const input = e.target as HTMLInputElement;
                this._focusDisplayNext = true;
                this._onBlur({ target: input } as unknown as Event);
                e.preventDefault();
            }
            return;
        }

        if (e.key === 'Enter') {
            this._setEditing(true);
            e.preventDefault();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
            const increment = this.type === 'percent' ? 0.01 : 1;
            this.value = this._applyBounds(this.value + increment);
            this.dispatchEvent(new Event('change'));
            e.preventDefault();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
            const increment = this.type === 'percent' ? 0.01 : 1;
            this.value = this._applyBounds(this.value - increment);
            this.dispatchEvent(new Event('change'));
            e.preventDefault();
        }
    }
}

export function defineDraggableNumber() {
    if (!customElements.get('cc-draggable-number')) {
        customElements.define('cc-draggable-number', DraggableNumber);
    }
}
