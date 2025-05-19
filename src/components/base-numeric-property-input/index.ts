import { LitElement, css, unsafeCSS } from 'lit';
import componentStyles from './style.css?inline';
import { defineDraggableNumber } from '../draggable-number';
import { definePropertyInput } from '../property-input';

// Shared DraggableNumber element interface
export type DraggableNumberElement = HTMLElement & { value: number };

export class BaseNumericPropertyInput extends LitElement {
    static styles = css`${unsafeCSS(componentStyles)}`;

    static properties = {
        value: { type: Number, reflect: true },
        min: { type: Number, reflect: true },
        max: { type: Number, reflect: true },
        disabled: { type: Boolean, reflect: true }
    } as const;

    declare value: number;
    declare min: number | null;
    declare max: number | null;
    declare disabled: boolean;

    constructor() {
        super();
        if (!this.hasAttribute('value')) {
            this.value = 0;
        }
        if (!this.hasAttribute('min')) {
            this.min = null;
        }
        if (!this.hasAttribute('max')) {
            this.max = null;
        }
        if (!this.hasAttribute('disabled')) {
            this.disabled = false;
        }
    }

    protected _onNumberChange = (e: Event) => {
        const val = (e.target as DraggableNumberElement).value;
        this.value = val;
        this.dispatchEvent(new Event('change'));
    };

    connectedCallback() {
        super.connectedCallback();
        definePropertyInput();
        defineDraggableNumber();
    }
}

export function defineBaseNumericPropertyInput() {
    if (!customElements.get('cc-base-numeric-property-input')) {
        customElements.define('cc-base-numeric-property-input', BaseNumericPropertyInput);
    }
}
