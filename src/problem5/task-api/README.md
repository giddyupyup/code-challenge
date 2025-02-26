# Task API

A secure RESTful API for managing tasks with authentication, built with Express.js, TypeScript, and Prisma (PostgreSQL for dev, prod, and tests).

## Prerequisites

- Node.js (v16 or higher) for development
- Docker and Docker Compose for production (optional)
- PostgreSQL (v13 or higher) for local dev, prod, and tests
- npm

## PostgreSQL Setup (Dev/Prod/Tests)

### Local Development Setup

1. **Install PostgreSQL**:

   - On macOS: `brew install postgresql@15 && brew services start postgresql@15`
   - On Ubuntu: `sudo apt update && sudo apt install postgresql-15 && sudo service postgresql start`
   - On Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)

2. **Configure PostgreSQL**:

   - Access shell: `psql -U postgres`
   - Run:

     ```sql
     CREATE USER task_user WITH PASSWORD 'task_password' CREATEDB;
     CREATE DATABASE task_api WITH OWNER task_user;
     GRANT CONNECT ON DATABASE task_api TO task_user;
     \c task_api
     GRANT USAGE, CREATE ON SCHEMA public TO task_user;
     GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO task_user;
     GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO task_user;

     CREATE USER test_user WITH PASSWORD 'test_password' CREATEDB;
     CREATE DATABASE task_api_test WITH OWNER test_user;
     GRANT CONNECT ON DATABASE task_api_test TO test_user;
     \c task_api_test
     GRANT USAGE, CREATE ON SCHEMA public TO test_user;
     GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO test_user;
     GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO test_user;
     \q
     ```

   - Creates `task_user` for dev/prod and `test_user` for tests, with separate databases.

3. **Update Environment Files**:

   - For development, create `.env.development`:

     ```text
     DATABASE_URL=postgresql://task_user:task_password@localhost:5432/task_api?schema=public
     PORT=3000
     JWT_SECRET=your-secret-key-here
     REFRESH_TOKEN_SECRET=your-refresh-secret-here
     NODE_ENV=development
     ```

   - For production, create `.env.production`:

     ```text
     DATABASE_URL=postgresql://task_user:task_password@localhost:5432/task_api?schema=public
     PORT=3000
     JWT_SECRET=your-secure-secret-key
     REFRESH_TOKEN_SECRET=your-secure-refresh-secret
     NODE_ENV=production
     ```

   - For tests, create `.env.test`:

     ```text
     DATABASE_URL=postgresql://test_user:test_password@localhost:5432/task_api_test?schema=public
     PORT=3000
     JWT_SECRET=test-secret
     REFRESH_TOKEN_SECRET=test-refresh-secret
     NODE_ENV=test
     ```

   - Default `.env` (optional fallback)::

     ```text
     DATABASE_URL=postgresql://task_user:task_password@localhost:5432/task_api?schema=public
     PORT=3000
     JWT_SECRET=your-secret-key-here
     REFRESH_TOKEN_SECRET=your-refresh-secret-here
     ```

### Installation

1. Install dependencies

   ```bash
   npm install
   ```

## Development

1. Set up the database schema:

   ```bash
   npx prisma migrate dev --name init
   ```

2. Run in development mode with auto-restart:

   ```bash
   npm run dev
   ```

   - Loads `.env.development` via `-r dotenv-flow/config`.

3. Reset Development Database:

   ```bash
   npm run prisma:reset:dev
   ```

   - Drops and recreates the task_api database, clearing all data and reapplying migrations.

## Production Build

1. Build the application:

   ```bash
   npm run build
   ```

2. Run in production:

   ```bash
   npm start
   ```

   - Loads `.env.production` via `-r dotenv-flow/config`.

## Production Build

1. Build the application:

   ```bash
   npm run build
   ```

2. Run in production:

   ```bash
   npm start
   ```

   - Loads `.env.production` via `-r dotenv-flow/config`.

## Docker Deployment

### PostgreSQL in Docker

1. **Create .env.production for Docker**:

   - Place in `task-api/.env.production`

     ```text
     DATABASE_URL=postgresql://postgres:postgres@db:5432/task_api?schema=public
     PORT=3000
     JWT_SECRET=your-secure-secret-key
     REFRESH_TOKEN_SECRET=your-secure-refresh-secret
     NODE_ENV=production
     ```

2. **Customize PostgreSQL (optional)**:

   - Edit `docker-compose.yml`:

     ```yaml
     db:
     image: postgres:15
     environment:
       - POSTGRES_USER=your_user
       - POSTGRES_PASSWORD=your_password
       - POSTGRES_DB=task_api
     ```

   - Update DATABASE_URL in `.env.production` to match (e.g., `postgresql://your_user:your_password@db:5432/task_api?schema=public`).

3. **Build and run**:

   ```bash
   npm run docker:build
   npm run docker:run
   ```

   - Builds the Docker image and starts the containers (app and db).
   - The app runs on `http://localhost:3000`, and the database is initialized with migrations.

4. **Verify the Deployed Task API**:

   - Wait for the logs to show Server running on port 3000 and database connection success.
   - Open a new terminal and run:

     ```bash
     curl -v http://localhost:3000/api/tasks
     ```

   - **Expected Response**: A `401 Unauthorized` status with `{ "error": { "message": "Authentication token required", "status": 401 } }`, indicating the API is running and requires authentication.

