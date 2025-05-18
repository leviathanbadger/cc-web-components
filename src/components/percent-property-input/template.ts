import { html } from 'lit';

export const template = (
    value: number,
    onChange: (e: Event) => void
) => html`<cc-property-input .value=${value}>
    <cc-draggable-number
        part="percent"
        .value=${value}
        type="percent"
        @change=${onChange}
    ></cc-draggable-number>
    <span>%</span>
</cc-property-input>`;
