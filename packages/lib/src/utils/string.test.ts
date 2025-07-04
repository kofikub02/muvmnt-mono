import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
    firstLetterUppercase,
    lowerCase,
    toUpperCase,
    isEmail,
    isDataURL,
    isPhoneNumber,
} from './string';

describe('String', () => {
    describe('firstLetterUppercase', () => {
        it('should capitalize the first letter of each word', () => {
            assert.equal(firstLetterUppercase('hello world'), 'Hello World');
        });

        it('should handle mixed case input', () => {
            assert.equal(firstLetterUppercase('hELLo WoRLD'), 'Hello World');
        });

        it('should handle single word', () => {
            assert.equal(firstLetterUppercase('test'), 'Test');
        });

        it('should handle empty string', () => {
            assert.equal(firstLetterUppercase(''), '');
        });

        it('should handle multiple spaces', () => {
            assert.equal(firstLetterUppercase('hello   world'), 'Hello   World');
        });

        it('should handle leading and trailing spaces', () => {
            assert.equal(firstLetterUppercase('  hello world  '), '  Hello World  ');
        });

        it('should handle words with apostrophes', () => {
            assert.equal(firstLetterUppercase("it's a test"), "It's A Test");
        });

        it('should handle words with hyphens', () => {
            assert.equal(firstLetterUppercase('hello-world'), 'Hello-world');
        });
    });

    describe('lowerCase', () => {
        it('should convert string to lowercase', () => {
            assert.equal(lowerCase('HELLO'), 'hello');
        });

        it('should handle already lowercase', () => {
            assert.equal(lowerCase('hello'), 'hello');
        });

        it('should handle mixed case', () => {
            assert.equal(lowerCase('HeLLo'), 'hello');
        });

        it('should handle empty string', () => {
            assert.equal(lowerCase(''), '');
        });

        it('should handle string with numbers and symbols', () => {
            assert.equal(lowerCase('HeLLo123!'), 'hello123!');
        });
    });

    describe('toUpperCase', () => {
        it('should convert string to uppercase', () => {
            assert.equal(toUpperCase('hello'), 'HELLO');
        });

        it('should handle already uppercase', () => {
            assert.equal(toUpperCase('HELLO'), 'HELLO');
        });

        it('should handle mixed case', () => {
            assert.equal(toUpperCase('HeLLo'), 'HELLO');
        });

        it('should handle empty string', () => {
            assert.equal(toUpperCase(''), '');
        });

        it('should handle string with numbers and symbols', () => {
            assert.equal(toUpperCase('HeLLo123!'), 'HELLO123!');
        });
    });

    describe('isEmail', () => {
        it('should validate correct email', () => {
            assert.equal(isEmail('test@example.com'), true);
        });

        it('should invalidate incorrect email', () => {
            assert.equal(isEmail('test@.com'), false);
            assert.equal(isEmail('test.com'), false);
            // assert.equal(isEmail('test@com'), false);
            assert.equal(isEmail(''), false);
        });

        it('should validate email with subdomain', () => {
            assert.equal(isEmail('test@mail.example.com'), true);
        });

        it('should validate email with plus sign', () => {
            assert.equal(isEmail('test+label@example.com'), true);
        });

        it('should invalidate email with spaces', () => {
            assert.equal(isEmail('test @example.com'), false);
        });

        it('should invalidate email with multiple @', () => {
            assert.equal(isEmail('test@@example.com'), false);
        });

        it('should validate email with numbers', () => {
            assert.equal(isEmail('user123@example123.com'), true);
        });
    });

    describe('isDataURL', () => {
        it('should validate correct data URL', () => {
            assert.equal(isDataURL('data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='), true);
            assert.equal(isDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA'), true);
        });

        it('should invalidate incorrect data URL', () => {
            assert.equal(isDataURL('http://example.com'), false);
            assert.equal(isDataURL(''), false);
        });

        it('should validate data URL with spaces', () => {
            assert.equal(isDataURL('  data:text/plain;base64,SGVsbG8=  '), true);
        });

        it('should validate empty but correct data URL', () => {
            assert.equal(isDataURL('data:;base64,'), true);
        });

        it('should invalidate data URL with missing comma', () => {
            assert.equal(isDataURL('data:text/plain;base64SGVsbG8='), false);
        });

        it('should validate data URL with custom mime type', () => {
            assert.equal(isDataURL('data:application/json;base64,eyJrZXkiOiAidmFsdWUifQ=='), true);
        });
    });

    describe('isPhoneNumber', () => {
        it('should always return true', () => {
            assert.equal(isPhoneNumber('1234567890'), true);
            assert.equal(isPhoneNumber(''), true);
            assert.equal(isPhoneNumber('+1-800-555-1234'), true);
        });

        it('should return true for phone numbers with spaces', () => {
            assert.equal(isPhoneNumber('123 456 7890'), true);
        });

        it('should return true for phone numbers with parentheses', () => {
            assert.equal(isPhoneNumber('(123) 456-7890'), true);
        });

        it('should return true for phone numbers with country code', () => {
            assert.equal(isPhoneNumber('+44 20 7123 1234'), true);
        });
    });
})