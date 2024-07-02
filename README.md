# Trading Toolbox

Trading Toolbox is a sophisticated application designed for executing trading operations on exchanges. It leverages cutting-edge technologies to monitor trades, execute actions based on predefined conditions, and apply advanced trading strategies.

**Note: The frontend component of this application is currently deactivated. Any files or directories prefixed with `_` are flagged for review.**

## 🚨 Important Notice

**WARNING: This project is in active development and NOT intended for public use or real trading.**

- **Experimental Status**: This application is a work in progress. Features may be incomplete, unstable, or subject to significant changes without notice.
- **Quality Concerns**: The codebase is largely untested and does not adhere to best practices. Expect bugs and performance issues.
- **Limited Functionality**: Critical features, including automated trading strategies, are still under development and not fully implemented.
- **Backend-Only**: The frontend is currently deactivated. Interaction is limited to API and other backend interfaces.
- **High Risk**: This software is provided "as is", without any warranties. Any use, especially for actual trading, could result in significant financial losses.
- **Code Review Needed**: Files and directories prefixed with `_` contain experimental or deprecated code requiring review.
- **Not Production-Ready**: This application is not suitable for deployment in a production environment or for handling real financial transactions.

By proceeding, you acknowledge these limitations and accept all associated risks. We strongly advise against using this software for any critical or financial operations at this stage.

## 🚀 Getting Started

Follow these instructions to set up the project on your local machine for development and testing purposes.

### Prerequisites

- Docker
- Docker Compose
- Basic understanding of Docker concepts

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/thibaultyou/tradingtoolbox.git
   cd tradingtoolbox
   ```

2. Set up environment variables:
   ```sh
   cp .env.example .env
   ```
   Edit `.env` file as needed. Default values are for development:
   ```
   NODE_ENV=development
   DATABASE_HOST=db
   DATABASE_PORT=5432
   DATABASE_USER=postgres
   DATABASE_PASSWORD=postgres
   DATABASE_NAME=app
   JWT_SECRET=some_secret
   ```

3. Launch the application:
   - For production:
     ```sh
     docker-compose up -d
     ```
   - For development (with live reloading):
     ```sh
     docker-compose -f docker-compose.dev.yml up -d
     ```

4. Access the application:
   - API Server: `http://localhost:1234/api`
   - Adminer (Database Management): `http://localhost:8080/adminer`
   - Swagger Documentation: `http://localhost:1234/api/docs`

5. To stop the application:
   ```sh
   docker-compose down
   ```

## 🧪 Testing

Currently, the project lacks a comprehensive test suite. This is a known issue and a priority for future development.

## 📜 License

This project is licensed under the CC BY-NC-ND 4.0 License. See [LICENSE.md](LICENSE.md) for details.

---

**Disclaimer**: This software is for educational and research purposes only. Do not use it for real trading or financial decisions without thorough testing and professional advice.