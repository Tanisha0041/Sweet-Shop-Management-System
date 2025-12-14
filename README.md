# 🍬 Sweet Shop Management System

A full-stack Sweet Shop Management System built with Node.js/TypeScript (Express) for the backend and React for the frontend. This project demonstrates TDD practices, clean code architecture, and modern web development techniques.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Screenshots](#screenshots)
- [My AI Usage](#my-ai-usage)

## ✨ Features

### Authentication
- User registration with email verification
- JWT-based authentication
- Role-based access control (User/Admin)

### Sweet Management
- View all available sweets
- Search sweets by name
- Filter by category and price range
- Add, update, and delete sweets (Admin)

### Inventory Management
- Purchase sweets (decreases quantity)
- Restock sweets (Admin only)
- Out-of-stock indicators

### Frontend
- Modern, responsive UI design
- Real-time stock updates
- Toast notifications
- Modal forms for CRUD operations

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: SQLite (TypeORM)
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Testing**: Jest + Supertest
- **Password Hashing**: bcryptjs

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Styling**: Custom CSS with CSS Variables

## 📁 Project Structure

```
sweet-shop-management-system/
├── backend/
│   ├── src/
│   │   ├── config/           # Database configuration
│   │   ├── entities/         # TypeORM entities (User, Sweet)
│   │   ├── middleware/       # Auth & validation middleware
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── tests/            # Jest test files
│   │   ├── app.ts            # Express app setup
│   │   └── index.ts          # Server entry point
│   ├── jest.config.js
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React Context (Auth)
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service layer
│   │   ├── types/            # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_PATH=./data/sweetshop.db
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=24h
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open `http://localhost:3000` in your browser

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Sweet Endpoints

| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/api/sweets` | Get all sweets | Yes | No |
| GET | `/api/sweets/search` | Search sweets | Yes | No |
| GET | `/api/sweets/:id` | Get sweet by ID | Yes | No |
| POST | `/api/sweets` | Create sweet | Yes | No |
| PUT | `/api/sweets/:id` | Update sweet | Yes | No |
| DELETE | `/api/sweets/:id` | Delete sweet | Yes | Yes |

### Inventory Endpoints

| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| POST | `/api/sweets/:id/purchase` | Purchase sweet | Yes | No |
| POST | `/api/sweets/:id/restock` | Restock sweet | Yes | Yes |

### Request/Response Examples

#### Register User
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "username": "sweetlover",
  "password": "Password123!"
}
```

#### Create Sweet
```json
POST /api/sweets
{
  "name": "Chocolate Truffle",
  "description": "Rich dark chocolate truffle",
  "category": "chocolate",
  "price": 5.99,
  "quantity": 100
}
```

#### Search Sweets
```
GET /api/sweets/search?name=chocolate&category=chocolate&minPrice=2&maxPrice=10
```

## 🧪 Testing

The project follows TDD (Test-Driven Development) practices. Tests are written using Jest and Supertest.

### Running Tests

```bash
cd backend
npm test
```

### Running Tests with Coverage

```bash
npm test -- --coverage
```

### Test Categories

1. **Auth Tests** (`auth.test.ts`)
   - User registration validation
   - Login functionality
   - Token verification

2. **Sweets Tests** (`sweets.test.ts`)
   - CRUD operations
   - Search and filtering
   - Authorization checks

3. **Inventory Tests** (`inventory.test.ts`)
   - Purchase functionality
   - Restock operations
   - Stock validation

## 📸 Screenshots

### Login Page
*Beautiful login form with gradient background*

### Dashboard
*Sweet grid display with search and filter options*

### Admin Panel
*Statistics overview and inventory management*

### Sweet Modal
*Create/Edit sweet form in a modal*

## 🤖 My AI Usage

### Tools Used

1. **GitHub Copilot (Claude Opus 4.5)** - Primary AI assistant used throughout the development process.

### How AI Was Used

1. **Project Structure & Boilerplate**
   - AI helped generate the initial project structure
   - Created TypeScript configurations for both backend and frontend
   - Generated package.json files with appropriate dependencies

2. **Backend Development**
   - Generated TypeORM entity definitions (User, Sweet)
   - Created Express middleware for authentication and validation
   - Developed service layer with business logic
   - Built RESTful API routes following best practices

3. **Test Development (TDD)**
   - AI generated comprehensive test suites following TDD patterns
   - Tests were written first (RED phase), then implementation (GREEN phase)
   - Coverage includes auth, CRUD, and inventory operations

4. **Frontend Development**
   - Generated React components with TypeScript
   - Created context providers for state management
   - Built responsive CSS with CSS variables
   - Implemented API service layer with Axios

5. **Documentation**
   - AI helped structure and write this README
   - Generated API documentation with examples

### Reflection on AI Impact

**Positive Impacts:**
- Significantly accelerated development speed
- Helped maintain consistent coding patterns
- Generated comprehensive test coverage
- Reduced boilerplate coding time

**Learnings:**
- AI works best when given clear, specific requirements
- Always review and understand generated code
- AI suggestions serve as a starting point, not final solutions
- Manual refinement is often needed for edge cases

**Best Practices Followed:**
- Reviewed all AI-generated code before committing
- Made manual adjustments for project-specific requirements
- Used AI as a productivity tool, not a replacement for understanding
- Documented all AI-assisted development transparently

---

## 📄 License

This project is created for educational purposes as part of a TDD Kata exercise.

## 👤 Author

Created with ❤️ and 🤖 AI assistance
