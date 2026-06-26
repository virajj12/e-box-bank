# BankLite — Smart Loan Origination System

A production-quality Flask backend for managing loan applications, credit scoring, officer review workflows, and full audit trails.

---

## Features

- **Session-token authentication** with bcrypt password hashing
- **Role-based access control** — Customer & Credit Officer roles
- **Loan application workflow** — submit, review, approve/reject
- **Simulated credit scoring** (300–850 range)
- **Immutable audit log** for every underwriting decision
- **Input validation** via Marshmallow schemas
- **Centralised error handling** with consistent JSON responses
- **Rotating file & console logging**
- **CORS enabled**
- **Blueprint-based modular architecture**

---

## Folder Structure

```
backend/
├── app/
│   ├── __init__.py          # Application factory
│   ├── config.py            # Dev / Test / Prod config
│   ├── extensions.py        # SQLAlchemy, Migrate, CORS instances
│   ├── models/
│   │   ├── user.py          # User model
│   │   ├── loan.py          # LoanApplication model
│   │   └── audit.py         # AuditLog model
│   ├── routes/
│   │   ├── auth_routes.py   # Login endpoint
│   │   └── loan_routes.py   # Loan & audit endpoints
│   ├── middleware/
│   │   └── auth.py          # @login_required, @customer_required, @officer_required
│   ├── services/
│   │   ├── auth_service.py  # Login business logic
│   │   ├── loan_service.py  # Loan CRUD & credit scoring
│   │   └── audit_service.py # Audit trail operations
│   ├── schemas/
│   │   ├── auth_schema.py   # Login validation
│   │   └── loan_schema.py   # Loan apply & action validation
│   └── utils/
│       ├── security.py      # bcrypt + UUID token helpers
│       ├── response.py      # JSON response helpers
│       └── logger.py        # Logging setup
├── migrations/              # Alembic migration files
├── logs/                    # Application logs (auto-created)
├── tests/
│   ├── conftest.py          # Pytest fixtures
│   ├── test_auth.py         # Authentication tests
│   └── test_loans.py        # Loan workflow tests
├── seed.py                  # Sample data seeder
├── run.py                   # Application entry point
├── requirements.txt         # Python dependencies
├── .env.example             # Environment variable template
└── README.md                # This file
```

---

## Installation

### Prerequisites

- Python 3.12+
- PostgreSQL (optional — SQLite works for development)

### Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd backend

# 2. Create a virtual environment
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env with your database URL and secret key
```

---

## Environment Variables

| Variable       | Description                        | Default                 |
|----------------|------------------------------------|-------------------------|
| `DATABASE_URL` | Database connection string         | `sqlite:///banklite.db` |
| `SECRET_KEY`   | Flask secret key                   | `dev-secret-key`        |
| `FLASK_ENV`    | `development` / `production`       | `development`           |
| `PORT`         | Server port                        | `5000`                  |

---

## Database Migrations

```bash
# Initialise migrations (first time only)
flask db init

# Generate migration after model changes
flask db migrate -m "Initial migration"

# Apply migrations
flask db upgrade
```

---

## Seed Data

```bash
python seed.py
```

Creates two users:

| Role            | Email              | Password      |
|-----------------|--------------------|---------------|
| Customer        | customer@test.com  | customer123   |
| Credit Officer  | officer@test.com   | officer123    |

---

## Run the Server

```bash
python run.py
```

Server starts at `http://localhost:5000`.

---

## API Reference

All endpoints return JSON in this format:

**Success:**
```json
{
    "success": true,
    "data": { ... }
}
```

**Error:**
```json
{
    "success": false,
    "message": "..."
}
```

### Authentication

#### `POST /api/v1/auth/login`

**Body:**
```json
{
    "email": "customer@test.com",
    "password": "customer123"
}
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "token": "a1b2c3d4e5f6...",
        "role": "customer",
        "full_name": "Alice Customer"
    }
}
```

---

### Loan Applications (Customer)

#### `POST /api/v1/loans/apply`

**Headers:** `Authorization: <token>`

**Body:**
```json
{
    "amount": 100000,
    "purpose": "Home Loan",
    "monthly_income": 70000
}
```

**Response (201):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "user_id": 1,
        "amount": 100000.0,
        "purpose": "Home Loan",
        "monthly_income": 70000.0,
        "credit_score": 723,
        "status": "pending",
        "created_at": "2026-06-26T12:00:00"
    }
}
```

#### `GET /api/v1/loans/my-applications`

**Headers:** `Authorization: <token>`

**Response (200):**
```json
{
    "success": true,
    "data": [
        { "id": 1, "amount": 100000.0, "status": "pending", ... }
    ]
}
```

---

### Loan Review (Credit Officer)

#### `GET /api/v1/loans/pending`

**Headers:** `Authorization: <officer-token>`

Returns all pending applications.

#### `GET /api/v1/loans/<id>`

**Headers:** `Authorization: <officer-token>`

**Response (200):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "user_id": 1,
        "customer_name": "Alice Customer",
        "amount": 100000.0,
        "purpose": "Home Loan",
        "monthly_income": 70000.0,
        "credit_score": 723,
        "status": "pending",
        "created_at": "2026-06-26T12:00:00"
    }
}
```

#### `PUT /api/v1/loans/<id>/action`

**Headers:** `Authorization: <officer-token>`

**Body (approve):**
```json
{
    "action": "approved",
    "comments": "Income verified. Good credit score."
}
```

**Body (reject):**
```json
{
    "action": "rejected",
    "comments": "Low repayment capacity."
}
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "status": "approved",
        ...
    }
}
```

---

### Audit Trail (Credit Officer)

#### `GET /api/v1/audit/<loan_id>`

**Headers:** `Authorization: <officer-token>`

**Response (200):**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "application_id": 1,
            "officer_id": 2,
            "action": "approved",
            "comments": "Income verified.",
            "timestamp": "2026-06-26T12:05:00"
        }
    ]
}
```

---

## Testing

```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ -v --tb=short
```

---

## Security

- Passwords are **bcrypt hashed** — never stored as plain text
- Session tokens are **UUID-4** — generated on each login
- **Role-based decorators** enforce access control
- **CORS** is enabled for cross-origin requests
- **Parameterised queries** via SQLAlchemy ORM
- **Input validation** on every endpoint via Marshmallow
- **Password hashes are never exposed** in API responses

---

## License

MIT
