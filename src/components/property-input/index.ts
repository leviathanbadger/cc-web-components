import { LitElement, css, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import componentStyles from './style.css?inline';
import { template } from './template';
import { registerElement } from '../../register';
import { defineDraggableNumber } from '../draggable-number';

type DraggableNumberElement = HTMLElement & { value: number };

export class PropertyInput extends LitElement {
    static styles = css`${unsafeCSS(componentStyles)}`;

    @property({ type: Number, reflect: true })
    value = 0;

    @property({ type: Boolean, reflect: true })
    disabled = false;


    render() {
        return template(this._onSlotChange);
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('change', this._onChildChange as EventListener);
        this._updateChildren();
    }

    disconnectedCallback() {
        this.removeEventListener('change', this._onChildChange as EventListener);
        super.disconnectedCallback();
    }

    updated(changed: Map<string, unknown>) {
        if (changed.has('value') || changed.has('disabled')) {
            this._updateChildren();
            if (changed.has('value') && changed.get('value') !== undefined) {
                this.dispatchEvent(
                    new CustomEvent('change', {
                        detail: { value: this.value }
                    })
                );
            }
        }
    }

    private _onSlotChange = () => {
        this._updateChildren();
    };

    private _onChildChange = (e: Event) => {
        if (e.target === this) return;
        if (!(e.target instanceof HTMLElement)) return;
        if (!this.contains(e.target)) return;
        e.stopImmediatePropagation();
        const target = e.target as DraggableNumberElement;
        const newVal = typeof target.value === 'number' ? target.value : parseFloat(target.getAttribute('value') ?? '');
        if (!isNaN(newVal) && newVal !== this.value) {
            this.value = newVal;
        }
    };

    private _updateChildren() {
        const numbers = this.querySelectorAll<DraggableNumberElement>('cc-draggable-number');
        numbers.forEach((num) => {
            if (num.value !== this.value) {
                num.value = this.value;
            }
            (num as unknown as { disabled?: boolean }).disabled = this.disabled;
        });
    }
}

export function definePropertyInput() {
    defineDraggableNumber();
    registerElement('cc-property-input', PropertyInput);
}
