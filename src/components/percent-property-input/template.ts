import { html } from 'lit';

export const template = (
    value: number,
    onChange: (e: Event) => void,
    min: number | null,
    max: number | null
) => html`<cc-property-input .value=${value}>
    <cc-draggable-number
        part="percent"
        .value=${value}
        type="percent"
        .min=${min}
        .max=${max}
        @change=${onChange}
    ></cc-draggable-number>
    <span>%</span>
</cc-property-input>`;
