import { css, unsafeCSS } from 'lit';
import componentStyles from './style.css?inline';
import { template } from './template';
import { BaseNumericPropertyInput } from '../base-numeric-property-input';
import { registerElement } from '../../register';

export class RotationPropertyInput extends BaseNumericPropertyInput {
    static styles = css`${unsafeCSS(componentStyles)}`;

    render() {
        return template(
            this.value,
            this._onNumberChange.bind(this),
            this.min,
            this.max,
            this.disabled
        );
    }
}

export function defineRotationPropertyInput() {
    registerElement('cc-rotation-property-input', RotationPropertyInput);
}
