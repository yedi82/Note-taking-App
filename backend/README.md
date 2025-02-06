# **Backend Setup Instructions**

Welcome to the backend repository! This guide will help you set up and run the backend on your local machine.

## **Table of Contents**

- [Requirements](#requirements)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Backend](#running-the-backend)
- [Testing the API](#testing-the-api)
- [Common Issues](#common-issues)
- [Conclusion](#conclusion)

---

## **Requirements**

Before you can run the backend, make sure you have the following installed on your machine:

- **Node.js** (v14 or higher) - [Download Node.js](https://nodejs.org/)
- **PostgreSQL** - [Download PostgreSQL](https://www.postgresql.org/download/)
- **pnpm** (Package Manager) - Install it globally using npm:

  ```bash
  npm install -g pnpm
  ```

---

## **Installation**

Once you've cloned the repository, follow these steps to install dependencies:

1. **Clone the Repository:**

   ```bash
   git clone <repository-url>
   cd backend  # Navigate to the project directory
   ```

2. **Install Dependencies:**

   Run the following command to install all project dependencies using pnpm:

   ```bash
   pnpm install
   ```

---

## **Database Setup For Server**

# Switch to the postgres superuser (Linux/macOS)
sudo -i -u postgres

# Access the psql shell
psql

# In the psql shell, execute the following SQL commands:
CREATE USER <username> WITH PASSWORD '<password>';
CREATE DATABASE database_v1 OWNER <username>;
-- If not setting owner, alternatively:
-- GRANT ALL PRIVILEGES ON DATABASE database_v1 TO  <username>;

# Exit psql
\q



## **Environment Variables**

You need to set up environment variables to configure the backend.

1. **Create a `.env` File:**

   Create a `.env` file in the root of your project with the following content:

   ```bash
   # .env

   # PostgreSQL database URL
   DATABASE_URL=postgres://<username>:<password>@localhost:5432/<database_name>

   # Port for the backend server
   PORT=5000

   # JWT Secret for token generation (use a strong, random string)
   JWT_SECRET=your_jwt_secret_here
   ```

   - Replace `<username>`, `<password>`, and `<database_name>` with your PostgreSQL credentials.
   - Set `PORT` to your desired port number (default is 5000).
   - Replace `your_jwt_secret_here` with a strong, random secret key.

2. **Add `.env` to `.gitignore`:**

   Ensure the `.env` file is listed in your `.gitignore` to prevent it from being committed to version control:

   ```gitignore
   # .gitignore
   .env
   node_modules/
   ```

3. **Share Environment Variables Securely:**

   Share the `.env` file or the required environment variables securely with your team members using encrypted channels or a secure file-sharing service.

---

## **Running the Backend**

The application will automatically create the database (if it doesn't exist) and set up the necessary tables.

1. **Start the Server:**

   ```bash
   pnpm start
   ```

2. **Server Output:**

   You should see output similar to:

   ```
   Database "your_database_name" created.
   Database connected...
   Database synced and tables created
   Server is running on port 5000
   ```

---

## **Testing the API**

To test the API endpoints, you can use **Postman**, **Insomnia**, or **cURL**.

### **1. Register a New User**

**Endpoint:**

```http
POST /auth/signup
```

**Headers:**

- `Content-Type: application/json`

**Body:**

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

**Response:**

- **201 Created** on success.
- **400 Bad Request** if validation fails.
- **409 Conflict** if email already exists.

### **2. Login to Get Access Token**

**Endpoint:**

```http
POST /auth/login
```

**Headers:**

- `Content-Type: application/json`

**Body:**

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response:**

- **200 OK** with JWT token on success.
- **400 Bad Request** if validation fails.
- **404 Not Found** if user doesn't exist.
- **401 Unauthorized** if password is incorrect.

### **3. Create a New Folder**

**Endpoint:**

```http
POST /folders
```

**Headers:**

- `Content-Type: application/json`
- `Authorization: Bearer <your_jwt_token>`

**Body:**

```json
{
  "name": "My Folder"
}
```

**Response:**

- **201 Created** with folder details on success.
- **400 Bad Request** if validation fails.
- **401 Unauthorized** if token is missing or invalid.

### **4. Create a New Note**

**Endpoint:**

```http
POST /notes
```

**Headers:**

- `Content-Type: application/json`
- `Authorization: Bearer <your_jwt_token>`

**Body:**

```json
{
  "content": "This is a test note.",
  "folder_id": 1  // Optional: Assign to a folder
}
```

**Response:**

- **201 Created** with note details on success.
- **400 Bad Request** if validation fails.
- **401 Unauthorized** if token is missing or invalid.

### **5. Fetch All Notes**

**Endpoint:**

```http
GET /notes
```

**Headers:**

- `Authorization: Bearer <your_jwt_token>`

**Response:**

- **200 OK** with a list of notes.
- **401 Unauthorized** if token is missing or invalid.

---

## **Common Issues**

1. **Port Already in Use (`EADDRINUSE` Error):**

   - Ensure no other processes are running on the specified port.
   - Change the port in the `.env` file if needed.

2. **Database Connection Errors:**

   - Verify that PostgreSQL is running.
   - Check that `DATABASE_URL` in your `.env` file is correct.
   - Ensure your database credentials are accurate.

3. **Invalid JWT Secret:**

   - Ensure `JWT_SECRET` is set in your `.env` file and matches across all instances.

4. **Missing Dependencies:**

   - Run `pnpm install` to install all dependencies.

5. **Validation Errors:**

   - Review the API documentation and ensure your requests meet the required formats.

---
