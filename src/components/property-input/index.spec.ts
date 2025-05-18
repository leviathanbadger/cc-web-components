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

    it('manages listeners for dynamically added and removed draggable numbers', async () => {
        document.body.innerHTML = `
            <cc-property-input value="3">
                <cc-draggable-number id="first"></cc-draggable-number>
            </cc-property-input>
        `;

        const container = document.querySelector('cc-property-input') as HTMLElement & { value: number; updateComplete: Promise<unknown> };
        await container.updateComplete;
        const first = container.querySelector('#first') as HTMLElement & { value: number; updateComplete: Promise<unknown> };

        const second = document.createElement('cc-draggable-number') as HTMLElement & { value: number; updateComplete: Promise<unknown> };
        second.id = 'second';
        container.appendChild(second);
        (container as unknown as { _onSlotChange: () => void })._onSlotChange();
        await second.updateComplete;

        expect(second.value).toBe(3);

        let changeCount = 0;
        const onChange = () => changeCount++;
        container.addEventListener('change', onChange);

        second.value = 7;
        second.dispatchEvent(new Event('change'));
        await container.updateComplete;
        await first.updateComplete;
        await second.updateComplete;

        expect(container.value).toBe(7);
        expect(first.value).toBe(7);
        expect(changeCount).toBe(1);

        container.removeEventListener('change', onChange);
        second.remove();
        (container as unknown as { _onSlotChange: () => void })._onSlotChange();

        second.value = 12;
        second.dispatchEvent(new Event('change'));
        await container.updateComplete;
        expect(container.value).toBe(7);
    });

    it('dispatches change when its value property updates', async () => {
        document.body.innerHTML = `
            <cc-property-input value="1">
                <cc-draggable-number></cc-draggable-number>
            </cc-property-input>
        `;

        const container = document.querySelector('cc-property-input') as HTMLElement & { value: number; updateComplete: Promise<unknown> };
        await container.updateComplete;
        const child = container.querySelector('cc-draggable-number') as HTMLElement & { value: number; updateComplete: Promise<unknown> };

        let changeCount = 0;
        container.addEventListener('change', () => changeCount++);

        container.value = 2;
        await container.updateComplete;
        await child.updateComplete;

        expect(changeCount).toBe(1);
        expect(child.value).toBe(2);
    });

    it('forwards disabled state to children', async () => {
        document.body.innerHTML = `
            <cc-property-input disabled>
                <cc-draggable-number></cc-draggable-number>
            </cc-property-input>
        `;

        const container = document.querySelector('cc-property-input') as HTMLElement & { updateComplete: Promise<unknown> };
        await container.updateComplete;
        const child = container.querySelector('cc-draggable-number') as HTMLElement & { disabled: boolean };
        expect(child.disabled).toBe(true);
    });
});
