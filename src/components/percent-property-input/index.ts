import { LitElement, css, unsafeCSS } from 'lit';
import componentStyles from './style.css?inline';
import { template } from './template';
import { defineDraggableNumber } from '../draggable-number';
import { definePropertyInput } from '../property-input';

type DraggableNumberElement = HTMLElement & { value: number };

export class PercentPropertyInput extends LitElement {
    static styles = css`${unsafeCSS(componentStyles)}`;

    static properties = {
        value: { type: Number, reflect: true },
        min: { type: Number, reflect: true },
        max: { type: Number, reflect: true }
    };

    declare value: number;
    declare min: number | null;
    declare max: number | null;

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
    }

    private _onNumberChange(e: Event) {
        const val = (e.target as DraggableNumberElement).value;
        this.value = val;
        this.dispatchEvent(new Event('change'));
    }

    connectedCallback() {
        super.connectedCallback();
        definePropertyInput();
        defineDraggableNumber();
    }

    render() {
        return template(
            this.value,
            this._onNumberChange.bind(this),
            this.min,
            this.max
        );
    }
}

export function definePercentPropertyInput() {
    if (!customElements.get('cc-percent-property-input')) {
        customElements.define('cc-percent-property-input', PercentPropertyInput);
    }
}
