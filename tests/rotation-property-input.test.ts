import { describe, it, expect } from 'vitest';
import { defineDraggableNumber } from '../src/components/draggable-number';
import { definePropertyInput } from '../src/components/property-input';
import { defineRotationPropertyInput } from '../src/components/rotation-property-input';

defineDraggableNumber();
definePropertyInput();
defineRotationPropertyInput();

const hasDom = typeof document !== 'undefined';
(hasDom ? describe : describe.skip)('rotation-property-input', () => {
    it('formats value into rotations and degrees', () => {
        document.body.innerHTML = '<cc-rotation-property-input value="390"></cc-rotation-property-input>';
        const comp = document.querySelector('cc-rotation-property-input') as any;
        const rotations = comp.shadowRoot.querySelector('[part=rotations]') as any;
        const degrees = comp.shadowRoot.querySelector('[part=degrees]') as any;
        const rotInput = rotations.shadowRoot.querySelector('input') as HTMLInputElement;
        const degInput = degrees.shadowRoot.querySelector('input') as HTMLInputElement;

        expect(rotInput.value).toBe('1');
        expect(degInput.value).toBe('30');
    });

    it('updates value when parts change', () => {
        document.body.innerHTML = '<cc-rotation-property-input value="390"></cc-rotation-property-input>';
        const comp = document.querySelector('cc-rotation-property-input') as any;
        const rotations = comp.shadowRoot.querySelector('[part=rotations]') as any;
        const degrees = comp.shadowRoot.querySelector('[part=degrees]') as any;
        const rotInput = rotations.shadowRoot.querySelector('input') as HTMLInputElement;
        const degInput = degrees.shadowRoot.querySelector('input') as HTMLInputElement;

        rotInput.value = '2';
        rotInput.dispatchEvent(new Event('change'));
        expect(comp.value).toBe(2 * 360 + 30);

        degInput.value = '45';
        degInput.dispatchEvent(new Event('change'));
        expect(comp.value).toBe(2 * 360 + 45);
    });
});
