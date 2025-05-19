import { css, unsafeCSS } from 'lit';
import componentStyles from './style.css?inline';
import { template } from './template';
import { BaseNumericPropertyInput, defineBaseNumericPropertyInput } from '../base-numeric-property-input';
import { registerElement } from '../../register';

export class PercentPropertyInput extends BaseNumericPropertyInput {
    static styles = css`${unsafeCSS(componentStyles)}`;

    render() {
        return template(
            this.value,
            this._onNumberChange,
            this.min,
            this.max,
            this.disabled
        );
    }
}

export function definePercentPropertyInput() {
    defineBaseNumericPropertyInput();
    registerElement('cc-percent-property-input', PercentPropertyInput);
}
