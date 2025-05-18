import { html } from 'lit';

export const template = (
    value: number,
    onChange: (e: Event) => void,
    min: number | null,
    max: number | null,
    disabled: boolean
) => html`<cc-property-input .value=${value} ?disabled=${disabled}>
    <cc-draggable-number
        part="percent"
        .value=${value}
        type="percent"
        .min=${min}
        .max=${max}
        ?disabled=${disabled}
        @change=${onChange}
    ></cc-draggable-number>
    <span>%</span>
</cc-property-input>`;
