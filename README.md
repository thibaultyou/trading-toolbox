# Trading Toolbox

Trading Toolbox is a comprehensive application designed for executing trading operations on exchanges. It leverages modern technologies to monitor trades, execute actions based on conditions, and implement trading strategies.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have Docker and Docker Compose installed on your machine. You'll also need a basic understanding of Docker concepts.

### Setting Up Environment Variables

1. A sample environment file `.env.example` is provided at the root of the application. Copy this file and rename it to `.env`:

```sh
cp .env.example .env
```

2. Open the `.env` file in a text editor. Adjust the environment variables to match your setup, if necessary. The default values should work for a development environment:

```plaintext
NODE_ENV=development
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=app
```

### Running with Docker Compose

To run the application using Docker Compose:

1. Navigate to the root of the application directory.
2. Run the following command to start all services defined in the `docker-compose.yml` file:

```sh
docker-compose up -d
```

### Running Locally for Development

If you wish to run the application locally for development:

1. Use the `docker-compose.dev.yml` file by running:

```sh
docker-compose -f docker-compose.dev.yml up -d
```

This command starts the development environment, ensuring that your application is running with live reload and other development features.

### Accessing the Application

Once the application is running, you can access its different components using the following URLs:

- **Client Application**: `http://localhost:1234`
- **API Server**: `http://localhost:1234/api`
- **Adminer (Database Management)**: `http://localhost:8080/adminer`
- **Swagger Documentation**: Access the Swagger documentation for the API by navigating to `http://localhost:1234/api/docs`

### Stopping the Application

To stop and remove all running containers, use the following Docker Compose command:

```sh
docker-compose down
```

## License

This project is licensed under the CC BY-NC-ND 4.0 License - see the [LICENSE.md](LICENSE.md) file for details.