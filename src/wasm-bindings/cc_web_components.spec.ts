import { describe, it, expect } from 'vitest';
import { process_drag } from './cc_web_components.js';

describe('process_drag', () => {
    it('returns the delta value', () => {
        expect(process_drag(5)).toBe(5);
    });
});
