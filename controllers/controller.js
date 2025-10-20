import crypto from "crypto";
import { info, error, warn } from "../utils/logger.js";
import colors from "colors";

export const test = (req, res) => {
  res.send("Hello from the controller!");
};

const storedStrings = new Map();

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
    const normalizedValue = value.toLowerCase();
    if (storedStrings.has(value)) {
      warn("Conflict: String already exists in the system".red);
      return res
        .status(409)
        .json({ error: "String already exists in the system" });
    }

    // Generate a random UUID for the new string entry

    const uuid = crypto.randomUUID();

    const hash = crypto.createHash("sha256").update(uuid).digest("hex");

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
    storedStrings.set(normalizedValue, resData);

    info("String entry created successfully".green);
    res.status(201).json(resData);
  } catch (error) {
    warn("Internal Server Error".red);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
