import { describe, it, expect } from 'vitest';
import { defineDraggableNumber } from '../src/components/draggable-number';
import { definePropertyInput } from '../src/components/property-input';

defineDraggableNumber();
definePropertyInput();

const hasDom = typeof document !== 'undefined';
(hasDom ? describe : describe.skip)('property-input', () => {
    it('syncs value between nested draggable numbers', () => {
        document.body.innerHTML = `
            <cc-property-input value="5">
                <cc-draggable-number></cc-draggable-number>
                <cc-draggable-number></cc-draggable-number>
            </cc-property-input>
        `;

        const container = document.querySelector('cc-property-input') as any;
        const [first, second] = Array.from(
            container.querySelectorAll('cc-draggable-number')
        ) as any[];

        expect(first.value).toBe(5);
        expect(second.value).toBe(5);

        let changeCount = 0;
        container.addEventListener('change', () => changeCount++);

        first.value = 12;
        first.dispatchEvent(new Event('change'));

        expect(container.value).toBe(12);
        expect(second.value).toBe(12);
        expect(changeCount).toBe(1);
    });
});
