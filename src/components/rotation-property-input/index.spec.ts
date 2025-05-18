import { describe, it, expect } from 'vitest';
import { defineDraggableNumber } from '../draggable-number';
import { definePropertyInput } from '../property-input';
import { defineRotationPropertyInput } from './index';

defineDraggableNumber();
definePropertyInput();
defineRotationPropertyInput();

describe('rotation-property-input', () => {
    it('formats value into rotations and degrees', async () => {
        document.body.innerHTML = '<cc-rotation-property-input value="390"></cc-rotation-property-input>';
        const comp = document.querySelector('cc-rotation-property-input') as HTMLElement & { value: number; shadowRoot: ShadowRoot; updateComplete: Promise<unknown> };
        await comp.updateComplete;
        const rotations = comp.shadowRoot.querySelector('[part=rotations]') as HTMLElement & { value: number; shadowRoot: ShadowRoot; updateComplete: Promise<unknown> };
        const degrees = comp.shadowRoot.querySelector('[part=degrees]') as HTMLElement & { value: number; shadowRoot: ShadowRoot; updateComplete: Promise<unknown> };
        await rotations.updateComplete;
        await degrees.updateComplete;
        const rotSpan = rotations.shadowRoot.querySelector('span') as HTMLElement;
        const degSpan = degrees.shadowRoot.querySelector('span') as HTMLElement;

        expect(rotSpan.textContent).toBe('1');
        expect(degSpan.textContent).toBe('+30');
    });

    it('updates value when parts change', async () => {
        document.body.innerHTML = '<cc-rotation-property-input value="390"></cc-rotation-property-input>';
        const comp = document.querySelector('cc-rotation-property-input') as HTMLElement & { value: number; shadowRoot: ShadowRoot; updateComplete: Promise<unknown> };
        await comp.updateComplete;
        const rotations = comp.shadowRoot.querySelector('[part=rotations]') as HTMLElement & { value: number; shadowRoot: ShadowRoot; updateComplete: Promise<unknown> };
        const degrees = comp.shadowRoot.querySelector('[part=degrees]') as HTMLElement & { value: number; shadowRoot: ShadowRoot; updateComplete: Promise<unknown> };
        await rotations.updateComplete;
        await degrees.updateComplete;
        rotations.value = 2 * 360 + 30;
        rotations.dispatchEvent(new Event('change'));
        await comp.updateComplete;
        expect(comp.value).toBe(2 * 360 + 30);

        degrees.value = 2 * 360 + 45;
        degrees.dispatchEvent(new Event('change'));
        await comp.updateComplete;
        expect(comp.value).toBe(2 * 360 + 45);
    });
});
