import { html } from 'lit';
import { describe, it, expect } from 'vitest';
import { definePropertyInput } from '../property-input';
import { defineDraggableNumber } from '../draggable-number';
import { BaseNumericPropertyInput } from './index';

class TestNumericInput extends BaseNumericPropertyInput {
    render() {
        return html`
            <cc-property-input ?disabled=${this.disabled}>
                <cc-draggable-number
                    id="num"
                    .value=${this.value}
                    .min=${this.min}
                    .max=${this.max}
                    ?disabled=${this.disabled}
                    @change=${this._onNumberChange.bind(this)}
                ></cc-draggable-number>
            </cc-property-input>
        `;
    }
}

function defineTestNumericInput() {
    if (!customElements.get('test-numeric-input')) {
        customElements.define('test-numeric-input', TestNumericInput);
    }
}

definePropertyInput();
defineDraggableNumber();
defineTestNumericInput();

describe('base-numeric-property-input', () => {
    it('updates value when the number changes', async () => {
        document.body.innerHTML = '<test-numeric-input value="5"></test-numeric-input>';
        const comp = document.querySelector('test-numeric-input') as HTMLElement & {
            value: number;
            shadowRoot: ShadowRoot;
            updateComplete: Promise<unknown>;
        };
        await comp.updateComplete;
        const num = comp.shadowRoot.querySelector('#num') as HTMLElement & {
            value: number;
            updateComplete: Promise<unknown>;
        };
        num.value = 8;
        num.dispatchEvent(
            new CustomEvent('change', { bubbles: true, detail: { value: 8 } })
        );
        await comp.updateComplete;
        expect(comp.value).toBe(8);
    });

    it('clamps value between min and max', async () => {
        document.body.innerHTML = '<test-numeric-input min="0" max="10" value="5"></test-numeric-input>';
        const comp = document.querySelector('test-numeric-input') as HTMLElement & {
            value: number;
            shadowRoot: ShadowRoot;
            updateComplete: Promise<unknown>;
        };
        await comp.updateComplete;
        const num = comp.shadowRoot.querySelector('#num') as HTMLElement & {
            updateComplete: Promise<unknown>;
            _onBlur(e: Event): void;
        };
        num._onBlur({ target: { value: '20' } } as unknown as Event);
        await comp.updateComplete;
        expect(comp.value).toBe(10);
        num._onBlur({ target: { value: '-5' } } as unknown as Event);
        await comp.updateComplete;
        expect(comp.value).toBe(0);
    });

    it('propagates disabled to the draggable number', async () => {
        document.body.innerHTML = '<test-numeric-input disabled></test-numeric-input>';
        const comp = document.querySelector('test-numeric-input') as HTMLElement & {
            shadowRoot: ShadowRoot;
            updateComplete: Promise<unknown>;
        };
        await comp.updateComplete;
        const num = comp.shadowRoot.querySelector('#num') as HTMLElement & {
            disabled: boolean;
            updateComplete: Promise<unknown>;
        };
        await num.updateComplete;
        expect(num.disabled).toBe(true);
    });
});
