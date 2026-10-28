# 🏥 Healthcare Backend API (Node.js)

A high-performance, modular backend system for a healthcare application built using **Node.js, Express.js, PostgreSQL, and Sequelize ORM**.

This project implements the complete healthcare specification originally modeled in Django/DRF, translated into clean, idiomatic Node.js architecture.

---

## 🚀 Technology Stack

| Requirement (PDF Specification) | Node.js Implementation Equivalent |
|---|---|
| **Backend Framework** | Express.js 5.x |
| **Database** | PostgreSQL with Sequelize ORM |
| **Database Migrations** | Sequelize CLI Migrations (`sequelize-cli`) |
| **Authentication** | JWT (`jsonwebtoken`) + Password Hashing (`bcryptjs`) |
| **Request Validation** | Joi Schema Validation |
| **Configuration** | `dotenv` environment management |
| **Testing** | Node Test Runner + Supertest integration suite |

---

## 📁 Architecture & Project Structure

The project strictly follows the **Controller - Service - Repository/Model** pattern with centralized error handling and middleware pipelines:

```
HealthcareApp/
├── .env.example                       # Environment variable template
├── .env                               # Active environment configuration
├── .sequelizerc                       # Sequelize CLI path mappings
├── package.json                       # Project metadata and dependencies
├── README.md                          # Full setup and API documentation
├── src/
│   ├── config/
│   │   ├── config.js                  # Database connection profiles (dev, test, prod)
│   │   └── env.js                     # Environment variable loader and parser
│   ├── models/
│   │   ├── index.js                   # Sequelize initialization & relational associations
│   │   ├── User.js                    # User model (id, name, email, password)
│   │   ├── Patient.js                 # Patient model (with creator userId foreign key)
│   │   ├── Doctor.js                  # Doctor model (specialization, experience, contact)
│   │   └── PatientDoctorMapping.js    # Through-table mapping patients to doctors
│   ├── migrations/
│   │   ├── 20261028000001-create-users.js
│   │   ├── 20261028000002-create-patients.js
│   │   ├── 20261028000003-create-doctors.js
│   │   └── 20261028000004-create-patient-doctor-mappings.js
│   ├── middlewares/
│   │   ├── auth.middleware.js         # JWT verification & req.user injection
│   │   ├── validate.middleware.js     # Joi validation middleware (body, params, query)
│   │   └── error.middleware.js        # Centralized HTTP error handler
│   ├── validations/
│   │   ├── auth.validation.js         # Registration & login schemas
│   │   ├── patient.validation.js      # Patient payload & param schemas
│   │   ├── doctor.validation.js       # Doctor payload & param schemas
│   │   └── mapping.validation.js      # Assignment & mapping schemas
│   ├── services/
│   │   ├── auth.service.js            # User creation, authentication, JWT tokens
│   │   ├── patient.service.js         # Patient business logic & ownership scoping
│   │   ├── doctor.service.js          # Doctor management logic
│   │   └── mapping.service.js         # Patient-Doctor assignment logic
│   ├── controllers/
│   │   ├── auth.controller.js         # Handles auth HTTP requests
│   │   ├── patient.controller.js      # Handles patient HTTP requests
│   │   ├── doctor.controller.js       # Handles doctor HTTP requests
│   │   └── mapping.controller.js      # Handles mapping HTTP requests
│   ├── routes/
│   │   ├── index.js                   # Master router
│   │   ├── auth.routes.js             # /api/auth/*
│   │   ├── patient.routes.js          # /api/patients/*
│   │   ├── doctor.routes.js           # /api/doctors/*
│   │   └── mapping.routes.js          # /api/mappings/*
│   ├── utils/
│   │   ├── apiError.js                # Custom operational error class
│   │   └── apiResponse.js             # Consistent response envelope
│   ├── app.js                         # Express application setup
│   └── server.js                      # Server entrypoint & DB lifecycle
└── tests/
    ├── api.test.js                    # Automated integration test suite (31 tests)
    └── testRunner.js                  # CLI verification suite with formatted results table
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v24.x tested)
- **PostgreSQL**: (or use the built-in standalone PostgreSQL engine via `USE_PG_MEM=true`)

### 2. Clone / Open the Project
```bash
cd HealthcareApp
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` configuration:
```env
PORT=5000
NODE_ENV=development

JWT_SECRET=supersecretjwtkey_healthcare_app_2026
JWT_EXPIRES_IN=24h

DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=healthcare_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_DIALECT=postgres

# Standalone mode: set to 'true' to run immediately without an external Postgres server
USE_PG_MEM=true
```

> 💡 **Note**: When connecting to an active external PostgreSQL database, set `USE_PG_MEM=false` and provide your database credentials.

### 5. Run Database Migrations
When using an external PostgreSQL instance:
```bash
npm run migrate
```
To roll back the last migration:
```bash
npm run migrate:undo
```

### 6. Start the Server
- **Production / Standard start:**
  ```bash
  npm start
  ```
- **Development mode with hot reload:**
  ```bash
  npm run dev
  ```
The server will start on `http://localhost:5000`.

---

## 🧪 Testing

The project includes two automated testing workflows:

1. **Full Integration Test Suite (Node.js Test Runner):**
   ```bash
   npm test
   ```
   Runs 31 exhaustive integration tests covering validation errors, authorization boundaries, conflict prevention, and full CRUD operations.

2. **Standalone Verification Runner:**
   ```bash
   npm run test:run
   ```
   Executes a sequential lifecycle verification of every endpoint and prints a visual summary table.

---

## 📖 API Documentation

All routes support both trailing slashes (e.g. `/api/patients/`) and non-trailing slashes (e.g. `/api/patients`).

### 1. Authentication APIs

#### `POST /api/auth/register/`
Register a new user with name, email, and password.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "Dr. Sarah Connor",
    "email": "sarah.connor@example.com",
    "password": "Password123!"
  }
  ```
- **Response `(201 Created)`**:
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": 1,
        "name": "Dr. Sarah Connor",
        "email": "sarah.connor@example.com",
        "createdAt": "2026-10-28T15:20:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

#### `POST /api/auth/login/`
Log in a user and return a JWT access token.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "sarah.connor@example.com",
    "password": "Password123!"
  }
  ```
- **Response `(200 OK)`**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Login successful",
    "data": {
      "user": {
        "id": 1,
        "name": "Dr. Sarah Connor",
        "email": "sarah.connor@example.com"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

---

### 2. Patient Management APIs
*All patient endpoints require the `Authorization: Bearer <token>` header.*

#### `POST /api/patients/`
Add a new patient (associated with the authenticated user).
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "name": "Bruce Wayne",
    "age": 35,
    "gender": "Male",
    "contact_number": "+1-555-0100",
    "address": "1007 Mountain Drive, Gotham",
    "medical_history": "Mild concussion, fractured ribs"
  }
  ```
- **Response `(201 Created)`**:
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "Patient created successfully",
    "data": {
      "id": 1,
      "name": "Bruce Wayne",
      "age": 35,
      "gender": "Male",
      "contact_number": "+1-555-0100",
      "address": "1007 Mountain Drive, Gotham",
      "medical_history": "Mild concussion, fractured ribs",
      "userId": 1,
      "createdAt": "2026-10-28T15:20:00.000Z"
    }
  }
  ```

#### `GET /api/patients/`
Retrieve all patients created by the authenticated user.
- **Access**: Authenticated
- **Response `(200 OK)`**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Patients retrieved successfully",
    "data": [
      {
        "id": 1,
        "name": "Bruce Wayne",
        "age": 35,
        "gender": "Male",
        "contact_number": "+1-555-0100",
        "userId": 1
      }
    ]
  }
  ```

#### `GET /api/patients/<id>/`
Get details of a specific patient by ID.
- **Access**: Authenticated
- **Response `(200 OK)`**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Patient details retrieved successfully",
    "data": {
      "id": 1,
      "name": "Bruce Wayne",
      "age": 35,
      "gender": "Male",
      "contact_number": "+1-555-0100",
      "address": "1007 Mountain Drive, Gotham",
      "medical_history": "Mild concussion, fractured ribs",
      "userId": 1,
      "assignedDoctors": []
    }
  }
  ```

#### `PUT /api/patients/<id>/`
Update patient details (only the creator can update).
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "age": 36,
    "medical_history": "Annual checkup clear."
  }
  ```
- **Response `(200 OK)`**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Patient details updated successfully",
    "data": { ... }
  }
  ```

