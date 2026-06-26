# BankLite Backend Structure

## Backend Architecture

The backend follows a layered architecture where each component has a single responsibility. This separation makes the project easier to maintain, test, and scale.

```
Client (React)
       │
       ▼
REST API (Flask)
       │
       ├── Authentication Layer
       ├── Authorization Layer
       ├── Controllers (Routes)
       ├── Business Logic (Services)
       ├── Database Models
       └── Database
```

---

# Project Directory Structure

```
BankLite/
│
├── app.py                     # Application entry point
├── config.py                  # Database and application configuration
├── requirements.txt           # Python dependencies
│
├── database/
│   ├── db.py                  # Database connection
│   └── schema.sql             # SQL schema
│
├── models/
│   ├── user.py                # User model
│   ├── loan.py                # Loan Application model
│   └── audit.py               # Audit Log model
│
├── routes/
│   ├── auth_routes.py         # Login endpoints
│   └── loan_routes.py         # Loan APIs
│
├── services/
│   ├── auth_service.py        # Login logic
│   ├── loan_service.py        # Loan processing
│   ├── credit_service.py      # Credit score generation
│   └── audit_service.py       # Audit logging
│
├── middleware/
│   ├── auth.py                # Token validation
│   └── role_check.py          # Role authorization
│
├── utils/
│   ├── validators.py          # Input validation
│   ├── response.py            # Standard API responses
│   └── helpers.py             # Utility functions
│
├── logs/
│   └── server.log             # Application logs
│
└── tests/
    ├── test_auth.py
    ├── test_loans.py
    └── test_officer.py
```

---

# Layer Responsibilities

## 1. Routes Layer

Responsible for receiving HTTP requests.

Functions:

* Accept client requests
* Read headers and JSON body
* Call service layer
* Return HTTP response

Example:

```
POST /login

↓

auth_routes.py

↓

auth_service.login()

↓

JSON Response
```

---

## 2. Authentication Layer

Purpose:

Identify who is making the request.

Responsibilities:

* Verify email
* Verify password
* Generate UUID token
* Store session token
* Return authenticated user

Example Flow

```
Email + Password

↓

Database Lookup

↓

Password Match

↓

Generate UUID

↓

Save Token

↓

Return Token
```

---

## 3. Authorization Layer

Purpose:

Verify whether the authenticated user has permission to perform an action.

Rules:

Customer

* Apply for loan
* View own loans

Credit Officer

* View pending loans
* Approve loans
* Reject loans

Example

```
Incoming Request

↓

Validate Token

↓

Check Role

↓

Allow or Reject
```

---

## 4. Service Layer

Contains all business logic.

Example services

### Auth Service

Responsibilities

* Login validation
* Session creation

---

### Loan Service

Responsibilities

* Validate application
* Generate credit score
* Save application
* Fetch customer loans
* Fetch pending loans
* Update application status

---

### Credit Service

Responsibilities

* Generate simulated credit score

```
300 ≤ Score ≤ 850
```

This logic is isolated so it can later be replaced with a real credit bureau API.

---

### Audit Service

Responsibilities

Record every approval or rejection.

Stored information

* Officer ID
* Loan ID
* Action
* Comments
* Timestamp

---

## 5. Database Layer

Contains all database operations.

Tables

```
Users

Loan Applications

Audit Logs
```

Relationships

```
Users

1 ------ * Loan Applications

Loan Applications

1 ------ * Audit Logs
```

---

# Request Flow

## Customer Login

```
Client

↓

POST /login

↓

Authentication

↓

User Table

↓

Generate UUID

↓

Return Token
```

---

## Apply Loan

```
Customer

↓

Validate Token

↓

Check Role

↓

Generate Credit Score

↓

Insert Loan

↓

Status = Pending

↓

Return Success
```

---

## View My Applications

```
Customer

↓

Validate Token

↓

Find User

↓

SELECT Loan Applications

↓

Return JSON
```

---

## Officer Reviews Loan

```
Officer

↓

Validate Token

↓

Check Role

↓

Find Application

↓

Approve / Reject

↓

Insert Audit Log

↓

Commit Transaction

↓

Return Success
```

---

# API Endpoints

## Authentication

```
POST /api/v1/auth/login
```

Public Endpoint

---

## Customer APIs

```
POST /api/v1/loans/apply

GET /api/v1/loans/my-applications
```

Protected

Requires Customer Role

---

## Officer APIs

```
GET /api/v1/loans/pending

PUT /api/v1/loans/{id}/action
```

Protected

Requires Credit Officer Role

---

# Validation Rules

Before processing any request

Validate

* Email format
* Password presence
* Positive loan amount
* Positive monthly income
* Purpose not empty
* Valid authorization token
* Valid user role

---

# Database Transactions

Used for loan approval.

```
BEGIN

↓

Update Loan Status

↓

Insert Audit Log

↓

COMMIT
```

If an error occurs

```
ROLLBACK
```

This guarantees data consistency.

---

# Security Considerations

## Passwords

Never stored as plain text.

```
Password

↓

Hash

↓

Database
```

---

## Sessions

After login

```
Generate UUID

↓

Store Token

↓

Authorization Header

↓

Validate Token
```

---

## Authorization

Every protected endpoint verifies

* Authentication
* User role
* Request permissions

---

# Error Handling

Standard HTTP responses

```
200 OK
```

Request successful

```
400 Bad Request
```

Invalid input

```
401 Unauthorized
```

Invalid token or credentials

```
403 Forbidden
```

User lacks required permissions

```
404 Not Found
```

Requested resource does not exist

```
500 Internal Server Error
```

Unexpected server error

---

# Logging

Application Logs

* Login attempts
* Database errors
* API failures
* Server exceptions

Audit Logs

* Loan approval
* Loan rejection
* Officer comments
* Timestamp

---

# Backend Workflow Summary

```
Client Request

↓

Routes

↓

Authentication

↓

Authorization

↓

Business Logic (Services)

↓

Database

↓

Audit Logging

↓

JSON Response
```

This layered structure ensures the backend remains modular, secure, maintainable, and scalable while clearly separating request handling, business logic, authentication, authorization, and data persistence.
