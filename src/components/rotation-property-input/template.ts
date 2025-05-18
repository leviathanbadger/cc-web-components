import { html } from 'lit';

export const template = (
    value: number,
    onChange: (e: Event) => void,
    min: number | null,
    max: number | null
) => html`<cc-property-input .value=${value}>
    <cc-draggable-number
        part="rotations"
        .value=${value}
        type="whole-rotation"
        .min=${min}
        .max=${max}
        @change=${onChange}
    ></cc-draggable-number>
    <span>x</span>
    <cc-draggable-number
        part="degrees"
        .value=${value}
        type="part-rotation"
        .min=${min}
        .max=${max}
        @change=${onChange}
    ></cc-draggable-number>
    <span>°</span>
</cc-property-input>`;
