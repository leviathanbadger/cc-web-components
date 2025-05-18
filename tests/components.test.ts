import { describe, it, expect, vi } from 'vitest';
import { process_drag } from '../src/wasm-bindings/cc_web_components.js';
import { DraggableNumber } from '../src/components/draggable-number/index.js';

describe('process_drag', () => {
    it('returns the delta value', () => {
        expect(process_drag(5)).toBe(5);
    });
});

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
