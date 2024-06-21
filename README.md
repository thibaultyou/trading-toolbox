# Trading Toolbox

Trading Toolbox is a comprehensive application designed for executing trading operations on exchanges. It leverages state-of-the-art technologies to monitor trades, execute actions based on predefined conditions, and apply sophisticated trading strategies. **The frontend part of this application is currently deactivated, and any files or directories starting with a `_` prefix are flagged for review.**

## 🚨 Important Notice

This project is a work in progress. It is not intended for public use, and functionality may be incomplete or unstable. Use at your own risk.

Quality is not the best: The code is mostly untested, and best practices are not followed.
Automated strategies are not yet implemented: Key features like automated trading strategies are still under development.

## Getting Started

These instructions will guide you through setting up the project on your local machine for both development and production purposes.

### Prerequisites

Before starting, ensure Docker and Docker Compose are installed on your machine. You should also have a basic understanding of Docker concepts.

### Cloning the Repository

First, you need to clone the GitHub repository to get a copy of the project on your local machine. Use the following command:

```sh
git clone https://github.com/thibaultyou/tradingtoolbox.git
```

After cloning, navigate into the project directory:

```sh
cd tradingtoolbox
```

### Setting Up Environment Variables

1. Inside the project's root directory, you will find a sample environment file named `.env.example`. Copy this file and rename it to `.env`:

```sh
cp .env.example .env
```

2. Open the `.env` file with a text editor and adjust the environment variables according to your setup as needed. The default values are intended for a development environment:

```plaintext
NODE_ENV=development
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=app
```

### Running with Docker Compose for Production

To deploy the application in a production environment using Docker Compose:

1. Ensure you are in the root directory of the cloned repository.
2. Execute the following command to start all services defined in the `docker-compose.yml` file:

```sh
docker-compose up -d
```

This initiates the application in production mode, with settings optimized for performance and security.

### Running Locally for Development

For development purposes, where features like live reloading are beneficial:

1. Use the development-specific `docker-compose.dev.yml` file by executing:

```sh
docker-compose -f docker-compose.dev.yml up -d
```

This command launches the application in a development environment, enabling developer-friendly features.

### Accessing the Application Locally

After the application is running, you can access its various components locally using the URLs below:

- **API Server**: Available at `http://localhost:1234/api`
- **Adminer (Database Management)**: Visit `http://localhost:8080/adminer`
- **Swagger Documentation**: API documentation can be found by navigating to `http://localhost:1234/api/docs`

Please note, with the frontend part deactivated, direct access to a client application through the previously mentioned URL is not available. Ensure to interact with the application through the API and other available interfaces.

### Stopping the Application

To halt and remove all containers associated with the application, utilize the Docker Compose command:

```sh
docker-compose down
```

## License

This project is licensed under the CC BY-NC-ND 4.0 License. For detailed information, refer to the [LICENSE.md](LICENSE.md) file.