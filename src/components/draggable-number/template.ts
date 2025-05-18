import { html } from 'lit';

export const template = (
    value: string | number,
    editing: boolean,
    onBlur: (e: Event) => void,
    onKeyDown: (e: KeyboardEvent) => void,
    onPointerDown: (e: PointerEvent) => void,
    onPointerMove: (e: PointerEvent) => void,
    onPointerUp: (e: PointerEvent) => void,
    onClick: () => void
) => html`
    <span
        tabindex="0"
        @click=${onClick}
        @keydown=${onKeyDown}
        @pointerdown=${onPointerDown}
        @pointermove=${onPointerMove}
        @pointerup=${onPointerUp}
        @pointercancel=${onPointerUp}
        >${value}</span
    >
    ${editing
        ? html`<input
              type="number"
              .value=${String(value)}
              @blur=${onBlur}
              @keydown=${onKeyDown}
          />`
        : null}
`;
