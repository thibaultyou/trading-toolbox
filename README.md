# Trading Toolbox

A personal tool to manage trading operations on supported exchanges. Key features include monitoring trades, executing actions based on conditions, and testing trading strategies.

## ⚠️ Important Notice

This project is for **personal and educational use only**.  
- **Not production-ready**: Code may change or be unstable.  
- **Risk**: Using this for real trading could lead to financial loss.  
- **No Warranty**: No guarantees on performance or reliability.

By using this project, you accept these risks.

## ✨ Features

- **User Management**: Register and manage users.  
- **Trading Accounts**: Connect to Bybit and Bitget accounts.  
- **Market Monitoring**: View live data, orders, and positions.  
- **Real-time Updates**: Get wallet balances, order status, etc.  
- **Strategy Framework**: Develop and test trading strategies (in progress).

## 🚀 Getting Started

### Prerequisites

- **[Docker](https://docs.docker.com/get-docker/)**
- **[Just](https://github.com/casey/just)**
- Basic command-line knowledge

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/thibaultyou/trading-toolbox.git
   cd trading-toolbox
   ```

2. **Configure Environment Variables**:
   - Copy the appropriate `.env` file for your environment:

     ```bash
     cp .env.prod.example .env.prod
     cp .env.dev.example .env.dev
     cp .env.test.example .env.test
     ```

   - **Edit the `.env` files** as needed for your setup. The `.env.test` file contains placeholder API keys for Bybit/Bitget; **replace these with your actual sandbox keys**.

   - **Proxy Settings**: This is also where you'll configure your proxy settings. In the `.env` file, you can adjust the following values:

     ```env
     # Proxy Settings
     PROXY_PORT=2001
     SERVER_PORT=4001
     ADMINER_PORT=6001
     PROXY_HOST=localhost
     ```

   These settings determine the ports and host used by the proxy server and the associated services.

3. **Using the Justfile**:
   The Justfile manages Docker Compose contexts and npm scripts.

   Common commands:
   - **Start production**: `just prod`
   - **Start development**: `just dev`
   - **Run tests**: `just test`
   - **Clean up**: `just clean-prod`, `just clean-dev`, `just clean-test`
   - **Help**: `just help` (lists all available commands)

4. **Monitoring the running Application**:

   ```bash
   just logs
   ```

5. **Stop the Application**:

   ```bash
   just down
   ```

## 🔧 Using the API

After setup, interact with the API using the following options:

1. **Swagger UI**: Visit `http://<your_proxy_host>:<proxy_port>/api/docs` for interactive documentation and API testing.

2. **API Client (e.g., Postman, curl)**:
   - **Base URL**: `http://<your_proxy_host>:<proxy_port>/api`
   - For authenticated endpoints, provide the JWT token in the Authorization header:  
     `Authorization: Bearer YOUR_JWT_TOKEN`

### Basic Workflow

1. **Register a User**:
   - **Endpoint**: `POST /auth/register`
   - Example payload:
     ```json
     {
       "username": "myUser",
       "password": "myPassword"
     }
     ```

2. **Log In to Get a JWT**:
   - **Endpoint**: `POST /auth/login`
   - Use the returned JWT in subsequent requests.

3. **Create a Trading Account**:
   - **Endpoint**: `POST /accounts`
   - Provide details like account name, API key, API secret, and exchange type (e.g. `bybit` or `bitget`).

4. **Next Steps**:
   - **Fetching Markets**: `GET /markets/accounts/{accountId}`
   - **Creating an Order**: `POST /orders/accounts/{accountId}/orders`
   - **Fetching Positions**: `GET /positions/accounts/{accountId}/positions`
   - **Setting Up Strategies**:
     - `POST /strategies`
     - `GET /strategies`
     - `PATCH /strategies/{id}`

Refer to the Swagger UI for more details.

## 🧪 Testing

Comprehensive tests are available:

- **Unit Tests**: `just test-unit`
- **End-to-End Tests**: `just test`
- **Test in Watch Mode**: `just test-watch`
- **Test Coverage**: `just test-cov`

Ensure `.env.test` is configured with valid test credentials.

## 📜 License

This project is licensed under the **CC BY-NC-ND 4.0 License**. See [LICENSE.md](LICENSE.md) for more information.

---

**Disclaimer**: This software is for personal, educational, and research purposes only. **Do not** use it for real trading or financial decisions without extensive testing and professional advice.