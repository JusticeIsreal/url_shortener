A comprehensive README.md for URL shortener project.

```markdown:README.md
# URL Shortener API v1

A robust URL shortening service built with Fastify, PostgreSQL, and TypeScript. This service allows users to create, manage, and track shortened URLs with features like expiration dates, click tracking, and URL archiving.

## 🚀 Features

- URL shortening with custom or auto-generated slugs
- URL expiration management
- Click tracking for each shortened URL
- Authentication system for admin users
- Automatic archiving of expired URLs
- RESTful API endpoints
- CORS enabled
- JWT-based authentication
- Static file serving

## 🛠 Tech Stack

- **Framework**: Fastify
- **Database**: PostgreSQL
- **Language**: TypeScript
- **Authentication**: JWT (@fastify/jwt)
- **Scheduling**: node-cron
- **UUID Generation**: uuid

## 📝 API Endpoints

### URL Management Routes (`/api/v1`)

#### Active URLs
- `POST /shorten` - Create a new shortened URL
  - Body: `{ slug?: string, original_url: string, expires_at?: string }`
  - Authentication required

- `GET /urls` - Get all active URLs (paginated)
  - Query params: `offset`, `limit`
  - Authentication required

- `GET /details/:slug` - Get details of a specific URL
  - Authentication required

- `DELETE /delete/:slug` - Delete a URL
  - Authentication required

- `PUT /update/:slug` - Update a URL's destination or expiration
  - Body: `{ original_url?: string, expires_at?: string }`
  - Authentication required

#### URL Redirection
- `GET /:slug` - Redirect to original URL
  - Public route (no authentication required)
  - Increments click count

#### Expired URLs
- `GET /expired` - Get all expired/archived URLs
  - Authentication required

- `POST /purge` - Manually trigger expired URL archiving
  - Authentication required

### Authentication Routes (`/api/v1`)

- `POST /register` - Register a new admin user
  - Body: `{ username: string, password: string }`

- `POST /login` - Login for admin users
  - Body: `{ username: string, password: string }`
  - Returns JWT token

- `DELETE /delete-user` - Delete an admin user
  - Authentication required

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. All routes except the following require authentication:
- URL redirection (`GET /:slug`)
- Login route (`POST /api/v1/login`)

To authenticate requests:
1. Login to receive a JWT token
2. Include the token in subsequent requests using the `Authorization` header:
```

````

## ⚙️ Automated Tasks

The system includes an automated task that runs periodically to manage expired URLs:

- **URL Archiving**: A cron job runs every minute (configurable) to:
- Check for expired URLs
- Move expired URLs to an archive table
- Maintain a clean active URLs table

## 💾 Database Schema

### URLs Table
```sql
CREATE TABLE urls (
  id UUID PRIMARY KEY,
  slug VARCHAR(255) UNIQUE,
  original_url TEXT,
  created_at TIMESTAMP,
  expires_at TIMESTAMP,
  click_count INTEGER DEFAULT 0
);
```

### Archived URLs Table
```sql
CREATE TABLE archived_urls (
  id UUID PRIMARY KEY,
  slug VARCHAR(255),
  original_url TEXT,
  created_at TIMESTAMP,
  expires_at TIMESTAMP,
  click_count INTEGER DEFAULT 0,
  archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  username VARCHAR(255) UNIQUE,
  password TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Migrations Table
```sql
CREATE TABLE migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🗄️ Database Migrations

The project uses an automated migration system to manage database schema changes. Migrations are located in the `migrations/` directory and run automatically on application startup.

### Migration Files
1. `20240315000000_create_tables.sql` - Creates initial database tables
2. `20240315000001_add_slug_index.sql` - Adds performance indexes for slug lookups
3. `20240315000002_add_url_indexes.sql` - Adds indexes for URL-related queries

### Database Optimizations
The following indexes are created for improved query performance:
```sql
-- Slug indexes
CREATE INDEX idx_urls_slug ON urls(slug);
CREATE INDEX idx_archived_urls_slug ON archived_urls(slug);

-- URL indexes
CREATE INDEX idx_urls_original_url ON urls(original_url);
CREATE INDEX idx_archived_urls_original_url ON archived_urls(original_url);

-- Composite indexes
CREATE INDEX idx_urls_slug_url ON urls(slug, original_url);
CREATE INDEX idx_archived_urls_slug_url ON archived_urls(slug, original_url);
```

## 🚦 Environment Variables

Create a `.env` file with the following variables:

```env
DB_URL=postgresql://username:password@localhost:5432/database
PORT=3000
```

## 🏃‍♂️ Running the Project

1. Install dependencies:

```bash
yarn install
```

2. Set up your PostgreSQL database and update the DB_URL in `.env`

3. Start the server:

```bash
yarn start
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing for admin users
- Protected routes with middleware
- CORS enabled for cross-origin requests
- Environment variable management

## 📊 URL Analytics

Each shortened URL tracks:

- Total click count
- Creation date
- Expiration date (if set)
- Current status (active/archived)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
````
