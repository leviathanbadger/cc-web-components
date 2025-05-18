import { html } from 'lit';

export const template = (
    value: number,
    onChange: (e: Event) => void
) => html`<cc-property-input .value=${value}>
    <cc-draggable-number
        part="rotations"
        .value=${value}
        type="whole-rotation"
        @change=${onChange}
    ></cc-draggable-number>
    <span>x</span>
    <cc-draggable-number
        part="degrees"
        .value=${value}
        type="part-rotation"
        @change=${onChange}
    ></cc-draggable-number>
    <span>°</span>
</cc-property-input>`;
