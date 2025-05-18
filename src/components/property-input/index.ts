import { LitElement, css, unsafeCSS } from 'lit';
import componentStyles from './style.css?inline';
import { template } from './template';

type DraggableNumberElement = HTMLElement & { value: number };

export class PropertyInput extends LitElement {
    static styles = css`${unsafeCSS(componentStyles)}`;

    static properties = {
        value: { type: Number, reflect: true }
    };

    value = 0;

    private _listeners = new Map<DraggableNumberElement, EventListener>();

    render() {
        return template(this._onSlotChange.bind(this));
    }

    connectedCallback() {
        super.connectedCallback();
        this._setupListeners();
    }

    updated(changed: Map<string, unknown>) {
        if (changed.has('value')) {
            this._updateChildren();
            if (changed.get('value') !== undefined) {
                this.dispatchEvent(new Event('change'));
            }
        }
    }

    private _onSlotChange() {
        this._setupListeners();
    }

    private _setupListeners() {
        const numbers = this.querySelectorAll<DraggableNumberElement>('cc-draggable-number');
        numbers.forEach((num) => {
            if (this._listeners.has(num)) return;
            const handler = this._onChildChange.bind(this);
            num.addEventListener('change', handler as EventListener);
            this._listeners.set(num, handler);
            num.value = this.value;
        });
        this._listeners.forEach((handler, num) => {
            if (!num.isConnected || !this.contains(num)) {
                num.removeEventListener('change', handler as EventListener);
                this._listeners.delete(num);
            }
        });
    }

    private _onChildChange(e: Event) {
        const target = e.target as DraggableNumberElement;
        const newVal = typeof target.value === 'number' ? target.value : parseFloat(target.getAttribute('value') ?? '');
        if (!isNaN(newVal) && newVal !== this.value) {
            this.value = newVal;
        }
    }

    private _updateChildren() {
        const numbers = this.querySelectorAll<DraggableNumberElement>('cc-draggable-number');
        numbers.forEach((num) => {
            if (num.value !== this.value) {
                num.value = this.value;
            }
        });
    }
}

export function definePropertyInput() {
    if (!customElements.get('cc-property-input')) {
        customElements.define('cc-property-input', PropertyInput);
    }
}
