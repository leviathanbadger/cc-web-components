import { LitElement, css, unsafeCSS } from 'lit';
import componentStyles from './style.css?inline';
import { template } from './template';

type DraggableNumberElement = HTMLElement & { value: number };

export class PropertyInput extends LitElement {
    static styles = css`${unsafeCSS(componentStyles)}`;

    static properties = {
        value: { type: Number, reflect: true },
        disabled: { type: Boolean, reflect: true }
    };

    declare value: number;
    declare disabled: boolean;

    constructor() {
        super();
        if (!this.hasAttribute('value')) {
            this.value = 0;
        }
        if (!this.hasAttribute('disabled')) {
            this.disabled = false;
        }
    }

    private _listeners = new Map<DraggableNumberElement, EventListener>();

    render() {
        return template(this._onSlotChange.bind(this));
    }

    connectedCallback() {
        super.connectedCallback();
        this._setupListeners();
    }

    updated(changed: Map<string, unknown>) {
        if (changed.has('value') || changed.has('disabled')) {
            this._updateChildren();
            if (changed.has('value') && changed.get('value') !== undefined) {
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
            (num as unknown as { disabled?: boolean }).disabled = this.disabled;
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
            (num as unknown as { disabled?: boolean }).disabled = this.disabled;
        });
    }
}

export function definePropertyInput() {
    if (!customElements.get('cc-property-input')) {
        customElements.define('cc-property-input', PropertyInput);
    }
}
