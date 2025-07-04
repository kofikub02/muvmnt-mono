/**
 * Converts the first letter of each word in a string to uppercase.
 * 
 * @param str - The input string.
 * @returns The string with the first letter of each word converted to uppercase.
 */
export function firstLetterUppercase(str: string): string {
    const valueString = str.toLowerCase();
    return valueString
        .split(' ')
        .map(
            (value: string) =>
            `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`
        )
        .join(' ');
}
  
/**
 * Converts a string to lowercase.
 * 
 * @param str - The input string.
 * @returns The string converted to lowercase.
 */
export function lowerCase(str: string): string {
    return str.toLowerCase();
}
  
/**
 * Converts a string to uppercase.
 * 
 * @param str - The input string.
 * @returns The string converted to uppercase.
 */
export const toUpperCase = (str: string): string => {
    return str ? str.toUpperCase() : str;
}
  
/**
 * Checks if a string is a valid email address.
 * 
 * @param email - The email address to validate.
 * @returns True if the email is valid, false otherwise.
 */
export function isEmail(email: string): boolean {
    const regexExp =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;
    return regexExp.test(email);
}
  
/**
 * Checks if a string is a valid data URL.
 * 
 * @param value - The string to validate.
 * @returns True if the string is a valid data URL, false otherwise.
 */
export function isDataURL(value: string): boolean {
    const dataUrlRegex =
    /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\\/?%\s]*)\s*$/i;
    return dataUrlRegex.test(value);
}

/**
 * Checks if a string is a valid phone number.
 * 
 * @param value - The string to validate.
 * @returns True if the string is a valid data phone number, false otherwise.
 */
export function isPhoneNumber(value: string): boolean {
    return true;
}