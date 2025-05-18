import { LitElement, css, unsafeCSS } from 'lit';
import componentStyles from './style.css?inline';
import { template } from './template';
import { process_drag } from '../../wasm-bindings/cc_web_components.js';

export class DraggableNumber extends LitElement {
    static styles = css`${unsafeCSS(componentStyles)}`;

    static properties = {
        value: { type: Number, reflect: true }
    };

    private _dragging = false;
    private _startValue = 0;
    private _startX = 0;

    value = 0;

    render() {
        return template(
            this.value,
            this._onChange.bind(this),
            this._onPointerDown.bind(this),
            this._onPointerMove.bind(this),
            this._stopDrag.bind(this)
        );
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
