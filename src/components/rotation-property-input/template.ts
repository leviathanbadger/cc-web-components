import { html } from 'lit';

export const template = (
    value: number,
    onChange: (e: Event) => void,
    min: number | null,
    max: number | null,
    disabled: boolean
) => html`<cc-property-input .value=${value} ?disabled=${disabled}>
    <cc-draggable-number
        part="rotations"
        .value=${value}
        type="whole-rotation"
        .min=${min}
        .max=${max}
        ?disabled=${disabled}
        @change=${onChange}
    ></cc-draggable-number>
    <span>x</span>
    <cc-draggable-number
        part="degrees"
        .value=${value}
        type="part-rotation"
        .min=${min}
        .max=${max}
        ?disabled=${disabled}
        @change=${onChange}
    ></cc-draggable-number>
    <span>°</span>
</cc-property-input>`;
