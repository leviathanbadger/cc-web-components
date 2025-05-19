import { LitElement, css, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import componentStyles from './style.css?inline';
import { defineDraggableNumber } from '../draggable-number';
import { definePropertyInput } from '../property-input';
import { registerElement } from '../../register';

// Shared DraggableNumber element interface
export type DraggableNumberElement = HTMLElement & { value: number };

export class BaseNumericPropertyInput extends LitElement {
    static styles = css`${unsafeCSS(componentStyles)}`;

    @property({ type: Number, reflect: true })
    value = 0;

    @property({ type: Number, reflect: true })
    min: number | null = null;

    @property({ type: Number, reflect: true })
    max: number | null = null;

    @property({ type: Boolean, reflect: true })
    disabled = false;

    protected _onNumberChange = (e: Event) => {
        const val = (e.target as DraggableNumberElement).value;
        this.value = val;
        this.dispatchEvent(
            new CustomEvent('change', { detail: { value: this.value } })
        );
    };

    connectedCallback() {
        super.connectedCallback();
        definePropertyInput();
        defineDraggableNumber();
    }
}

export function defineBaseNumericPropertyInput() {
    registerElement('cc-base-numeric-property-input', BaseNumericPropertyInput);
}
