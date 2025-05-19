import { describe, it, expect, vi } from 'vitest';
import { DraggableNumber, defineDraggableNumber } from './index.js';

describe('DraggableNumber', () => {
    it('locks pointer on pointerdown and releases on pointerup', () => {
        const component = new DraggableNumber();
        const input = {
            setPointerCapture: vi.fn(),
            releasePointerCapture: vi.fn(),
            requestPointerLock: vi.fn()
        } as unknown as HTMLInputElement;

        const exitLock = vi.fn();
        const globalWithDoc = globalThis as { document?: Document };
        const originalDocument = globalWithDoc.document;
        globalWithDoc.document = { exitPointerLock: exitLock } as unknown as Document;

        const downEvent = {
            target: input,
            clientX: 0,
            pointerId: 1
        } as unknown as PointerEvent;
        component['_onPointerDown'](downEvent);
        expect(input.setPointerCapture).toHaveBeenCalledWith(1);
        expect(input.requestPointerLock).toHaveBeenCalled();

        const upEvent = {
            target: input,
            pointerId: 1
        } as unknown as PointerEvent;
        component['_stopDrag'](upEvent);
        expect(input.releasePointerCapture).toHaveBeenCalledWith(1);
        expect(exitLock).toHaveBeenCalled();

        globalWithDoc.document = originalDocument;
    });

    it('releases pointer lock when disabled during drag', () => {
        const component = new DraggableNumber();
        const input = {
            setPointerCapture: vi.fn(),
            releasePointerCapture: vi.fn(),
            requestPointerLock: vi.fn()
        } as unknown as HTMLInputElement;

        const exitLock = vi.fn();
        const globalWithDoc = globalThis as { document?: Document };
        const originalDocument = globalWithDoc.document;
        globalWithDoc.document = { exitPointerLock: exitLock } as unknown as Document;

        component['_onPointerDown']({ target: input, clientX: 0, pointerId: 1 } as unknown as PointerEvent);
        component.disabled = true;
        component.updated(new Map([['disabled', false]]));

        expect(exitLock).toHaveBeenCalled();
        expect((component as unknown as { _dragging: boolean })._dragging).toBe(false);

        globalWithDoc.document = originalDocument;
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

    it('adjusts percent type with arrow keys', () => {
        const component = new DraggableNumber();
        component.type = 'percent';
        component.value = 0;

        const upEvent = { key: 'ArrowUp', preventDefault: vi.fn() } as unknown as KeyboardEvent;
        component['_onKeyDown'](upEvent);
        expect(component.value).toBeCloseTo(0.01);
        expect(upEvent.preventDefault).toHaveBeenCalled();

        const downEvent = { key: 'ArrowDown', preventDefault: vi.fn() } as unknown as KeyboardEvent;
        component['_onKeyDown'](downEvent);
        expect(component.value).toBeCloseTo(0);
        expect(downEvent.preventDefault).toHaveBeenCalled();
    });

    it('uses step increments with arrow keys', () => {
        const component = new DraggableNumber();
        component.step = 2;
        component.value = 0;

        const upEvent = { key: 'ArrowUp', preventDefault: vi.fn() } as unknown as KeyboardEvent;
        component['_onKeyDown'](upEvent);
        expect(component.value).toBe(2);
        const downEvent = { key: 'ArrowDown', preventDefault: vi.fn() } as unknown as KeyboardEvent;
        component['_onKeyDown'](downEvent);
        expect(component.value).toBe(0);
    });

    it('respects min and max values', () => {
        const component = new DraggableNumber();
        component.min = 0;
        component.max = 5;

        component.value = 5;
        const up = { key: 'ArrowUp', preventDefault: vi.fn() } as unknown as KeyboardEvent;
        component['_onKeyDown'](up);
        expect(component.value).toBe(5);

        component.value = 0;
        const down = { key: 'ArrowDown', preventDefault: vi.fn() } as unknown as KeyboardEvent;
        component['_onKeyDown'](down);
        expect(component.value).toBe(0);

        component['_setEditing'](true);
        const blurTarget = { value: '10' } as HTMLInputElement;
        component['_onBlur']({ target: blurTarget } as unknown as Event);
        expect(component.value).toBe(5);
    });

    it('updates value and exits editing on blur', () => {
        const component = new DraggableNumber();
        component['_setEditing'](true);
        component.value = 5;
        const blurTarget = { value: '10' } as HTMLInputElement;
        const dispatch = vi.spyOn(component, 'dispatchEvent');
        component['_onBlur']({ target: blurTarget } as unknown as Event);
        expect(component.value).toBe(10);
        expect(component.editing).toBe(false);
        expect(dispatch).toHaveBeenCalled();
        expect(dispatch.mock.calls[0][0].type).toBe('change');
    });

    it('ignores invalid values on blur', () => {
        const component = new DraggableNumber();
        component['_setEditing'](true);
        component.value = 5;
        const blurTarget = { value: 'abc' } as HTMLInputElement;
        const dispatch = vi.spyOn(component, 'dispatchEvent');
        component['_onBlur']({ target: blurTarget } as unknown as Event);
        expect(component.value).toBe(5);
        expect(component.editing).toBe(false);
        expect(dispatch).not.toHaveBeenCalled();
    });

    it('changes value when dragging', () => {
        const component = new DraggableNumber();
        component.value = 0;
        const target = { setPointerCapture: vi.fn() } as unknown as HTMLElement;
        component['_onPointerDown']({ target, clientX: 0, pointerId: 1 } as unknown as PointerEvent);
        const dispatch = vi.spyOn(component, 'dispatchEvent');
        component['_onPointerMove']({ clientX: 10 } as unknown as PointerEvent);
        expect(component.value).toBe(10);
        expect(component['_moved']).toBe(true);
        expect(dispatch).toHaveBeenCalled();
    });

    it('rounds value to step when dragging', () => {
        const component = new DraggableNumber();
        component.step = 2;
        component.value = 0;
        const target = { setPointerCapture: vi.fn() } as unknown as HTMLElement;
        component['_onPointerDown']({ target, clientX: 0, pointerId: 1 } as unknown as PointerEvent);
        component['_onPointerMove']({ clientX: 3 } as unknown as PointerEvent);
        expect(component.value).toBe(4);
    });

    it('resets previous position after each move without pointer lock', () => {
        const component = new DraggableNumber();
        component.value = 0;
        const target = { setPointerCapture: vi.fn() } as unknown as HTMLElement;
        component['_onPointerDown']({ target, clientX: 100, pointerId: 1 } as unknown as PointerEvent);
        component['_onPointerMove']({ clientX: 110 } as PointerEvent);
        expect((component as unknown as { _prevX: number })._prevX).toBe(110);
    });

    it('scales drag change for whole rotations', () => {
        const component = new DraggableNumber();
        component.type = 'whole-rotation';
        const target = { setPointerCapture: vi.fn() } as unknown as HTMLElement;
        component['_onPointerDown']({ target, clientX: 0, pointerId: 1 } as unknown as PointerEvent);
        component['_onPointerMove']({ clientX: 1 } as unknown as PointerEvent);
        expect(component.value).toBe(360);
    });

    it('scales drag change for percent type', () => {
        const component = new DraggableNumber();
        component.type = 'percent';
        const target = { setPointerCapture: vi.fn() } as unknown as HTMLElement;
        component['_onPointerDown']({ target, clientX: 0, pointerId: 1 } as unknown as PointerEvent);
        component['_onPointerMove']({ clientX: 1 } as unknown as PointerEvent);
        expect(component.value).toBeCloseTo(0.01);
    });

    it('applies custom dragFactor', () => {
        const component = new DraggableNumber();
        component.dragFactor = 0.5;
        const target = { setPointerCapture: vi.fn() } as unknown as HTMLElement;
        component['_onPointerDown']({ target, clientX: 0, pointerId: 1 } as unknown as PointerEvent);
        component['_onPointerMove']({ clientX: 10 } as unknown as PointerEvent);
        expect(component.value).toBe(5);
    });

    it('accumulates small movements the same as a single large movement', () => {
        const big = new DraggableNumber();
        big.dragFactor = 0.5;
        const target = { setPointerCapture: vi.fn() } as unknown as HTMLElement;
        big['_onPointerDown']({ target, clientX: 0, pointerId: 1 } as unknown as PointerEvent);
        big['_onPointerMove']({ clientX: 10 } as unknown as PointerEvent);

        const small = new DraggableNumber();
        small.dragFactor = 0.5;
        small['_onPointerDown']({ target, clientX: 0, pointerId: 1 } as unknown as PointerEvent);
        small['_onPointerMove']({ clientX: 5 } as unknown as PointerEvent);
        small['_onPointerMove']({ clientX: 10 } as unknown as PointerEvent);

        expect(small.value).toBe(big.value);
    });

    it('formats and parses percent type', () => {
        const component = new DraggableNumber();
        component.type = 'percent';
        component.value = 0.5;
        expect((component as unknown as { _formatValue(): string | number })._formatValue()).toBe(50);
        const parsed = (component as unknown as { _parseValue(n: number): number })._parseValue(75);
        expect(parsed).toBeCloseTo(0.75);
    });

    it('formats part rotations with a sign', () => {
        const component = new DraggableNumber();
        component.type = 'part-rotation';
        component.value = 30;
        expect((component as unknown as { _formatValue(): string | number })._formatValue()).toBe('+30');
        component.value = -15;
        expect((component as unknown as { _formatValue(): string | number })._formatValue()).toBe('-15');
    });

    it('tracks movement when pointer is locked', () => {
        const component = new DraggableNumber();
        const target = {
            setPointerCapture: vi.fn(),
            requestPointerLock: vi.fn()
        } as unknown as HTMLElement;
        const globalWithDoc = globalThis as { document?: Document & { pointerLockElement?: Element } };
        const originalDoc = globalWithDoc.document;
        globalWithDoc.document = { pointerLockElement: target } as unknown as Document & { pointerLockElement?: Element };
        component['_onPointerDown']({ target, clientX: 0, pointerId: 1 } as unknown as PointerEvent);
        const dispatch = vi.spyOn(component, 'dispatchEvent');
        component['_onPointerMove']({ movementX: 5 } as unknown as PointerEvent);
        expect(component.value).toBe(5);
        expect(component['_moved']).toBe(true);
        expect(dispatch).toHaveBeenCalled();
        globalWithDoc.document = originalDoc;
    });

    it('accumulates movement correctly when pointer is locked', () => {
        const component = new DraggableNumber();
        const target = {
            setPointerCapture: vi.fn(),
            requestPointerLock: vi.fn()
        } as unknown as HTMLElement;
        const globalWithDoc = globalThis as { document?: Document & { pointerLockElement?: Element } };
        const originalDoc = globalWithDoc.document;
        globalWithDoc.document = { pointerLockElement: target } as unknown as Document & { pointerLockElement?: Element };
        component['_onPointerDown']({ target, clientX: 0, pointerId: 1 } as unknown as PointerEvent);
        component['_onPointerMove']({ movementX: 3 } as unknown as PointerEvent);
        component['_onPointerMove']({ movementX: 2 } as unknown as PointerEvent);
        expect(component.value).toBe(5);
        globalWithDoc.document = originalDoc;
    });

    it('click does not start editing after a drag', () => {
        const component = new DraggableNumber();
        const target = { setPointerCapture: vi.fn() } as unknown as HTMLElement;
        component['_onPointerDown']({ target, clientX: 0, pointerId: 1 } as unknown as PointerEvent);
        component['_onPointerMove']({ clientX: 1 } as unknown as PointerEvent);
        component['_onClick']();
        expect(component.editing).toBe(false);
    });

    it('enter key starts editing', () => {
        const component = new DraggableNumber();
        const event = { key: 'Enter', preventDefault: vi.fn() } as unknown as KeyboardEvent;
        component['_onKeyDown'](event);
        expect(component.editing).toBe(true);
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('enter blurs while escape cancels editing', () => {
        const component = new DraggableNumber();
        component['_setEditing'](true);
        const blurSpy = vi.spyOn(component as unknown as { _onBlur: (e: Event) => void }, '_onBlur');
        const enterEvent = { key: 'Enter', preventDefault: vi.fn(), target: { value: '7' } } as unknown as KeyboardEvent;
        component['_onKeyDown'](enterEvent);
        expect(blurSpy).toHaveBeenCalledTimes(1);
        expect(enterEvent.preventDefault).toHaveBeenCalled();

        component['_setEditing'](true);
        const escEvent = { key: 'Escape', preventDefault: vi.fn(), target: { value: '7' } } as unknown as KeyboardEvent;
        component['_onKeyDown'](escEvent);
        expect(blurSpy).toHaveBeenCalledTimes(1);
        expect(escEvent.preventDefault).toHaveBeenCalled();
        expect(component.editing).toBe(false);
    });

    it('escape cancels changes when editing', () => {
        const component = new DraggableNumber();
        component.value = 5;
        component['_setEditing'](true);
        const escEvent = { key: 'Escape', preventDefault: vi.fn(), target: { value: '10' } } as unknown as KeyboardEvent;
        component['_onKeyDown'](escEvent);
        expect(component.value).toBe(5);
        expect(component.editing).toBe(false);
        expect(escEvent.preventDefault).toHaveBeenCalled();
    });
});

defineDraggableNumber();
describe('draggable-number DOM', () => {
    it('span is focusable', async () => {
        document.body.innerHTML = '<cc-draggable-number></cc-draggable-number>';
        const comp = document.querySelector('cc-draggable-number') as HTMLElement & { shadowRoot: ShadowRoot; updateComplete: Promise<unknown> };
        await comp.updateComplete;
        const span = comp.shadowRoot.querySelector('span');
        expect(span?.getAttribute('tabindex')).toBe('0');
    });
    it('exposes spinbutton aria attributes', async () => {
        document.body.innerHTML = '<cc-draggable-number value="3" min="1" max="5"></cc-draggable-number>';
        const comp = document.querySelector('cc-draggable-number') as HTMLElement & { shadowRoot: ShadowRoot; updateComplete: Promise<unknown> };
        await comp.updateComplete;
        const span = comp.shadowRoot.querySelector('span') as HTMLElement;
        expect(span.getAttribute('role')).toBe('spinbutton');
        expect(span.getAttribute('aria-valuenow')).toBe('3');
        expect(span.getAttribute('aria-valuemin')).toBe('1');
        expect(span.getAttribute('aria-valuemax')).toBe('5');
    });
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

    it('passes min and max to the input', async () => {
        document.body.innerHTML =
            '<cc-draggable-number min="1" max="5" value="2"></cc-draggable-number>';
        const comp = document.querySelector('cc-draggable-number') as HTMLElement & {
            shadowRoot: ShadowRoot;
            updateComplete: Promise<unknown>;
        };
        await comp.updateComplete;
        const span = comp.shadowRoot.querySelector('span') as HTMLElement;
        span.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await comp.updateComplete;
        const input = comp.shadowRoot.querySelector('input') as HTMLInputElement;
        expect(input.min).toBe('1');
        expect(input.max).toBe('5');
    });

    it('passes step to the input', async () => {
        document.body.innerHTML =
            '<cc-draggable-number step="0.5" value="1"></cc-draggable-number>';
        const comp = document.querySelector('cc-draggable-number') as HTMLElement & {
            shadowRoot: ShadowRoot;
            updateComplete: Promise<unknown>;
        };
        await comp.updateComplete;
        const span = comp.shadowRoot.querySelector('span') as HTMLElement;
        span.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await comp.updateComplete;
        const input = comp.shadowRoot.querySelector('input') as HTMLInputElement;
        expect(input.step).toBe('0.5');
    });

    it('focuses and selects the input on edit start', async () => {
        document.body.innerHTML = '<cc-draggable-number value="42"></cc-draggable-number>';
        const comp = document.querySelector('cc-draggable-number') as HTMLElement & { shadowRoot: ShadowRoot; updateComplete: Promise<unknown> };
        await comp.updateComplete;
        const selectSpy = vi.spyOn(HTMLInputElement.prototype, 'select');
        const span = comp.shadowRoot.querySelector('span') as HTMLElement;
        span.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await comp.updateComplete;
        const input = comp.shadowRoot.querySelector('input') as HTMLInputElement;
        expect(comp.shadowRoot.activeElement).toBe(input);
        expect(selectSpy).toHaveBeenCalled();
    });

    it('refocuses the span on keyboard exit', async () => {
        document.body.innerHTML = '<cc-draggable-number value="42"></cc-draggable-number>';
        const comp = document.querySelector('cc-draggable-number') as HTMLElement & { shadowRoot: ShadowRoot; updateComplete: Promise<unknown> };
        await comp.updateComplete;
        const span = comp.shadowRoot.querySelector('span') as HTMLElement;
        span.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await comp.updateComplete;
        const input = comp.shadowRoot.querySelector('input') as HTMLInputElement;
        const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
        input.dispatchEvent(event);
        await comp.updateComplete;
        expect(comp.shadowRoot.querySelector('input')).toBeNull();
        const newSpan = comp.shadowRoot.querySelector('span') as HTMLElement;
        expect(comp.shadowRoot.activeElement).toBe(newSpan);
    });

    it('does not refocus the span when blurred', async () => {
        document.body.innerHTML = '<cc-draggable-number value="42"></cc-draggable-number>';
        const comp = document.querySelector('cc-draggable-number') as HTMLElement & { shadowRoot: ShadowRoot; updateComplete: Promise<unknown> };
        await comp.updateComplete;
        const span = comp.shadowRoot.querySelector('span') as HTMLElement;
        span.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await comp.updateComplete;
        const input = comp.shadowRoot.querySelector('input') as HTMLInputElement;
        input.dispatchEvent(new Event('blur', { bubbles: true }));
        await comp.updateComplete;
        const newSpan = comp.shadowRoot.querySelector('span') as HTMLElement;
        expect(comp.shadowRoot.activeElement).not.toBe(newSpan);
    });

    it('ignores interaction when disabled', () => {
        const component = new DraggableNumber();
        component.disabled = true;
        component.value = 0;

        component['_onClick']();
        expect(component.editing).toBe(false);

        const keyEvent = { key: 'ArrowUp' } as KeyboardEvent;
        component['_onKeyDown'](keyEvent);
        expect(component.value).toBe(0);
    });
});
