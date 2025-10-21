import crypto from "crypto";
import { info, error, warn } from "../utils/logger.js";
import colors from "colors";
import fs from "fs";
import path from "path";

export const test = (req, res) => {
  res.send("Hello from the controller!");
};

const storagePath = path.resolve("./stringsStore.json");

// In-memory storage for strings
if (!fs.existsSync(storagePath)) {
  fs.writeFileSync(storagePath, JSON.stringify({}), "utf-8");
}

// Helper: read storage from file
function readStorage() {
  const data = fs.readFileSync(storagePath, "utf-8");
  return JSON.parse(data);
}

// Helper: write storage to file
function writeStorage(data) {
  fs.writeFileSync(storagePath, JSON.stringify(data, null, 2), "utf-8");
} 

export const createString = (req, res) => {
  try {
    res.set("Content-Type", "application/json");
    info("Processing request to create a new string entry".blue);
    const { value } = req.body;

    //! Handle missing or invalid 'value' field
    if (!value) {
      error("Bad Request: Invalid request body or missing 'value' field".red);
      return res
        .status(400)
        .json({ error: "Invalid request body or missing 'value' field" });
    }

    //! Handle invalid data type for 'value' field
    if (typeof value !== "string") {
      warn("Invalid data type for 'value' (must be string)".red);
      return res
        .status(422)
        .json({ error: "Invalid data type for 'value' (must be string)" });
    }

    //! Check for duplicate string entries
    const storedStrings = readStorage();
    const normalizedValue = value.toLowerCase();

    if (storedStrings[normalizedValue]) {
      warn("Conflict: String already exists in the system".red);
      return res
        .status(409)
        .json({ error: "String already exists in the system" });
    }

    // Generate a random UUID for the new string entry

    const uuid = crypto.randomUUID();

    const hash = crypto.createHash("sha256").update(value).digest("hex");

    //TODO:  Create the string properties functions

    //Create the palindrome function
    function isPalindrome(str) {
      const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, "");

      const reverse = cleaned.split("").reverse().join("");

      return cleaned === reverse;
    }

    //create the word counter function
    function wordCount(str) {
      const words = value.trim().split(/\s+/);
      const count = value.trim() === "" ? 0 : words.length;
      return count;
    }

    //create unique characters counter function
    function uniqueCharacterCount(str) {
      const uniqueChars = new Set(str);
      return uniqueChars.size;
    }

    //Create a character frequency function
    function charFreqCount(str) {
      const freq = {};
      for (let char of str.toLowerCase()) {
        if (char === " ") continue; // skip the spaces
        freq[char] = (freq[char] || 0) + 1;
      }
      return freq;
    }

    // Construct the response data object

    const resData = {
      id: uuid,
      value,
      properties: {
        length: value.length,
        is_palindrome: isPalindrome(value),
        unique_characters: uniqueCharacterCount(value),
        word_count: wordCount(value),
        sha256_hash: hash,
        character_frequency_map: charFreqCount(value)
      },
      createdAt: new Date().toISOString()
    };

    // Store the new string entry
    storedStrings[normalizedValue] = resData ;
    writeStorage(storedStrings);

    info("String entry created successfully".green);
    res.status(201).json(resData);
  } catch (error) {
    warn("Internal Server Error".red);
    res.status(500).json({ error: "Internal Server Error" });
  
  }
};

export const getStrings = (req, res) => {
  
  // Search for the string entry
  try {
    info("Processing request to retrieve string entries".blue);
    const { value } = req.params; 

    // Normalize the input value
    const newValue = value.toLowerCase().replace(/[^a-z_0-9]/g, " ");

    //Validate the presence of 'value' parameter
        if (!newValue) {
      warn("Missing string value in request params".red);
      return res.status(400).json({ error: "Missing string value in request parameters" });
    }

  
    info("Searching for string entry".blue);
    const normalizedValue = newValue.toLowerCase();
    const storedStrings = readStorage();

    // Check if the string entry exists
    if (!storedStrings[normalizedValue]) {
      warn(" String does not exist in the system".red);
      return res.status(404).json({ error: " String does not exist in the system" })
    } 
    const stringData = storedStrings[normalizedValue];

    info("String entry found".green);
    return res.status(200).json(stringData);

  } catch (error) {
    warn("Internal Server Error".red);
    res.status(500).json({ error: "Internal Server Error" });

  }
};
