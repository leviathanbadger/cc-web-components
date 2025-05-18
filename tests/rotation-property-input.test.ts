import { describe, it, expect } from 'vitest';
import { defineDraggableNumber } from '../src/components/draggable-number';
import { definePropertyInput } from '../src/components/property-input';
import { defineRotationPropertyInput } from '../src/components/rotation-property-input';

defineDraggableNumber();
definePropertyInput();
defineRotationPropertyInput();

const hasDom = typeof document !== 'undefined';
(hasDom ? describe : describe.skip)('rotation-property-input', () => {
    it('splits value into rotations and degrees', () => {
        document.body.innerHTML = '<cc-rotation-property-input value="390"></cc-rotation-property-input>';
        const comp = document.querySelector('cc-rotation-property-input') as any;
        const rotations = comp.shadowRoot.querySelector('[part=rotations]') as any;
        const degrees = comp.shadowRoot.querySelector('[part=degrees]') as any;

        expect(rotations.value).toBe(1);
        expect(degrees.value).toBe(30);
    });

    it('updates value when parts change', () => {
        document.body.innerHTML = '<cc-rotation-property-input value="390"></cc-rotation-property-input>';
        const comp = document.querySelector('cc-rotation-property-input') as any;
        const rotations = comp.shadowRoot.querySelector('[part=rotations]') as any;
        const degrees = comp.shadowRoot.querySelector('[part=degrees]') as any;

        rotations.value = 2;
        rotations.dispatchEvent(new Event('change'));
        expect(comp.value).toBe(2 * 360 + 30);

        degrees.value = 45;
        degrees.dispatchEvent(new Event('change'));
        expect(comp.value).toBe(2 * 360 + 45);
    });
});
