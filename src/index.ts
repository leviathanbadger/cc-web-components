import { defineDraggableNumber } from './components/draggable-number';
import { definePropertyInput } from './components/property-input';
import { defineRotationPropertyInput } from './components/rotation-property-input';
import { definePercentPropertyInput } from './components/percent-property-input';

defineDraggableNumber();
definePropertyInput();
defineRotationPropertyInput();
definePercentPropertyInput();

export * from './components/draggable-number';
export * from './components/property-input';
export * from './components/rotation-property-input';
export * from './components/percent-property-input';
