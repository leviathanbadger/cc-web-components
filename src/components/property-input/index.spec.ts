import { describe, it, expect } from 'vitest';
import { defineDraggableNumber } from '../draggable-number';
import { definePropertyInput } from './index';

defineDraggableNumber();
definePropertyInput();

describe('property-input', () => {
    it('syncs value between nested draggable numbers', async () => {
        document.body.innerHTML = `
            <cc-property-input value="5">
                <cc-draggable-number></cc-draggable-number>
                <cc-draggable-number></cc-draggable-number>
            </cc-property-input>
        `;

        const container = document.querySelector('cc-property-input') as HTMLElement & { value: number; updateComplete: Promise<unknown> };
        await container.updateComplete;
        const [first, second] = Array.from(
            container.querySelectorAll('cc-draggable-number')
        ) as (HTMLElement & { value: number; updateComplete: Promise<unknown> })[];

        expect(first.value).toBe(5);
        expect(second.value).toBe(5);

        let changeCount = 0;
        container.addEventListener('change', () => changeCount++);

        first.value = 12;
        first.dispatchEvent(new Event('change'));
        await container.updateComplete;
        await first.updateComplete;
        await second.updateComplete;

        expect(container.value).toBe(12);
        expect(second.value).toBe(12);
        expect(changeCount).toBe(1);
    });
});
