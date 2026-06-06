import crypto from 'crypto';

/**
 * Checks if a string is a palindrome, ignoring case and non-alphanumeric characters.
 * @param {string} str 
 * @returns {boolean}
 */
export const isPalindrome = (str) => {
    const sanitized = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const reversed = sanitized.split('').reverse().join('');
    return sanitized === reversed;
};

/**
 * Counts the number of words in a string.
 * @param {string} str 
 * @returns {number}
 */
export const countWords = (str) => {
    // Splits by whitespace and filters out empty strings
    const matches = str.match(/\b\w+\b/g); 
    return matches ? matches.length : 0;
};

/**
 * Calculates the frequency of each non-whitespace character (case-insensitive).
 * @param {string} str 
 * @returns {Object.<string, number>}
 */
export const getCharacterFrequency = (str) => {
    const frequency = {};
    // Ignore whitespace and convert to lower case
    const sanitized = str.toLowerCase().replace(/\s/g, ''); 

    for (const char of sanitized) {
        frequency[char] = (frequency[char] || 0) + 1;
    }
    return frequency;
};

/**
 * Counts the number of unique characters in a string (excluding spaces).
 * @param {string} str 
 * @returns {number}
 */
export const uniqueCharacterCount = (str) => {
    const sanitized = str.toLowerCase().replace(/\s/g, '');
    const uniqueChars = new Set(sanitized);
    return uniqueChars.size;
};

// NOTE: The combined `analyzeString` function is now defined in the controller for context-specific usage.
