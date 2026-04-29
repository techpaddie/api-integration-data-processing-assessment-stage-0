# genderize-api

A Node.js Express API that provides a single classification endpoint, `GET /api/classify`, which calls the external [Genderize API](https://api.genderize.io), validates input, and returns a processed prediction payload.

## Base URL

- Local default: `http://localhost:3000`
- Configurable via environment variable: `PORT`

## Tech Stack

Based on `package.json`:

- `Node.js`
- `Express` (`^4.21.2`)
- `Axios` (`^1.9.0`)

## Setup

### Prerequisites

- Node.js installed

### Install dependencies

```bash
npm install
```

### Start server

```bash
npm start
```

This runs:

```bash
node server.js
```

Server startup behavior:

- Listens on `process.env.PORT` or `3000` by default.
- If the selected port is already in use, startup fails with a clear error and exits.

---

## API Endpoints

### 1) Classify Name

| Field | Value |
|---|---|
| Method | `GET` |
| Route | `/api/classify` |
| Query Params | `name` (required) |

#### Request Example

```http
GET /api/classify?name=john HTTP/1.1
Host: localhost:3000
```

#### Success Response (`200`)

```json
{
  "status": "success",
  "data": {
    "name": "john",
    "gender": "male",
    "probability": 0.99,
    "sample_size": 1234,
    "is_confident": true,
    "processed_at": "2026-04-29T06:00:00.000Z"
  }
}
```

#### No Prediction Response (`200`)

Returned when `gender` is missing/null or sample size resolves to `0`.

```json
{
  "status": "error",
  "message": "No prediction available for the provided name"
}
```

---

### 2) Unknown Routes (Global 404)

| Field | Value |
|---|---|
| Method | Any |
| Route | Any undefined route |
| Response | JSON error |

#### Example

```http
GET /unknown HTTP/1.1
Host: localhost:3000
```

```json
{
  "status": "error",
  "message": "Route not found"
}
```

---

## Error Handling

All handled errors return JSON in this format:

```json
{
  "status": "error",
  "message": "<message>"
}
```

### Implemented error responses

| Status | When it happens | Message |
|---|---|---|
| `400` | `name` query param is missing | `name query parameter is required` |
| `400` | `name` is an empty/whitespace string | `name query parameter cannot be empty` |
| `422` | `name` is not a valid string input (e.g. array/non-string) | `name must be a string` |
| `502` | External Genderize request fails | `Failed to fetch data from external API` |
| `404` | Route not found | `Route not found` |
| `500` | Unhandled internal server error | `Internal server error` |

### Global error handling present

- Global `404` handler for unknown routes
- Global Express error middleware for uncaught runtime errors in request flow
- Server startup error handler (`EADDRINUSE` and generic startup failures)

## Business Logic

For valid `name` input, the API calls `https://api.genderize.io?name=<name>` and transforms the result.

### Field mapping

- `name` -> output `name` (falls back to validated input if missing upstream)
- `gender` -> output `gender`
- `probability` -> output `probability` (numeric conversion)
- `count` -> output `sample_size`

### Confidence rule

```text
is_confident = (probability >= 0.7) AND (sample_size >= 100)
```

### Timestamp

- `processed_at` is generated at response time using UTC ISO 8601 (`new Date().toISOString()`).

## External Dependencies and Services

### NPM packages used

- `express`: HTTP server and routing
- `axios`: outbound HTTP call to Genderize

### External API used

- `https://api.genderize.io`
  - Called via `axios.get(...)`
  - Query param sent: `name`
  - Timeout configured: `5000ms`

## CORS Behavior

The API sets this response header for all requests:

```http
Access-Control-Allow-Origin: *
```

## Project Structure

```text
.
├── server.js
├── package.json
├── package-lock.json
├── README.md
├── routes
│   └── classify.js
├── controllers
│   └── classifyController.js
├── services
│   └── genderizeService.js
└── utils
    └── validator.js
```