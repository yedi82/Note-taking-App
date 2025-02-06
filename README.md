# Collaborative Note-Taking Web App

## Project Overview

This project is a group effort aimed at developing a collaborative note-taking web application. The app allows users to create, share, and edit notes in real-time using markdown. It features user authentication, real-time collaboration via WebSockets, and a modern UI designed with React.js and Tailwind CSS. The project employs a PostgreSQL database and Node.js backend, using either Express, tRPC, or GraphQL for API implementation. The app is designed to support multiple users editing notes concurrently and provides a range of functionalities to manage notes efficiently.

## Features pnpm prisma migrate dev

- **User Authentication**: Secure login and registration functionality with session management.
- **Real-time Collaboration**: Notes are editable by multiple users simultaneously using WebSockets.
- **Markdown Support**: Notes are written and displayed in markdown, with live preview using Marked.
- **CRUD Operations for Notes**: Users can create, view, update, and delete notes.
- **Profile Management**: Users can edit profile details, including avatars, and delete accounts.
- **Search & Filter**: Search notes by title, filter notes by category, and sort them by last edited time.
- **User Interface**: Built with React.js and styled with Tailwind CSS for a responsive and clean design.

## Technologies Used(TechStack)

- **Frontend**:
  - React.js for the user interface.
  - Tailwind CSS for styling.
  - Marked for markdown rendering.

- **Backend**:
  - Node.js with Express, tRPC, or GraphQL for the API.
  - WebSockets for real-time collaboration.

- **Database**:
  - PostgreSQL database, normalized to BCNF.

- **Authentication**:
  - Custom authentication implementation, with secure password handling (hashed and salted).
  - implemented passkeys as an additional feature.

## Project Structure

bash

```
note-taking-app

 backend
│   ├── node_modules
│   └── src
│       ├── config		# configuration
│       ├── controllers	# Route controllers for handling requests
│       ├── middleware		# Middleware (auth, validation, error handling)
│       ├── models		# Database modles
│       ├── routes		# API routes
│       ├── uploads		# For storing user avatars
│       └── utils		# Utility functions
├── documentation
│   └── AI Prompts		# Documentation of AI prompts used in the project
│   └── resources		  # Documentation of the resources used in the project
├── frontend
│   ├── node_modules
│   └── src
│       ├── components		# Reusable UI components
│       ├── pages		# Main page components
│       └── resources		# images and icons
├── node_modules
├── .env                       # Environment variables
├── .gitignore                 # Files to ignore in Git
└── README.md                  # Project overview, setup, and instructions
```

## Authors

1. **Sinconor** (Student ID: 25927442)
2. **Daniel** (Student ID: 25860933)
3. **anna** (Student ID: 26140306)
4. **Yedi** (Student ID: 26259877)
5. **Pontsho** (Student ID: 25303384)

Each team member has contributed to various aspects of the project including design, development, and testing.

## Setup and Installation

### Prerequisites

- **Node.js**: Ensure you have Node.js installed on your machine (we recommend using the latest LTS version).
- **PostgreSQL**: A PostgreSQL database should be set up and running.
- **pnpm or npm**: We recommend using `pnpm` for package management, but `npm` is also supported.

### Steps

1. **lone the repository**:

```bash
   git clone https://gitlab.com/your-repository-link.git
   cd your-repository
```

2. **Install dependencies**:

To run this project, you need to have Node.js and pnpm installed on your machine. You can download and install Node.js from [here](https://nodejs.org/en/download/). npm is installed with Node.js.

Firstly check if it's installed:

```bash
node -v
pnpm -v
```

if not installed:

```bash
sudo apt update
sudo apt install nodejs pnpm
```

2.1 ***Socket dependencies***

```bash
cd backend
pnpm install socket.io-client
```

```bash
cd frontend
pnpm install socket.io-client
```

3. **Run the project**:

```bash
./start-app.sh

OR

cd backend
pnpm start
cd ../frontend
pnpm start
```



