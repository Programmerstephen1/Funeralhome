# API Documentation

## Base URL

```
http://localhost:5000
```

## Authentication

Currently, the API does not require authentication. This will be implemented in a future phase using JWT tokens.

---

## Endpoints

### Health Check

**GET** `/api/health`

Health check endpoint to verify API connectivity.

**Response:**
```json
{
  "status": "ok"
}
```

---

### Services

#### List All Services

**GET** `/api/services`

Retrieves a list of all funeral services offered.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Funeral Planning",
    "description": "Guided planning support for every need."
  },
  {
    "id": 2,
    "name": "Obituary Writing",
    "description": "Compassionate obituary creation services."
  },
  {
    "id": 3,
    "name": "Memorial Tributes",
    "description": "Personalized tributes and guestbook pages."
  }
]
```

---

### Tributes

#### List All Tributes

**GET** `/api/tributes`

Fetches up to 10 most recent tributes.

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "message": "A wonderful person who touched our lives."
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "message": "Forever in our hearts."
  }
]
```

#### Create a New Tribute

**POST** `/api/tributes`

Submits a new tribute/condolence message.

**Request Body:**
```json
{
  "name": "John Doe",
  "message": "A wonderful person who touched our lives."
}
```

**Response:** *(201 Created)*
```json
{
  "id": 1,
  "name": "John Doe",
  "message": "A wonderful person who touched our lives."
}
```

**Error Response:** *(400 Bad Request)*
```json
{
  "error": "Missing required fields"
}
```

---

### Payments (M-Pesa)

#### Initiate STK Push

**POST** `/api/payments/stkpush`

Initiates an M-Pesa STK push request for payment.

**Request Body:**
```json
{
  "amount": 5000,
  "phone": "254712345678"
}
```

**Response:**
```json
{
  "status": "pending",
  "amount": 5000,
  "phone": "254712345678",
  "checkout_request_id": "STK123456789",
  "message": "STK Push request generated. Replace with real MPesa integration."
}
```

**Notes:**
- Amount is in KES (Kenyan Shillings)
- Phone number should include country code (e.g., 254 for Kenya)
- This endpoint currently returns a stub response. Real M-Pesa integration required.

---

## Error Handling

All error responses follow this format:

```json
{
  "error": "Error message describing the issue"
}
```

**Common HTTP Status Codes:**
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## CORS

The API allows cross-origin requests from any origin during development. In production, update the `CORS` configuration in `backend/app/__init__.py` to restrict to your frontend domain:

```python
CORS(app, resources={r"/api/*": {"origins": ["https://yourdomain.com"]}})
```

---

## Rate Limiting

Currently, no rate limiting is implemented. This should be added before production deployment.

---

## Frontend Integration Example

```javascript
import api from './services/api.js';

// Fetch tributes
const tributes = await api.getTributes();
console.log(tributes);

// Create a tribute
const newTribute = await api.createTribute('John Doe', 'A wonderful person...');
console.log(newTribute);

// Initiate payment
const payment = await api.initiateStkPush(5000, '254712345678');
console.log(payment);
```

---

## Testing with cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Get services
curl http://localhost:5000/api/services

# Get tributes
curl http://localhost:5000/api/tributes

# Create tribute
curl -X POST http://localhost:5000/api/tributes \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","message":"A tribute message"}'

# Initiate STK push
curl -X POST http://localhost:5000/api/payments/stkpush \
  -H "Content-Type: application/json" \
  -d '{"amount":5000,"phone":"254712345678"}'
```

---

## Future Enhancements

- [ ] Authentication & Authorization (JWT)
- [ ] Rate limiting
- [ ] Request validation & error handling
- [ ] Full M-Pesa integration
- [ ] Email notifications
- [ ] Pagination for list endpoints
- [ ] Search/filter functionality
- [ ] Image upload endpoints
- [ ] Admin endpoints for content management
