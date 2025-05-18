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

    private _split(value: number) {
        const rotations = Math.trunc(value / 360);
        const remainder = value - rotations * 360;
        const sign = remainder >= 0 ? '+' : '-';
        const degrees = Math.abs(remainder);
        return { rotations, sign, degrees };
    }

    private _onRotationsChange(e: Event) {
        const rot = (e.target as DraggableNumberElement).value;
        const { sign, degrees } = this._split(this.value);
        const signedDeg = sign === '-' ? -degrees : degrees;
        this.value = rot * 360 + signedDeg;
        this.dispatchEvent(new Event('change'));
    }

    private _onDegreesChange(e: Event) {
        const deg = (e.target as DraggableNumberElement).value;
        const { rotations, sign } = this._split(this.value);
        const signedDeg = sign === '-' ? -deg : deg;
        this.value = rotations * 360 + signedDeg;
        this.dispatchEvent(new Event('change'));
    }

    connectedCallback() {
        super.connectedCallback();
        definePropertyInput();
        defineDraggableNumber();
    }

    render() {
        const { rotations, sign, degrees } = this._split(this.value);
        return template(
            rotations,
            sign,
            degrees,
            this._onRotationsChange.bind(this),
            this._onDegreesChange.bind(this)
        );
    }
}

export function defineRotationPropertyInput() {
    if (!customElements.get('cc-rotation-property-input')) {
        customElements.define('cc-rotation-property-input', RotationPropertyInput);
    }
}
