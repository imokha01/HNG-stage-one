import crypto from "crypto";
import { info, error, warn } from "../utils/logger.js";
import colors from "colors";
import fs from "fs";
import path from "path";

// Import the string analysis utilities from the dedicated file
import { 
    isPalindrome, 
    countWords, 
    getCharacterFrequency 
} from "../utils/stringAnalyzer.js";


// --- File Storage Configuration ---
const storagePath = path.resolve("./stringsStore.json");

// Ensure the storage file exists and initialize if not
if (!fs.existsSync(storagePath)) {
    fs.writeFileSync(storagePath, JSON.stringify({}), "utf-8");
}

// Helper: read storage from file
function readStorage() {
    try {
        const data = fs.readFileSync(storagePath, "utf-8");
        return JSON.parse(data);
    } catch (e) {
        error(`Failed to read or parse storage file: ${e.message}`.red);
        // Return an empty object if file is corrupted
        return {}; 
    }
}

// Helper: write storage to file
function writeStorage(data) {
    try {
        fs.writeFileSync(storagePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
        error(`Failed to write to storage file: ${e.message}`.red);
    }
} 
// --- END File Storage Configuration ---


// --- Utility function to generate full properties object ---
const analyzeString = (value) => {
    // Generate the hash on the lowercase value for consistent lookup
    const hash = crypto.createHash("sha256").update(value.toLowerCase()).digest("hex"); 

    // Re-use the functions from stringAnalyzer.js (imported above)
    return {
        length: value.length,
        is_palindrome: isPalindrome(value),
        word_count: countWords(value),
        sha256_hash: hash,
        // Using the existing character frequency function, which is now outside `createString`
        character_frequency_map: getCharacterFrequency(value), 
    };
};

/**
 * POST /strings - Analyze and store string data
 */
export const createString = (req, res) => {
    try {
        res.set("Content-Type", "application/json");
        info("Processing request to create a new string entry".blue);
        const { value } = req.body;

        // Validation for missing or invalid 'value' field (400/422)
        if (!value) {
            error("Bad Request: Missing 'value' field".red);
            return res.status(400).json({ error: "Invalid request body or missing 'value' field" });
        }
        if (typeof value !== "string") {
            warn("Invalid data type for 'value' (must be string)".red);
            return res.status(422).json({ error: "Invalid data type for 'value' (must be string)" });
        }

        // Use the lowercase value as the unique key for lookup/storage
        const normalizedKey = value.toLowerCase(); 
        const storedStrings = readStorage();

        // Check for duplicate string entries (Conflict 409)
        if (storedStrings[normalizedKey]) {
            warn("Conflict: String already exists in the system".red);
            return res
                .status(409)
                .json({ error: "String already exists in the system" });
        }

        // --- Analysis (using imported/extracted logic) ---
        const properties = analyzeString(value);

        // Construct the response data object
        const resData = {
            id: crypto.randomUUID(),
            // Store the original case-sensitive value
            value: value, 
            properties,
            createdAt: new Date().toISOString()
        };

        // Store the new string entry using the normalized key
        storedStrings[normalizedKey] = resData;
        writeStorage(storedStrings);

        info("String entry created successfully".green);
        res.status(201).json(resData);
    } catch (err) {
        error(`Internal Server Error: ${err.message}`.bgRed.white);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


/**
 * GET /strings/:value - Retrieve a specific string entry
 */
export const getStrings = (req, res) => {
    // Search for the string entry
    try {
        info("Processing request to retrieve string entry by value".blue);
        const { value } = req.params; 

        if (!value || typeof value !== 'string') {
            warn("Missing string value in request params".red);
            return res.status(400).json({ error: "Missing string value in request parameters" });
        }

        // Normalize the input value to match the storage key
        const normalizedKey = value.toLowerCase().trim();
        const storedStrings = readStorage();

        // Check if the string entry exists
        if (!storedStrings[normalizedKey]) {
            warn("String does not exist in the system".red);
            return res.status(404).json({ error: "String does not exist in the system" });
        } 
        
        const stringData = storedStrings[normalizedKey];

        info("String entry found".green);
        return res.status(200).json(stringData);

    } catch (error) {
        warn("Internal Server Error".red);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


/**
 * GET /strings - Retrieve all strings (via /strings?query=...)
 * This function currently handles query parameter filtering.
 */
export const getStringsQuery = (req, res) => {
    try {
        info("Processing request to retrieve query string".blue);
        const { is_palindrome, min_length, max_length, word_count, contains_character } = req.query;

        // ... (rest of the logic remains the same, as it was already correct)
        
        // --- Validate query parameter values ---
        const numericFields = { min_length, max_length, word_count };

        for (const [key, value] of Object.entries(numericFields)) {
            if (value !== undefined && isNaN(Number(value))) {
                warn(`Invalid query parameter type for '${key}': expected a number`.red);
                return res.status(400).json({
                    error: "Bad Request: Invalid query parameter values or types",
                    details: `${key} must be a valid number`
                });
            }
        }

        if (is_palindrome !== undefined && !["true", "false"].includes(is_palindrome.toLowerCase())) {
            warn("Invalid query parameter for 'is_palindrome': must be 'true' or 'false'".red);
            return res.status(400).json({
                error: "Bad Request: Invalid query parameter values or types",
                details: "is_palindrome must be 'true' or 'false'"
            });
        }

        info("Searching for string entries".blue);
        const storedStrings = readStorage();

        // Convert stored object to array
        const stringsArray = Object.values(storedStrings);

        // --- Apply filters ---
        const filteredResults = stringsArray.filter(entry => {
            const { value, properties } = entry;

            // Palindrome filter
            if (is_palindrome !== undefined) {
                const boolValue = is_palindrome.toLowerCase() === "true";
                if (properties.is_palindrome !== boolValue) return false;
            }

            // Min length
            if (min_length && properties.length < Number(min_length)) return false;

            // Max length
            if (max_length && properties.length > Number(max_length)) return false;

            // Word count
            if (word_count && properties.word_count !== Number(word_count)) return false;

            // Contains character
            if (contains_character) {
                const char = contains_character.toLowerCase();
                if (!value.toLowerCase().includes(char)) return false;
            }

            return true;
        });

        // --- Handle no matches ---
        if (filteredResults.length === 0) {
            warn("No matching string entries found".red);
            return res.status(404).json({ error: "No matching string entries found" });
        }

        //---Construct response---
        const response = {
            data: filteredResults.map(entry => ({
                id: entry.id,
                value: entry.value,
                properties: entry.properties,
                createdAt: entry.createdAt
            })),
            count: filteredResults.length,
            filters_applied: {
                is_palindrome,
                min_length,
                max_length,
                word_count,
                contains_character
            }
        };

        info("String entries retrieved successfully".green);
        res.status(200).json(response);

    } catch (error) {
        warn("Internal Server Error".red);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


/**
 * GET /strings/filter-by-natural-language - Retrieve strings using natural language query
 */
export const getStringsByLanguage = (req, res) => {
    try {
        info("Processing request to retrieve strings by natural language query".blue);

        const { query } = req.query;

        if (!query || typeof query !== "string" || !query.trim()) {
            warn("400 Bad Request: Invalid query parameter values or types".red);
            return res
                .status(400)
                .json({ error: "400 Bad Request: Invalid query parameter values or types" });
        }

        // --- Natural language parser ---
        function parseNaturalQuery(q) {
            const filters = {};
            const text = q.toLowerCase();

            // Detect palindrome references
            if (text.includes("palindromic") || text.includes("palindrome")) {
                filters.is_palindrome = true;
            }

            // Detect single word
            if (text.includes("single word") || text.includes("one word")) {
                filters.word_count = 1;
            }

            // Match lengths like longer than 5 or shorter than 10
            const longerMatch = text.match(/longer than (\d+)/);
            const shorterMatch = text.match(/shorter than (\d+)/);

            // Match specific letter references like contains letter a
            const charMatch = text.match(/letter\s+([a-z])/);

            if (longerMatch) filters.min_length = Number(longerMatch[1]) + 1;
            if (shorterMatch) filters.max_length = Number(shorterMatch[1]) - 1;
            if (charMatch) filters.contains_character = charMatch[1];

            if (filters.min_length && filters.max_length && filters.min_length > filters.max_length) {
                throw { status: 422, message: "Query parsed but resulted in conflicting filters" };
            }

            if (Object.keys(filters).length === 0) {
                throw { status: 400, message: "Unable to parse natural language query" };
            }

            return filters;
        }

        const parsedFilters = parseNaturalQuery(query);
        const storedStrings = readStorage();
        const stringsArray = Object.values(storedStrings);

        info("Applying parsed filters".blue);

        // --- Apply filters properly ---
        const filteredResults = stringsArray.filter(entry => {
            const { value, properties } = entry;
            const val = value.toLowerCase();

            if (parsedFilters.is_palindrome !== undefined) {
                if (properties.is_palindrome !== parsedFilters.is_palindrome) return false;
            }

            if (parsedFilters.word_count !== undefined) {
                if (Number(properties.word_count) !== Number(parsedFilters.word_count)) return false;
            }

            if (parsedFilters.min_length !== undefined) {
                if (properties.length < parsedFilters.min_length) return false;
            }

            if (parsedFilters.max_length !== undefined) {
                if (properties.length > parsedFilters.max_length) return false;
            }

            if (parsedFilters.contains_character !== undefined) {
                const char = parsedFilters.contains_character.toLowerCase();
                if (!val.includes(char)) return false;
            }

            return true;
        });

        // --- No matches ---
        if (filteredResults.length === 0) {
            warn("No matching strings found for the given natural query".red);
            return res.status(404).json({ error: "No matching strings found for the given natural language query" });
        }

        // --- Construct response ---
        const response = {
            data: filteredResults.map(entry => ({
                id: entry.id,
                value: entry.value,
                properties: entry.properties,
                createdAt: entry.createdAt
            })),
            count: filteredResults.length,
            interpreted_query: {
                original: query,
                parsed_filters: parsedFilters
            }
        };

        info("Natural language query processed successfully".green);
        res.status(200).json(response);

    } catch (error) {
        // If the error was thrown by parseNaturalQuery, use its status
        if (error.status) {
            warn(`Natural Language Query Error: ${error.message}`.red);
            return res.status(error.status).json({ error: error.message });
        }
        warn("Internal Server Error".red);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


/**
 * DELETE /strings/:value - Delete a specific string entry
 */
export const deleteString = (req, res) => {
    try {
        info("Processing request to delete string entry".blue);
        const { value } = req.params;

        // Normalize the input value to match the storage key
        const normalizedKey = value.toLowerCase().trim();

        // Validate input
        if (!normalizedKey) {
            warn("Missing string value in request params".red);
            return res.status(400).json({ error: "Missing string value in request parameters" });
        }
        
        const storedStrings = readStorage();

        // Check if the string exists
        if (!storedStrings[normalizedKey]) {
            warn("String does not exist in the system".red);
            return res.status(404).json({ error: "String does not exist in the system" });
        }

        // Delete the string
        delete storedStrings[normalizedKey];
        writeStorage(storedStrings);

        info("String entry deleted successfully".green);
        return res.status(204).send(); // No content, as specified

    } catch (error) {
        warn("Internal Server Error".red);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// No longer needed, removed for cleaner code.
// export const test = (req, res) => {
//     res.send("Hello from the controller!");
// };
