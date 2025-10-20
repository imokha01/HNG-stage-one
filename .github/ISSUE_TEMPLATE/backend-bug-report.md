---
name: Backend Bug Report
about: Report a problem or expected behavior in the Express.js API
title: ''
labels: ''
assignees: imokha01

---

## 🐛 Description
Clearly describe the issue or unexpected behavior you’re facing with the API.

**Example:**
> The `/users` endpoint returns a 500 error when sending a valid POST request.

---

## 🔁 Steps to Reproduce
List the exact steps to reproduce the issue:

1. Start the server using `npm run dev`
2. Send a `POST` request to `/api/users` with the following JSON:
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com"
   }
