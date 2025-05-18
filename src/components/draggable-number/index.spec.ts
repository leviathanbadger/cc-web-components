import { describe, it, expect, vi } from 'vitest';
import { DraggableNumber, defineDraggableNumber } from './index.js';

describe('DraggableNumber', () => {
    it('releases pointer capture on pointerup', () => {
        const component = new DraggableNumber();
        const input = {
            setPointerCapture: vi.fn(),
            releasePointerCapture: vi.fn()
        } as unknown as HTMLInputElement;

        const downEvent = {
            target: input,
            clientX: 0,
            pointerId: 1
        } as PointerEvent;
        component['_onPointerDown'](downEvent);
        expect(input.setPointerCapture).toHaveBeenCalledWith(1);

        const upEvent = {
            target: input,
            pointerId: 1
        } as PointerEvent;
        component['_stopDrag'](upEvent);
        expect(input.releasePointerCapture).toHaveBeenCalledWith(1);
    });

    it('adjusts value with arrow keys', () => {
        const component = new DraggableNumber();
        component.value = 0;

        const upEvent = { key: 'ArrowUp', preventDefault: vi.fn() } as unknown as KeyboardEvent;
        component['_onKeyDown'](upEvent);
        expect(component.value).toBe(1);
        expect(upEvent.preventDefault).toHaveBeenCalled();

        const downEvent = { key: 'ArrowDown', preventDefault: vi.fn() } as unknown as KeyboardEvent;
        component['_onKeyDown'](downEvent);
        expect(component.value).toBe(0);
        expect(downEvent.preventDefault).toHaveBeenCalled();
    });
});

defineDraggableNumber();
describe('draggable-number DOM', () => {
    it('shows input after click', async () => {
        document.body.innerHTML = '<cc-draggable-number></cc-draggable-number>';
        const comp = document.querySelector('cc-draggable-number') as HTMLElement & { shadowRoot: ShadowRoot; updateComplete: Promise<unknown> };
        await comp.updateComplete;
        expect(comp.shadowRoot.querySelector('span')).not.toBeNull();
        expect(comp.shadowRoot.querySelector('input')).toBeNull();
        const span = comp.shadowRoot.querySelector('span') as HTMLElement;
        span.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await comp.updateComplete;
        expect(comp.shadowRoot.querySelector('input')).not.toBeNull();
    });
});
