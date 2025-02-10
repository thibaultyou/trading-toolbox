# Justfile
# ----------------------------------------------------------------------------
# NOTES:
# - This Justfile assumes you have:
#     - .env (for dev and prod)
#     - .env.test (for testing)
#
# - The Docker Compose files are assumed to be:
#     - docker-compose.yml         (for production)
#     - docker-compose.dev.yml     (for development, using volume "db-data-dev")
#     - docker-compose.test.yml    (for testing, using volume "db-data-test" and .env.test)
#
# - We use npx dotenv-cli so that when running commands in the "back" folder,
#   the environment variables from the project root are loaded.
# ----------------------------------------------------------------------------

# ---------------------------------------------
# Docker Compose Recipes
# ---------------------------------------------

# Start the development environment (loads .env).
dev:
	@echo "Starting development environment (using .env)..."
	docker-compose -f docker-compose.dev.yml up -d

# Start the production environment (loads .env).
prod:
	@echo "Starting production environment (using .env)..."
	docker-compose -f docker-compose.yml up -d

# Run end-to-end tests in an isolated test environment (uses .env.test).
test:
	@echo "Running end-to-end tests (using .env.test)..."
	docker-compose --env-file .env.test -f docker-compose.test.yml up --abort-on-container-exit
	docker-compose --env-file .env.test -f docker-compose.test.yml down -v

# Stop all Docker containers.
down:
	@echo "Stopping Docker containers..."
	docker-compose down

# Tail logs from running containers.
logs:
	@echo "Tailing Docker container logs..."
	docker-compose logs -f

# Rebuild Docker images for development.
rebuild:
	@echo "Rebuilding development Docker images..."
	docker-compose -f docker-compose.dev.yml build

# ---------------------------------------------
# Clean Up Commands
# ---------------------------------------------

# Clean up test database volumes (db-data-test).
clean-test:
	@echo "Cleaning up test database volumes..."
	-docker volume rm $(docker volume ls -q -f "name=db-data-test")

# Clean up development database volumes (db-data-dev).
clean-dev:
	@echo "Cleaning up development database volumes..."
	-docker volume rm $(docker volume ls -q -f "name=db-data-dev")

# ---------------------------------------------
# Local NPM Scripts (for developers)
# ---------------------------------------------

# Build the application.
build:
	@echo "Building the application..."
	cd back && npm run build

# Start the server in production mode.
# Uses dotenv-cli to load the root-level .env file.
start-prod:
	@echo "Starting server in production mode (using .env)..."
	cd back && npx dotenv-cli -e ../.env -- npm run start:prod

# Start the server in development mode (with live reloading).
# Uses dotenv-cli to load the root-level .env file.
start-dev:
	@echo "Starting server in development mode (using .env)..."
	cd back && npx dotenv-cli -e ../.env -- npm run start:dev

# Run unit tests (Jest).
test-unit:
	@echo "Running unit tests..."
	cd back && npm run test

# Run end-to-end tests locally (without Docker).
# Uses dotenv-cli to load the .env.test file.
test-e2e:
	@echo "Running end-to-end tests locally (using .env.test)..."
	cd back && npx dotenv-cli -e ../.env.test -- npm run test:e2e

# Run tests in watch mode.
test-watch:
	@echo "Running tests in watch mode..."
	cd back && npm run test:watch

# Run tests with coverage.
test-cov:
	@echo "Running test coverage..."
	cd back && npm run test:cov

# Lint the codebase.
lint:
	@echo "Running ESLint..."
	cd back && npm run lint

# Fix lint issues and format code (lint:fix + prettify).
format:
	@echo "Formatting code (lint:fix + prettify)..."
	cd back && npm run lint:fix && npm run prettify

# Update dependencies (using npm-check-updates).
update:
	@echo "Updating dependencies..."
	cd back && npm run update

# ---------------------------------------------
# Help
# ---------------------------------------------

help:
	@echo "Available commands:"
	@echo ""
	@echo "Docker Compose Contexts:"
	@echo "  just dev               - Start development environment (docker-compose.dev.yml using .env)"
	@echo "  just prod              - Start production environment (docker-compose.yml using .env)"
	@echo "  just test              - Run end-to-end tests (docker-compose.test.yml using .env.test)"
	@echo "  just down              - Stop all Docker containers"
	@echo "  just logs              - Tail logs from Docker containers"
	@echo "  just rebuild           - Rebuild development Docker images"
	@echo "  just clean-test        - Clean up test database volumes (db-data-test)"
	@echo "  just clean-dev         - Clean up development database volumes (db-data-dev)"
	@echo ""
	@echo "Local NPM Scripts (for developers):"
	@echo "  just build             - Build the application (npm run build)"
	@echo "  just start-prod        - Start server in production mode (loads .env from root)"
	@echo "  just start-dev         - Start server in development mode (loads .env from root)"
	@echo "  just test-unit         - Run unit tests (npm run test)"
	@echo "  just test-e2e          - Run end-to-end tests locally (loads .env.test from root)"
	@echo "  just test-watch        - Run tests in watch mode (npm run test:watch)"
	@echo "  just test-cov          - Run test coverage (npm run test:cov)"
	@echo "  just lint              - Run ESLint (npm run lint)"
	@echo "  just format            - Format code (npm run lint:fix + prettify)"
	@echo "  just update            - Update dependencies (npm run update)"
	@echo ""
	@echo "Use 'just help' to see this list."
