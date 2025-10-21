# 🧠 HNG-stage-one: String Analysis API

A minimalist **Express.js backend** for analyzing, storing, filtering, and deleting strings.  
It supports **palindrome detection**, **word counting**, and **natural language filtering** using simple heuristics.  
Everything is stored in a local JSON file — no database setup required.

---

## 🚀 Features

- Create and analyze strings with rich metadata  
- Retrieve single or multiple string entries  
- Filter with structured or **natural language** queries  
- Delete stored strings  
- Persistent local JSON storage  
- Color-coded logs for visibility  

---

## 🗂️ Project Structure
```bash
        string-analyzer-api/
      │
      ├── controllers/
      │ └── controller.js # All route logic (create, read, filter, delete)
      │
      ├── routes/
      │ └── routes.js # API routes mapped to controller methods
      │
      ├── utils/
      │ └── logger.js # Logging utilities
      │
      ├── stringsStore.json # Local JSON storage
      │
      ├── server.js # Express app entry point
      ├── package.json
      └── README.md

```

---

## ⚙️ Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/string-analyzer-api.git
cd string-analyzer-api
```
### 2. Install dependencies
```bash
npm install express cors body-parser
```

### 3. Run the server
```bash
npm start
```
### 4. Development mode (auto-restart)
```bash
npm run dev
```

---

🧩 API Endpoints
### 1. Create a String
  POST `/strings
  `  <br/> <br/>
  Request Body
  ```json
      {
        "value": "man of stones"
      }
  ```
  Success Response – 201 Created
  ```json
      {
        "id": "fcfc1723-1326-4d2f-8278-b4161af13775",
        "value": "man of stones",
        "properties": {
          "length": 13,
          "is_palindrome": false,
          "unique_characters": 9,
          "word_count": 3,
          "sha256_hash": "dce77f0279534f7699f89da44f164faf770e10925c265960f2ec499d63a0dfb2",
          "character_frequency_map": {
            "m": 1,
            "a": 1,
            "n": 2,
            "o": 2,
            "f": 1,
            "s": 2,
            "t": 1,
            "e": 1
          }
        },
        "createdAt": "2025-10-21T10:22:43.918Z"
      }
  ```
  
  Error Responses:
  - 400 Bad Request – Missing or invalid body field
  - 409 Conflict – String already exists
  
### 2. Get All Strings
GET `/strings
` <br/> <br/>
Success Response – 200 OK
```json
    {
      "data": [ /* all stored strings */ ],
      "count": 3
    }
```
### 3. Get a Specific String

GET `/strings/:value
` <br/> <br/>
```bash
      Example:
      GET /strings/man%20of%20stones
```

Success Response:
```json
    {
      "id": "fcfc1723-1326-4d2f-8278-b4161af13775",
      "value": "man of stones",
      "properties": {
        "length": 13,
        "is_palindrome": false,
        "unique_characters": 9,
        "word_count": 3
      },
      "createdAt": "2025-10-21T10:22:43.918Z"
    }
```

Error Response:

- 404 Not Found – String does not exist in the system

### 4. Filter Strings (Structured Query)

GET `/strings?is_palindrome=true&min_length=5&max_length=15
` <br/> <br/>

Supported Query Parameters:

|Parameter|	Type | Description|
|----------|------------|------------------------------------|
|is_palindrome |	boolean	| Filter palindromic strings|
|min_length |	number |	Minimum string length|
|max_length	| number |	Maximum string length|
|word_count |	number |	Exact word count|
|contains_character |	string |	Must include a given character

Example Response:
```json
    {
      "data": [ { "value": "racecar", "properties": { "is_palindrome": true } } ],
      "count": 1,
      "filters_applied": {
        "is_palindrome": "true",
        "min_length": "5",
        "max_length": "15"
      }
    }
```
### 5. Natural Language Filtering

GET `/strings/filter-by-natural-language?query=<your query>
` <br/> <br/>

Success Response – 200 OK
```json
    {
      "data": [ /* filtered results */ ],
      "count": 1,
      "interpreted_query": {
        "original": "all single word palindromic strings",
        "parsed_filters": {
          "is_palindrome": true,
          "word_count": 1
        }
      }
    }
```
Error Responses:
- 400 Bad Request – Unable to parse natural language query
- 422 Unprocessable Entity – Conflicting filters
- 404 Not Found – No matching string entries

### 6. Delete String

DELETE `/strings/:value
` <br/><br/>

Example:
```bash
DELETE /strings/man%20of%20stones
```
Success Response – 204 No Content
- (Empty response body)

Error Responses:
- 404 Not Found – String does not exist
- 400 Bad Request – Missing or invalid parameter
