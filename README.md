# BSC Wallet Information Viewer

A simple web application that allows users to view Binance Smart Chain (BSC) wallet information, including native BNB balance and all token holdings.

## Features

- **Clean, Minimalist UI**: Simple and intuitive interface for viewing wallet information
- **Native BNB Balance**: Display the native BNB balance of any wallet address
- **Token Holdings**: View all tokens held in the wallet with their balances, symbols, and images
- **Real-time Data**: Fetch the latest wallet information directly from the BSC blockchain

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js with Express
- **Blockchain Connectivity**: Model Context Protocol (MCP) client for BSC interaction

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/bsc-wallet-info-viewer.git
   cd bsc-wallet-info-viewer
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   node web-server.js
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

1. Enter a valid BSC wallet address (starting with 0x) in the input field
2. Click the "Get Wallet Info" button
3. View the wallet's native BNB balance and all token holdings

## API Endpoints

- **GET /api/tools**: List all available tools
- **POST /api/tool/Get_Wallet_Info**: Get detailed wallet information
  - Body: `{ "address": "0x..." }`

## Project Structure

- `index.html`: Main HTML file with the UI
- `web-client.js`: Frontend JavaScript code
- `web-server.js`: Backend server code
- `bsc-stdio-mcp/`: MCP client for BSC integration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- BSC blockchain for providing the network infrastructure
- Moralis for token logo images 