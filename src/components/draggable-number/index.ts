import { process_drag } from '../../wasm-bindings/cc_web_components.js';

export class DraggableNumber extends HTMLElement {
    static get observedAttributes() {
        return ['value'];
    }

    private _dragging = false;
    private _startValue = 0;
    private _startX = 0;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.innerHTML = `<input type="number" />`;
    }

    connectedCallback() {
        const input = this.shadowRoot?.querySelector('input') as HTMLInputElement | null;
        if (!input) return;

        input.addEventListener('change', () => {
            this.setAttribute('value', input.value);
            this.dispatchEvent(new Event('change'));
        });

        input.addEventListener('pointerdown', (e: PointerEvent) => {
            this._dragging = true;
            this._startX = e.clientX;
            this._startValue = parseFloat(this.getAttribute('value') ?? '0');
            input.setPointerCapture(e.pointerId);
        });

        input.addEventListener('pointermove', (e: PointerEvent) => {
            if (!this._dragging) return;
            const delta = e.clientX - this._startX;
            const newVal = this._startValue + process_drag(delta);
            this.setAttribute('value', String(newVal));
            this.dispatchEvent(new Event('change'));
        });

        const stopDrag = () => {
            this._dragging = false;
        };

        input.addEventListener('pointerup', stopDrag);
        input.addEventListener('pointercancel', stopDrag);
    }

    attributeChangedCallback(name: string, _oldVal: string | null, newVal: string | null) {
        if (name === 'value' && this.shadowRoot) {
            const input = this.shadowRoot.querySelector('input');
            if (input) {
                (input as HTMLInputElement).value = newVal ?? '';
            }
        }
    }
}

export function defineDraggableNumber() {
    if (!customElements.get('cc-draggable-number')) {
        customElements.define('cc-draggable-number', DraggableNumber);
    }
}
