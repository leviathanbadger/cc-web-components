import { html } from 'lit';

export const template = (
    value: number,
    onChange: (e: Event) => void,
    onPointerDown: (e: PointerEvent) => void,
    onPointerMove: (e: PointerEvent) => void,
    onPointerUp: () => void
) => html`<input
    type="number"
    .value=${String(value)}
    @change=${onChange}
    @pointerdown=${onPointerDown}
    @pointermove=${onPointerMove}
    @pointerup=${onPointerUp}
    @pointercancel=${onPointerUp}
/>`;
