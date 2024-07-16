# Trading Toolbox

Trading Toolbox is a personal project designed for executing trading operations on exchanges. It aims to monitor trades, execute actions based on predefined conditions, and apply advanced trading strategies.

## 🚨 Important Notice

**WARNING: This project is a personal endeavor, in active development, and NOT intended for public use or real trading.**

- **Personal Use Only**: This application is designed for personal experimentation and learning. It is not intended for use by others or in any production environment.
- **Experimental Status**: This project is a work in progress. Features may be incomplete, unstable, or subject to significant changes without notice.
- **Quality Concerns**: The codebase is largely untested and may not adhere to best practices. Expect bugs and performance issues.
- **High Risk**: This software is provided "as is", without any warranties. Any use, especially for actual trading, could result in significant financial losses.
- **Not Production-Ready**: This application is not suitable for deployment in a production environment or for handling real financial transactions.

By proceeding, you acknowledge these limitations and accept all associated risks. The creator strongly advises against using this software for any critical or financial operations at this stage.

## 🎯 Features

The Trading Toolbox currently supports the following features:

- **User Management**: Create and manage user accounts.
- **Trading Accounts Management**: Link and manage Bybit trading accounts to user profiles.
- **Exchange Monitoring**: Periodically check for exchange items such as markets, orders, and positions.
- **Real-time Updates**: Provide real-time updates for wallets, executed orders, and ticker price fluctuations.
- **Trading Strategies**: Provide a framework to implement and reference trading strategies based on certain conditions and settings (Work in Progress).

## 🚀 Getting Started

Follow these instructions to set up the project on your local machine for development and testing purposes.

### Prerequisites

- Docker
- Docker Compose
- Basic understanding of Docker concepts

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/tradingtoolbox.git
   cd tradingtoolbox
   ```

2. **Set up environment variables:**
   ```sh
   cp .env.example .env
   ```
   Edit the `.env` file as needed.

3. **Launch the application:**
   - For production:
     ```sh
     docker-compose up -d
     ```
   - For development (with live reloading):
     ```sh
     docker-compose -f docker-compose.dev.yml up -d
     ```

4. **Access the application:**
   - API Server: `http://localhost:1234/api`
   - Adminer (Database Management): `http://localhost:8080/adminer`
   - Swagger Documentation: `http://localhost:1234/api/docs`

5. **Stop the application:**
   ```sh
   docker-compose down
   ```

## 🔧 Using the API

After setting up the project, you can interact with the Trading Toolbox using its API. Here's a guide to get you started:

### Accessing the API

1. **API Client (e.g., Postman)**:
   - Base URL: `http://localhost:1234/api`
   - Use POST, GET, PUT, PATCH, DELETE methods as required by each endpoint
   - Set `Content-Type: application/json` header for requests with a body
   - For authenticated endpoints, include the JWT token in the `Authorization` header:
     `Authorization: Bearer YOUR_JWT_TOKEN`

2. **Swagger UI**:
   - Access the interactive API documentation at `http://localhost:1234/api/docs`
   - Click on an endpoint to expand its details
   - Use the "Try it out" button to send requests directly from the browser
   - For authenticated endpoints, use the "Authorize" button to enter your JWT token

### Basic Workflow

1. Create a user account:
   - Endpoint: POST `/users/register`
   - Provide email and password

2. Log in to get an authentication token:
   - Endpoint: POST `/users/login`
   - Use the received JWT token for subsequent requests

3. Configure a trading account:
   - Endpoint: POST `/accounts`
   - Link your Bybit account by providing API key and secret

4. Choose your next steps:

   Option A: Use exchange features
   - Examples of available endpoints:
     - Fetch markets: GET `/markets/accounts/{accountId}`
     - Create an order: POST `/orders/accounts/{accountId}/orders`
     - Fetch positions: GET `/positions/accounts/{accountId}/positions`

   Option B: Set up trading strategies
   - Create a strategy: POST `/strategies`
   - Fetch strategies: GET `/strategies`
   - Update a strategy: PATCH `/strategies/{id}`

Refer to the Swagger UI documentation for detailed information on request/response formats for each endpoint.

## 🧪 Testing

Currently, the project lacks a comprehensive test suite. This is a known issue and a priority for future development.

## 📜 License

This project is licensed under the CC BY-NC-ND 4.0 License. See [LICENSE.md](LICENSE.md) for details.

---

**Disclaimer**: This software is for personal educational and research purposes only. Do not use it for real trading or financial decisions without thorough testing and professional advice.