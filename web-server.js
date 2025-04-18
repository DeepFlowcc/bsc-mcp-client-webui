import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());
app.use(express.static(__dirname));

// Initialize MCP client
let client;
let transport;

async function initMcpClient() {
  try {
    // Create a client transport that spawns the server.js process
    transport = new StdioClientTransport({
      command: "node",
      args: [resolve(__dirname, "bsc-stdio-mcp/index.js")]
    });

    // Create an MCP client
    client = new Client({
      name: "mcp-web-client",
      version: "1.0.0"
    });

    // Connect to the server
    await client.connect(transport);
    console.log("✅ Connected to MCP server");
    return true;
  } catch (error) {
    console.error("❌ Failed to initialize MCP client:", error);
    return false;
  }
}

// Initialize MCP client on startup
let mcpInitialized = false;
initMcpClient()
  .then(result => {
    mcpInitialized = result;
    if (!result) {
      console.warn("⚠️ MCP client initialization failed, some features may not work");
    }
  })
  .catch(err => {
    console.error("❌ Fatal error during MCP client initialization:", err);
  });

// Status route for healthcheck
app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    mcpConnected: mcpInitialized
  });
});

// API routes
app.get('/api/tools', async (req, res) => {
  if (!mcpInitialized) {
    return res.status(503).json({ error: 'MCP server not connected' });
  }

  try {
    const tools = await client.listTools();
    res.json(tools);
  } catch (error) {
    console.error('Error listing tools:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tool/Get_Wallet_Info', async (req, res) => {
  if (!mcpInitialized) {
    return res.status(503).json({ error: 'MCP server not connected' });
  }

  try {
    const { address } = req.body;
    if (!address || !address.startsWith('0x')) {
      return res.status(400).json({ error: 'Invalid BSC wallet address' });
    }

    // Get wallet balance
    const balanceResult = await client.callTool({
      name: "Get_Wallet_Info",
      arguments: { address }
    });

    res.json(balanceResult);
  } catch (error) {
    console.error('Error getting wallet info:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║   🚀 MCP Web Demo Server is running              ║
║                                                  ║
║   🌐 Web interface: http://localhost:${PORT}      ║
║                                                  ║
║   ℹ️  Use the web interface to interact with     ║
║      the MCP server and its tools/resources      ║
║                                                  ║
╚══════════════════════════════════════════════════╝
  `);
});

// Handle process termination
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  if (transport) {
    await transport.close();
  }
  process.exit(0);
}); 
