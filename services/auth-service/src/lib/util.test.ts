import { getSecondPart } from './util';

describe('Utils', () => {
    describe('getSecondPart', () => {
        it('should return the second part for a string with two parts', () => {
            expect(getSecondPart('first_second')).toBe('second');
        });

        it('should return the second part for a string with multiple parts', () => {
            expect(getSecondPart('first_second_third')).toBe('second');
        });

        it('should return null for a string with only one part', () => {
            expect(getSecondPart('onlyone')).toBeNull();
        });

        it('should return null for an empty string', () => {
            expect(getSecondPart('')).toBeNull();
        });

        it('should return an empty string if the second part is empty', () => {
            expect(getSecondPart('first__third')).toBe('');
        });

        it('should handle strings starting with an underscore', () => {
            expect(getSecondPart('_second_third')).toBe('second');
        });

        it('should handle strings ending with an underscore', () => {
            expect(getSecondPart('first_second_')).toBe('second');
        });

        it('should return null if input is undefined', () => {
            // @ts-expect-error Testing undefined input
            expect(getSecondPart(undefined)).toBeNull();
        });

        it('should return null if input is null', () => {
            // @ts-expect-error Testing null input
            expect(getSecondPart(null)).toBeNull();
        });
    });
})