#### `DELETE /api/patients/<id>/`
Delete a patient record (only the creator can delete).
- **Access**: Authenticated
- **Response `(200 OK)`**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Patient record deleted successfully",
    "data": { "id": 1, "message": "Patient record deleted successfully" }
  }
  ```

---

### 3. Doctor Management APIs
*All doctor endpoints require the `Authorization: Bearer <token>` header.*

#### `POST /api/doctors/`
Add a new doctor.
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "name": "Dr. Gregory House",
    "specialization": "Diagnostic Medicine",
    "email": "dr.house@hospital.org",
    "phone": "+1-555-0200",
    "years_of_experience": 20
  }
  ```
- **Response `(201 Created)`**:
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "Doctor added successfully",
    "data": {
      "id": 1,
      "name": "Dr. Gregory House",
      "specialization": "Diagnostic Medicine",
      "email": "dr.house@hospital.org",
      "phone": "+1-555-0200",
      "years_of_experience": 20
    }
  }
  ```

#### `GET /api/doctors/`
Retrieve all doctors.
- **Access**: Authenticated
- **Response `(200 OK)`**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Doctors retrieved successfully",
    "data": [ ... ]
  }
  ```

#### `GET /api/doctors/<id>/`
Get details of a specific doctor.
- **Access**: Authenticated
- **Response `(200 OK)`**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Doctor details retrieved successfully",
    "data": {
      "id": 1,
      "name": "Dr. Gregory House",
      "specialization": "Diagnostic Medicine",
      "assignedPatients": []
    }
  }
  ```

#### `PUT /api/doctors/<id>/`
Update doctor details.
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "years_of_experience": 21
  }
  ```
- **Response `(200 OK)`**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Doctor details updated successfully",
    "data": { ... }
  }
  ```

#### `DELETE /api/doctors/<id>/`
Delete a doctor record.
- **Access**: Authenticated
- **Response `(200 OK)`**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Doctor record deleted successfully",
    "data": { "id": 1, "message": "Doctor record deleted successfully" }
  }
  ```

---

### 4. Patient-Doctor Mapping APIs
*All mapping endpoints require the `Authorization: Bearer <token>` header.*

#### `POST /api/mappings/`
Assign a doctor to a patient.
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "patient_id": 1,
    "doctor_id": 1,
    "notes": "Primary physician assignment"
  }
  ```
- **Response `(201 Created)`**:
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "Doctor assigned to patient successfully",
    "data": {
      "id": 1,
      "patient_id": 1,
      "doctor_id": 1,
      "assigned_date": "2026-10-28T15:20:00.000Z",
      "notes": "Primary physician assignment",
      "patient": {
        "id": 1,
        "name": "Bruce Wayne",
        "age": 35
      },
      "doctor": {
        "id": 1,
        "name": "Dr. Gregory House",
        "specialization": "Diagnostic Medicine"
      }
    }
  }
  ```

#### `GET /api/mappings/`
Retrieve all patient-doctor mappings.
- **Access**: Authenticated
- **Response `(200 OK)`**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Patient-doctor mappings retrieved successfully",
    "data": [ ... ]
  }
  ```

#### `GET /api/mappings/<patient_id>/`
Get all doctors assigned to a specific patient.
- **Access**: Authenticated
- **Response `(200 OK)`**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Doctors assigned to patient retrieved successfully",
    "data": {
      "patient": {
        "id": 1,
        "name": "Bruce Wayne",
        "age": 35,
        "gender": "Male"
      },
      "totalDoctors": 1,
      "doctors": [
        {
          "mapping_id": 1,
          "id": 1,
          "name": "Dr. Gregory House",
          "specialization": "Diagnostic Medicine",
          "email": "dr.house@hospital.org"
        }
      ]
    }
  }
  ```

#### `DELETE /api/mappings/<id>/`
Remove a doctor from a patient (delete assignment mapping).
- **Access**: Authenticated
- **Response `(200 OK)`**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Doctor removed from patient successfully",
    "data": { "id": 1, "message": "Patient-doctor mapping removed successfully" }
  }
  ```

---

## 🔒 Security & Best Practices
- **Password Security**: Passwords are never stored in plain text and are hashed with `bcryptjs` (salt rounds: 10).
- **Token Security**: Tokens are signed with HMAC SHA-256 (`jsonwebtoken`) and include expiration times.
- **Ownership Scoping**: Patients retrieved with `GET /api/patients/` are strictly filtered by the authenticated user's ID, and modifying or deleting a patient verifies the user is the creator.
- **Duplicate Prevention**: Compound unique database constraints prevent assigning the same doctor to the same patient more than once.
- **Data Integrity**: Relational foreign keys with cascading updates and deletes ensure database consistency.
