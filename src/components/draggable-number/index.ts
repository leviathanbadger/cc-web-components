import { LitElement, css, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import componentStyles from './style.css?inline';
import { template } from './template';
import { registerElement } from '../../register';


// Register the custom property for configurable colors if supported
if (typeof CSS !== 'undefined' && 'registerProperty' in CSS) {
    try {
        CSS.registerProperty({
            name: '--cc-mutable-property-color',
            syntax: '<color>',
            inherits: true,
            initialValue: 'currentColor',
        });
    }
    catch {
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

    @property({ type: Number, reflect: true })
    value = 0;

    @property({ type: String })
    type: DraggableNumberType = 'raw';

    @property({ type: Number, reflect: true })
    min: number | null = null;

    @property({ type: Number, reflect: true })
    max: number | null = null;

    @property({ type: Number, reflect: true })
    step: number | null = null;

    @property({ type: Boolean, reflect: true })
    disabled = false;

    @property({ type: Number, attribute: 'drag-factor', reflect: true })
    dragFactor = 1;

    private _dragging = false;
    private _moved = false;
    private _prevX = 0;
    private _dragRemainder = 0;


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
            }
            else if (this._focusDisplayNext) {
                const span = this.shadowRoot?.querySelector('span');
                span?.focus();
                this._focusDisplayNext = false;
            }
        }
        if (changed.has('disabled') && this.disabled) {
            if (this.editing) {
                this._setEditing(false);
            }
            if (
                typeof document !== 'undefined' &&
                typeof (document as Document & { exitPointerLock?: () => void }).exitPointerLock ===
                    'function'
            ) {
                (document as Document & { exitPointerLock?: () => void }).exitPointerLock();
            }
            this._dragging = false;
        }
    }

    render() {
        return template(
            this._formatValue(),
            this.value,
            this.editing,
            this._onBlur,
            this._onKeyDown,
            this._onPointerDown,
            this._onPointerMove,
            this._stopDrag,
            this._onClick,
            this.min,
            this.max,
            this.step,
            this.disabled
        );
    }

    private _onBlur = (e: Event) => {
        if (this.disabled) {
            this._setEditing(false);
            return;
        }
        const input = e.target as HTMLInputElement;
        const raw = parseFloat(input.value);
        if (!isNaN(raw)) {
            this.value = this._applyBounds(this._parseValue(raw));
            this.dispatchEvent(
                new CustomEvent('change', {
                    detail: { value: this.value },
                    bubbles: true
                })
            );
        }
        this._setEditing(false);
    };

    private _onPointerDown = (e: PointerEvent) => {
        if (this.disabled) return;
        const target = e.target as HTMLElement;
        this._dragging = true;
        this._moved = false;
        this._dragRemainder = 0;
        this._prevX = e.clientX;
        target.setPointerCapture(e.pointerId);
        if (target.requestPointerLock) {
            target.requestPointerLock();
        }
    };

    private _onPointerMove = (e: PointerEvent) => {
        if (!this._dragging || this.disabled) return;
        let delta: number;
        const hasLock =
            typeof document !== 'undefined' && document.pointerLockElement;
        if (hasLock) {
            delta = e.movementX;
        }
        else {
            delta = e.clientX - this._prevX;
        }

        if (delta !== 0) this._moved = true;
        let change = delta;
        if (this.type === 'whole-rotation') {
            change *= 360;
        }
        else if (this.type === 'percent') {
            change /= 100;
        }

        change *= this.dragFactor ?? 1;

        const raw = this.value + this._dragRemainder + change;
        const bounded = this._applyBounds(raw);
        this._dragRemainder = raw - bounded;
        this.value = bounded;
        if (!hasLock) {
            this._prevX = e.clientX;
        }
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: { value: this.value },
                bubbles: true
            })
        );
    };

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
        const stepVal = this.step ?? (this.type === 'percent' ? 0.01 : 1);
        if (stepVal > 0) {
            val = Math.round(val / stepVal) * stepVal;
        }
        return val;
    }

    private _stopDrag = (e: PointerEvent) => {
        if (this.disabled) return;
        const target = e.target as HTMLElement;
        this._dragging = false;
        this._dragRemainder = 0;
        target.releasePointerCapture(e.pointerId);
        if (typeof document !== 'undefined' && document.exitPointerLock) {
            document.exitPointerLock();
        }
    };

    private _onClick = () => {
        if (this.disabled) return;
        if (!this._moved) {
            this._setEditing(true);
        }
        this._moved = false;
    };

    private _onKeyDown = (e: KeyboardEvent) => {
        if (this.disabled) return;
        if (this.editing) {
            if (e.key === 'Enter') {
                const input = e.target as HTMLInputElement;
                this._focusDisplayNext = true;
                this._onBlur({ target: input } as unknown as Event);
                e.preventDefault();
            }
            else if (e.key === 'Escape') {
                this._focusDisplayNext = true;
                this._setEditing(false);
                e.preventDefault();
            }
            return;
        }

        if (e.key === 'Enter') {
            this._setEditing(true);
            e.preventDefault();
        }
        else if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
            const increment = this.step ?? (this.type === 'percent' ? 0.01 : 1);
            this.value = this._applyBounds(this.value + increment);
            this.dispatchEvent(
                new CustomEvent('change', {
                    detail: { value: this.value },
                    bubbles: true
                })
            );
            e.preventDefault();
        }
        else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
            const increment = this.step ?? (this.type === 'percent' ? 0.01 : 1);
            this.value = this._applyBounds(this.value - increment);
            this.dispatchEvent(
                new CustomEvent('change', {
                    detail: { value: this.value },
                    bubbles: true
                })
            );
            e.preventDefault();
        }
    };
}

export function defineDraggableNumber() {
    registerElement('cc-draggable-number', DraggableNumber);
}
