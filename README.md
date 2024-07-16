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

## 🧪 Testing

Currently, the project lacks a comprehensive test suite. This is a known issue and a priority for future development.

## 📜 License

This project is licensed under the CC BY-NC-ND 4.0 License. See [LICENSE.md](LICENSE.md) for details.

---

**Disclaimer**: This software is for personal educational and research purposes only. Do not use it for real trading or financial decisions without thorough testing and professional advice.