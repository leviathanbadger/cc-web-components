import { html } from 'lit';

export const template = (onSlotChange: () => void) => html`<slot @slotchange=${onSlotChange}></slot>`;
