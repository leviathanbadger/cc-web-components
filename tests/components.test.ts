import { describe, it, expect, beforeEach } from 'vitest';
import { defineDraggableNumber } from '../src/components/draggable-number';

describe('cc-draggable-number', () => {
    beforeEach(() => {
        defineDraggableNumber();
    });

    it('reflects value attribute to input', () => {
        const el = document.createElement('cc-draggable-number');
        el.setAttribute('value', '123');
        document.body.appendChild(el);
        const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
        expect(input.value).toBe('123');
        document.body.removeChild(el);
    });
});
