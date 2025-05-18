import { html } from 'lit';

export const template = (
    value: string | number,
    editing: boolean,
    onBlur: (e: Event) => void,
    onKeyDown: (e: KeyboardEvent) => void,
    onPointerDown: (e: PointerEvent) => void,
    onPointerMove: (e: PointerEvent) => void,
    onPointerUp: (e: PointerEvent) => void,
    onClick: () => void,
    min: number | null,
    max: number | null,
    step: number | null,
    disabled: boolean
) => html`
    <span
        tabindex="${disabled ? -1 : 0}"
        aria-disabled="${disabled ? 'true' : 'false'}"
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
              .min=${min === null ? '' : String(min)}
              .max=${max === null ? '' : String(max)}
              .step=${step === null ? '' : String(step)}
              ?disabled=${disabled}
              @blur=${onBlur}
              @keydown=${onKeyDown}
          />`
        : null}
`;
