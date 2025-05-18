import { describe, it, expect } from 'vitest';
import { defineDraggableNumber } from '../draggable-number';
import { definePropertyInput } from '../property-input';
import { definePercentPropertyInput } from './index';

defineDraggableNumber();
definePropertyInput();
definePercentPropertyInput();

describe('percent-property-input', () => {
    it('formats value into percent', async () => {
        document.body.innerHTML = '<cc-percent-property-input value="0.35"></cc-percent-property-input>';
        const comp = document.querySelector('cc-percent-property-input') as HTMLElement & { value: number; shadowRoot: ShadowRoot; updateComplete: Promise<unknown> };
        await comp.updateComplete;
        const percent = comp.shadowRoot.querySelector('[part=percent]') as HTMLElement & { value: number; shadowRoot: ShadowRoot; updateComplete: Promise<unknown> };
        await percent.updateComplete;
        const span = percent.shadowRoot.querySelector('span') as HTMLElement;
        expect(span.textContent).toBe('35');
    });

    it('updates value when percent changes', async () => {
        document.body.innerHTML = '<cc-percent-property-input value="0.35"></cc-percent-property-input>';
        const comp = document.querySelector('cc-percent-property-input') as HTMLElement & { value: number; shadowRoot: ShadowRoot; updateComplete: Promise<unknown> };
        await comp.updateComplete;
        const percent = comp.shadowRoot.querySelector('[part=percent]') as HTMLElement & { value: number; updateComplete: Promise<unknown> };
        percent.value = 0.45;
        percent.dispatchEvent(new Event('change'));
        await comp.updateComplete;
        expect(comp.value).toBeCloseTo(0.45);
    });

    it('forwards min and max to the draggable number', async () => {
        document.body.innerHTML = '<cc-percent-property-input min="0" max="1"></cc-percent-property-input>';
        const comp = document.querySelector('cc-percent-property-input') as HTMLElement & {
            shadowRoot: ShadowRoot;
            updateComplete: Promise<unknown>;
        };
        await comp.updateComplete;
        const percent = comp.shadowRoot.querySelector('[part=percent]') as HTMLElement & {
            min: number | null;
            max: number | null;
            updateComplete: Promise<unknown>;
        };
        await percent.updateComplete;
        expect(percent.min).toBe(0);
        expect(percent.max).toBe(1);
    });
});
