
# Ninegeek Forum

Ninegeek Forum is a simple web-based forum designed for 9-ball pool enthusiasts to create threads, comment, and engage in discussions.

## Features

- User login system

- Create, view, and delete forum threads

- Comment on existing threads

- Persistent data storage with PostgreSQL

- REST API powered by Go (Golang)

- Interactive frontend built with React and Bootstrap

## Prerequisites

Ensure you have the following installed:

- Node.js (v16 or higher)

- Go (v1.17 or higher)

- PostgreSQL (v14 or higher)

- Git

## Setup Instructions

### Clone the Repository
```
git clone https://github.com/lilduckling/ninegeek_forum

cd ninegeek-forum
```

### Backend Setup (Go)

1. Navigate to the backend directory:

```
cd backend
```

2. Install Go dependencies:
```
go mod tidy
```

3. Set up environment variables: create a .env file

4. Add the following content to .env:
```
DB_USER=ninegeek_user
DB_PASSWORD=yourpassword 
DB_NAME=ninegeek_db
DB_HOST=localhost
DB_PORT=yourportnumber
```
5. Start the backend server:
```
go run main.go
```

The server should now be running at [http://localhost:8080](http://localhost:8080).

### Frontend Setup (React)

1. Navigate to the frontend directory:
```
cd frontend
```

2. Install dependencies:
```
npm install
```

3. Start the development server:
```
npm start
```

The React app should now be running at [http://localhost:3000](http://localhost:3000).

### Database Setup (PostgreSQL)

1. Open pgAdmin or connect via the terminal.

2. Create a new PostgreSQL database:
```
CREATE DATABASE ninegeek_db;
```
3. Create a new PostgreSQL user with a password:
```
CREATE USER ninegeek_user WITH PASSWORD 'yourpassword';
```
4. Grant privileges to the user:
```
GRANT ALL PRIVILEGES ON DATABASE ninegeek_db TO ninegeek_user;
```
5. Connect to the database and create tables:
```
\c ninegeek_db;

CREATE TABLE threads (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    thread_id INT REFERENCES threads(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author TEXT NOT NULL
);
```

## Troubleshooting

### Backend Issues:

- Ensure the .env file contains correct PostgreSQL credentials.

- Make sure PostgreSQL is running with the correct database name and user.

### Frontend Issues:

- If you encounter module errors, run:
```
npm install
```

- Ensure the backend is running at http://localhost:8080.

### Database Issues:

- If you get permission errors, ensure the user has privileges with:
```
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ninegeek_user;
```

## Contributing

Contributions are welcome! Please follow these steps:

- Fork the repository.

- Create a new branch 

- Commit changes 

- Push the branch 

- Open a pull request

