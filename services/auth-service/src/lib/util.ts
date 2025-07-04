/**
 * Extracts and returns the second part of a string separated by underscores.
 *
 * @param str - The input string to be split.
 * @returns The second part of the string if it exists; otherwise, returns null.
 */
export const getSecondPart = (str: string): string | null => {
    if (!str) return null;
    
    const parts = str.split('_');
    if (parts.length < 2) return null;
    
    return parts[1] ?? null;
};
