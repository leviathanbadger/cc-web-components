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
        globalWithDoc.document = { exitPointerLock: exitLock } as Document;

        const downEvent = {
            target: input,
            clientX: 0,
            pointerId: 1
        } as PointerEvent;
        component['_onPointerDown'](downEvent);
        expect(input.setPointerCapture).toHaveBeenCalledWith(1);
        expect(input.requestPointerLock).toHaveBeenCalled();

        const upEvent = {
            target: input,
            pointerId: 1
        } as PointerEvent;
        component['_stopDrag'](upEvent);
        expect(input.releasePointerCapture).toHaveBeenCalledWith(1);
        expect(exitLock).toHaveBeenCalled();

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

    it('updates value and exits editing on blur', () => {
        const component = new DraggableNumber();
        component['_setEditing'](true);
        component.value = 5;
        const blurTarget = { value: '10' } as HTMLInputElement;
        const dispatch = vi.spyOn(component, 'dispatchEvent');
        component['_onBlur']({ target: blurTarget } as Event);
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
        component['_onBlur']({ target: blurTarget } as Event);
        expect(component.value).toBe(5);
        expect(component.editing).toBe(false);
        expect(dispatch).not.toHaveBeenCalled();
    });

    it('changes value when dragging', () => {
        const component = new DraggableNumber();
        component.value = 0;
        const target = { setPointerCapture: vi.fn() } as unknown as HTMLElement;
        component['_onPointerDown']({ target, clientX: 0, pointerId: 1 } as PointerEvent);
        const dispatch = vi.spyOn(component, 'dispatchEvent');
        component['_onPointerMove']({ clientX: 10 } as PointerEvent);
        expect(component.value).toBe(10);
        expect(component['_moved']).toBe(true);
        expect(dispatch).toHaveBeenCalled();
    });

    it('resets start position after each move without pointer lock', () => {
        const component = new DraggableNumber();
        component.value = 0;
        const target = { setPointerCapture: vi.fn() } as unknown as HTMLElement;
        component['_onPointerDown']({ target, clientX: 100, pointerId: 1 } as PointerEvent);
        component['_onPointerMove']({ clientX: 110 } as PointerEvent);
        expect((component as unknown as { _startX: number })._startX).toBe(110);
    });

    it('scales drag change for whole rotations', () => {
        const component = new DraggableNumber();
        component.type = 'whole-rotation';
        const target = { setPointerCapture: vi.fn() } as unknown as HTMLElement;
        component['_onPointerDown']({ target, clientX: 0, pointerId: 1 } as PointerEvent);
        component['_onPointerMove']({ clientX: 1 } as PointerEvent);
        expect(component.value).toBe(360);
    });

    it('formats and parses percent type', () => {
        const component = new DraggableNumber();
        component.type = 'percent';
        component.value = 0.5;
        expect((component as unknown as { _formatValue(): number })._formatValue()).toBe(50);
        const parsed = (component as unknown as { _parseValue(n: number): number })._parseValue(75);
        expect(parsed).toBeCloseTo(0.75);
    });

    it('tracks movement when pointer is locked', () => {
        const component = new DraggableNumber();
        const target = {
            setPointerCapture: vi.fn(),
            requestPointerLock: vi.fn()
        } as unknown as HTMLElement;
        const globalWithDoc = globalThis as { document?: Document & { pointerLockElement?: Element } };
        const originalDoc = globalWithDoc.document;
        globalWithDoc.document = { pointerLockElement: target } as Document & { pointerLockElement?: Element };
        component['_onPointerDown']({ target, clientX: 0, pointerId: 1 } as PointerEvent);
        const dispatch = vi.spyOn(component, 'dispatchEvent');
        component['_onPointerMove']({ movementX: 5 } as PointerEvent);
        expect(component.value).toBe(5);
        expect(component['_moved']).toBe(true);
        expect(dispatch).toHaveBeenCalled();
        globalWithDoc.document = originalDoc;
    });

    it('click does not start editing after a drag', () => {
        const component = new DraggableNumber();
        const target = { setPointerCapture: vi.fn() } as unknown as HTMLElement;
        component['_onPointerDown']({ target, clientX: 0, pointerId: 1 } as PointerEvent);
        component['_onPointerMove']({ clientX: 1 } as PointerEvent);
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

    it('enter and escape keys blur when editing', () => {
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
        expect(blurSpy).toHaveBeenCalledTimes(2);
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
});
