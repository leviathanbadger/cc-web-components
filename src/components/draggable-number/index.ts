import { LitElement, html, css } from 'lit';
import { process_drag } from '../../wasm-bindings/cc_web_components.js';

export class DraggableNumber extends LitElement {
    static styles = css`
        :host {
            display: inline-block;
        }
    `;

    static properties = {
        value: { type: Number, reflect: true }
    };

    private _dragging = false;
    private _startValue = 0;
    private _startX = 0;

    value = 0;

    render() {
        return html`<input
            type="number"
            .value=${String(this.value)}
            @change=${this._onChange}
            @pointerdown=${this._onPointerDown}
            @pointermove=${this._onPointerMove}
            @pointerup=${this._stopDrag}
            @pointercancel=${this._stopDrag}
        />`;
    }

    private _onChange(e: Event) {
        const input = e.target as HTMLInputElement;
        this.value = parseFloat(input.value);
        this.dispatchEvent(new Event('change'));
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
        this.value = this._startValue + process_drag(delta);
        this.dispatchEvent(new Event('change'));
    }

    private _stopDrag() {
        this._dragging = false;
    }
}

export function defineDraggableNumber() {
    if (!customElements.get('cc-draggable-number')) {
        customElements.define('cc-draggable-number', DraggableNumber);
    }
}
