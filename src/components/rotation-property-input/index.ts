import { LitElement, css, unsafeCSS } from 'lit';
import componentStyles from './style.css?inline';
import { template } from './template';
import { defineDraggableNumber } from '../draggable-number';
import { definePropertyInput } from '../property-input';

type DraggableNumberElement = HTMLElement & { value: number };

export class RotationPropertyInput extends LitElement {
    static styles = css`${unsafeCSS(componentStyles)}`;

    static properties = {
        value: { type: Number, reflect: true }
    };

    value = 0;

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
            this._onNumberChange.bind(this)
        );
    }
}

export function defineRotationPropertyInput() {
    if (!customElements.get('cc-rotation-property-input')) {
        customElements.define('cc-rotation-property-input', RotationPropertyInput);
    }
}
