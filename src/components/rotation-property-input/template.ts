import { html } from 'lit';

export const template = (
    rotations: number,
    sign: string,
    degrees: number,
    onRotationsChange: (e: Event) => void,
    onDegreesChange: (e: Event) => void
) => html`<cc-property-input>
    <cc-draggable-number
        part="rotations"
        .value=${rotations}
        @change=${onRotationsChange}
    ></cc-draggable-number>
    <span>x${sign}</span>
    <cc-draggable-number
        part="degrees"
        .value=${degrees}
        @change=${onDegreesChange}
    ></cc-draggable-number>
    <span>°</span>
</cc-property-input>`;