5. **Access PostgreSQL in Docker (optional)**:

   - Get container ID: `docker ps`
   - Connect: `docker exec -it <container_id> psql -U postgres -d task_api`

## Testing with PostgreSQL

### Setup for Tests

1. **Ensure Test Database**:

   - Create `task_api_test` and `test_user` as per PostgreSQL setup.

2. Create a test .env file (`.env.test`):

   - Place it in the project root (e.g., `task-api/.env.test`)

     ```text
     DATABASE_URL=postgresql://test_user:test_password@localhost:5432/task_api_test?schema=public
     PORT=3000
     JWT_SECRET=test-secret
     REFRESH_TOKEN_SECRET=test-refresh-secret
     NODE_ENV=test
     ```

3. **Run Tests**:

   - All tests: `npm test` (applies migrations and runs unit + E2E tests)
   - Unit tests: `npm run test:unit`
   - E2E tests: `npm run test:e2e`
   - Note: Tests use `prisma migrate dev` to set up the test database, resetting data with `TRUNCATE TABLE` each run.

4. **Reset Test Database**:

   ```bash
   npm run prisma:reset:test
   ```

## Linting and Formatting

1. **Run ESLint**:

   ```bash
   npm run lint
   ```

   - Uses `.eslintrc` for configuration.

2. **Run Prettier**:

   ```bash
   npm run format
   ```

## API Endpoints

### Authentication

- POST `/api/auth/register`

  - Body: `{ "email": "string", "password": "string" }`

- POST `/api/auth/login`

  - Body: `{ "email": "string", "password": "string" }`
  - Returns:` { "accessToken": "string", "refreshToken": "string" }`

- POST `/api/auth/refresh-token`
  - Body: `{ "refreshToken": "string" }`
  - Returns: `{ "accessToken": "string" }`

### Tasks (Requires Authentication)

- Header: `Authorization: Bearer <accessToken>`

- POST /api/tasks

  - Body: `{ "title": "string", "description": "string", "status": "PENDING|COMPLETED", "priority": "LOW|MEDIUM|HIGH" }`

- GET `/api/tasks`

  - Query: `?status=PENDING&priority=HIGH&cursor=<uuid>&limit=10`
  - Returns: `{ tasks: Task[], total: number, nextCursor: string|null, hasNext: boolean }`
  - Note: Pagination uses `id > cursor` with ascending order, fetching tasks after the cursor.

- GET `/api/tasks/:id`

- PUT `/api/tasks/:id`

  - Body: `{ "title": "string", "description": "string", "status": "PENDING|COMPLETED", "priority": "LOW|MEDIUM|HIGH" }`

- DELETE `/api/tasks/:id`

## Postman Collection

Import attached [TaskAPI Collection](./TaskAPI.collections.json);

### Importing the Collection

- **Postman**:

  1.  Open Postman.
  2.  Click "Import" in the top left.
  3.  Select "Choose Files" and upload `TaskAPI.collections.json` from the project root (`task-api/`).
  4.  Click "Import" to load the collection.
  5.  Set variables (`accessToken`, `refreshToken`, `taskId`) manually after running `Login` and `Create Task`.

- **Insomnia**:
  1.  Open Insomnia.
  2.  Click the workspace dropdown (top left) and select "Import/Export".
  3.  Go to "Import Data" > "From File".
  4.  Select `TaskAPI.collections.json` from the project root (`task-api/`).
  5.  Click "Import" to load the collection.
  6.  Update variables in the environment settings after running `Login` and `Create Task`.

### Usage Notes

- Run `Register` and `Login` first to get `accessToken` and `refreshToken`.
- Use `accessToken` in the `Authorization` header for task-related requests.
- Update `taskId` after creating a task to test `GET`, `PUT`, and `DELETE` endpoints. For `GET /api/tasks`, use `cursor` to paginate forward from a known task ID.

## Production Notes

- Uses multi-stage Docker build for optimal image size
- Includes PostgreSQL service in docker-compose
- Applies production migrations automatically on startup
- Sets NODE_ENV to production
- Persists PostgreSQL data in a Docker volume
- Use strong JWT_SECRET and REFRESH_TOKEN_SECRET in production

## Troubleshooting

- Check PostgreSQL (dev/prod/test): `psql -U postgres -c "SELECT 1"`
- View migrations: `npx prisma migrate status`
- Reset database (dev): `npm run prisma:reset:dev` (drops and recreates `task_api`)
- Reset database (test): `npm run prisma:reset:test` (drops and recreates `task_api_test`)
- Test issues: Ensure PostgreSQL is running locally and both `task_api` and `task_api_test` databases exist. Run `npm run prisma:test:migrate` or `npm run prisma:reset:test` manually if needed.
- Prisma errors: Verify `DATABASE_URL` in `.env.test` matches your test database setup (`test_user`, `task_api_test`).
- `.env` not loading: Ensure `.env.test` exists in the root directory (e.g., `task-api/.env.test`).
- Postgres permission errors: Ensure `task_user` and `test_user` have `CONNECT` and `USAGE` privileges on their respective databases as per setup steps.
