import { html } from 'lit';

export const template = (
    value: number,
    onChange: (e: Event) => void,
    onKeyDown: (e: KeyboardEvent) => void,
    onPointerDown: (e: PointerEvent) => void,
    onPointerMove: (e: PointerEvent) => void,
    onPointerUp: (e: PointerEvent) => void
) => html`<input
    type="number"
    .value=${String(value)}
    @change=${onChange}
    @keydown=${onKeyDown}
    @pointerdown=${onPointerDown}
    @pointermove=${onPointerMove}
    @pointerup=${onPointerUp}
    @pointercancel=${onPointerUp}
/>`;
