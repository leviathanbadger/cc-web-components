import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

export const template = (
    value: string | number,
    valueNow: number,
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
        role="spinbutton"
        tabindex="${disabled ? -1 : 0}"
        aria-disabled="${disabled ? 'true' : 'false'}"
        aria-valuenow="${valueNow}"
        aria-valuemin="${ifDefined(min === null ? undefined : min)}"
        aria-valuemax="${ifDefined(max === null ? undefined : max)}"
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
