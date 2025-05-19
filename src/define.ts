import { defineDraggableNumber } from './components/draggable-number';
import {
    definePropertyInput,
    PropertyInput,
} from './components/property-input';
import {
    defineRotationPropertyInput,
    RotationPropertyInput,
} from './components/rotation-property-input';
import {
    definePercentPropertyInput,
    PercentPropertyInput,
} from './components/percent-property-input';

defineDraggableNumber();
definePropertyInput();
defineRotationPropertyInput();
definePercentPropertyInput();

export {
    PropertyInput,
    RotationPropertyInput,
    PercentPropertyInput,
};
