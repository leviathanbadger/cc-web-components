import { LitElement, css, unsafeCSS } from 'lit';
import componentStyles from './style.css?inline';
import { template } from './template';
import { process_drag } from '../../wasm-bindings/cc_web_components.js';

export type DraggableNumberType =
    | 'raw'
    | 'whole-rotation'
    | 'part-rotation'
    | 'percent';

export class DraggableNumber extends LitElement {
    static styles = css`${unsafeCSS(componentStyles)}`;

    static properties = {
        value: { type: Number, reflect: true },
        type: { type: String }
    } as const;

    private _dragging = false;
    private _moved = false;
    private _startValue = 0;
    private _startX = 0;
    private _lockDelta = 0;

    declare value: number;
    declare type: DraggableNumberType;

    constructor() {
        super();
        if (!this.hasAttribute('value')) {
            this.value = 0;
        }
        if (!this.hasAttribute('type')) {
            this.type = 'raw';
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
            this._onClick.bind(this)
        );
    }

    private _onBlur(e: Event) {
        const input = e.target as HTMLInputElement;
        const raw = parseFloat(input.value);
        if (!isNaN(raw)) {
            this.value = this._parseValue(raw);
            this.dispatchEvent(new Event('change'));
        }
        this._setEditing(false);
    }

    private _onPointerDown(e: PointerEvent) {
        const target = e.target as HTMLElement;
        this._dragging = true;
        this._moved = false;
        this._lockDelta = 0;
        this._startX = e.clientX;
        this._startValue = this.value;
        target.setPointerCapture(e.pointerId);
        if (target.requestPointerLock) {
            target.requestPointerLock();
        }
    }

    private _onPointerMove(e: PointerEvent) {
        if (!this._dragging) return;
        let delta: number;
        if (typeof document !== 'undefined' && document.pointerLockElement) {
            this._lockDelta += e.movementX;
            delta = this._lockDelta;
        } else {
            delta = e.clientX - this._startX;
        }
        if (delta !== 0) this._moved = true;
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
                this._onBlur({ target: input } as Event);
                e.preventDefault();
            }
            return;
        }

        if (e.key === 'Enter') {
            this._setEditing(true);
            e.preventDefault();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
            this.value += 1;
            this.dispatchEvent(new Event('change'));
            e.preventDefault();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
            this.value -= 1;
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
