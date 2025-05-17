export class DraggableNumber extends HTMLElement {
    static get observedAttributes() {
        return ['value'];
    }

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.innerHTML = `<input type="number" />`;
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
