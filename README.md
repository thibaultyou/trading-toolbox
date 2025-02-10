Here’s an updated **README.md** that includes instructions for handling API keys in the test environment. The main changes:

1. **Added** a section about using `.env.test.example` vs. a private `.env.test`.  
2. **Clarified** how to set the credentials for Bybit and Bitget test/sandbox usage.  
3. **Noted** the need to avoid committing real keys.

```md
# Trading Toolbox

A personal project that facilitates trading operations on supported exchanges. Its core capabilities include monitoring trades, executing actions based on predefined conditions, and experimenting with advanced trading strategies.

## ⚠️ Important Notice

**This project is for personal and educational purposes only. It is not production-ready or recommended for real-world trading.**  
- **Experimental**: Features may be incomplete and can change without prior notice.  
- **Unstable & Unverified**: The code is largely untested and may contain bugs.  
- **High Risk**: Using this software for actual trading could lead to financial loss.  
- **No Warranty**: Provided “as is” without any guarantees of performance or reliability.  

By using this project, you acknowledge these risks and understand it is **not** intended for critical or financial operations.

## ✨ Features

- **User Management** – Register and manage user accounts.  
- **Trading Accounts** – Connect and handle Bybit and Bitget accounts.  
- **Exchange Monitoring** – Monitor market data, orders, and positions in real time.  
- **Real-time Updates** – Get live wallet balances, order status, and pricing feeds.  
- **Strategy Framework** – Implement and test trading strategies (currently in development).

## 🚀 Getting Started

These instructions will help you set up the project on your local machine for development and testing.

### Prerequisites

- **[Docker & Docker Compose](https://docs.docker.com/get-docker/)**  
- [**Just**](https://github.com/casey/just) (a command runner)  
- Basic Docker and command-line knowledge

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/tradingtoolbox.git
   cd tradingtoolbox
   ```

2. **Configure Environment Variables**:
   - For development/production:
     ```bash
     cp .env.example .env
     ```
     Edit `.env` as needed.
   - For testing:
     ```bash
     cp .env.test.example .env.test
     ```
     - This `.env.test.example` has **placeholder** API keys for Bybit and Bitget. 
     - **Update** your local `.env.test` file with **actual** test/sandbox keys (never commit these real keys).  
     - **Ensure** `.env.test` is in your `.gitignore` so it remains private.

3. **Using the Justfile**:
   - The [Justfile](https://github.com/casey/just) provides recipes to manage Docker Compose contexts and local npm scripts (build, start, test, lint, etc.).
   - Common commands:
     - **Development**:
       ```bash
       just dev
       ```
     - **Production**:
       ```bash
       just prod
       ```
     - **End-to-End Tests**:
       ```bash
       just test
       ```
       This uses `.env.test` (or CI environment variables) so you can run e2e tests with real exchange credentials (preferably on Bybit and/or Bitget testnet).
     - **Local Server (Dev)**:
       ```bash
       just start-dev
       ```
     - **Local Server (Prod)**:
       ```bash
       just start-prod
       ```
     - **Clean Database Volumes**:
       ```bash
       # For tests:
       just clean-test
       # For dev:
       just clean-dev
       ```
     - **Help**:
       ```bash
       just help
       ```
   > **Note**: Certain commands load environment variables using `npx dotenv-cli -e ../.env --` (or `-e ../.env.test --`) from the project root.  

4. **Launch via Docker (Optional)**:
   - **Production**:
     ```bash
     just prod
     ```
   - **Development** (with live reloading):
     ```bash
     just dev
     ```

5. **Access the Application**:
   - **API Server**: <http://localhost:1234/api>  
   - **Adminer (Database Manager)**:  
     - Dev: <http://localhost:6000/adminer>  
     - Test: <http://localhost:6001/adminer>  
   - **Swagger Docs**: <http://localhost:1234/api/docs>

6. **Stop the Application**:
   ```bash
   just down
   ```

## 🔧 Using the API

After setup, you can interact with the Trading Toolbox using its REST API.

### Accessing the API

1. **API Client (e.g., Postman, curl)**:
   - **Base URL**: `http://localhost:1234/api`
   - Use the appropriate HTTP methods (POST, GET, PUT, PATCH, DELETE).
   - Set `Content-Type: application/json` for JSON request bodies.
   - For authenticated endpoints, include a valid JWT in the `Authorization` header:
     ```
     Authorization: Bearer YOUR_JWT_TOKEN
     ```

2. **Swagger UI**:
   - Access the interactive docs at <http://localhost:1234/api/docs>.
   - Use **Try it out** to test API endpoints from your browser.
   - Click **Authorize** to provide a JWT for secured endpoints.

### Basic Workflow

1. **Register a User**:
   - **Endpoint**: `POST /users/register`
   - Example payload:
     ```json
     {
       "username": "myUser",
       "password": "myPassword"
     }
     ```

2. **Log In to Get a JWT**:
   - **Endpoint**: `POST /users/login`
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

Refer to the [Swagger documentation](http://localhost:1234/api/docs) for complete request/response formats.

## 🧪 Testing

Comprehensive testing includes both unit and end-to-end tests.

- **Local Testing**:
  - **Unit Tests**:
    ```bash
    just test-unit
    ```
  - **End-to-End Tests** (runs in an isolated test environment using `.env.test`):
    ```bash
    just test
    ```
    - Make sure `.env.test` is present and has test/sandbox API keys for Bybit/Bitget.
  - **Watch Mode** or **Coverage**:
    ```bash
    just test-watch
    just test-cov
    ```

## 📜 License

This project is licensed under the **CC BY-NC-ND 4.0 License**. See [LICENSE.md](LICENSE.md) for more information.

---

**Disclaimer**: This software is for personal, educational, and research purposes only. **Do not** use it for real trading or financial decisions without extensive testing and professional advice.
```