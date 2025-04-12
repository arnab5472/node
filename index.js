const fs = require('fs');
const http = require('http');
const readline = require('readline');
const MinecraftBot = require('./lib/bot');
const CommandHandler = require('./lib/commandHandler');
const Logger = require('./lib/logger');
const WebInterface = require('./web_interface');

// Create logger
const logger = new Logger();

// Load configuration
let config;
try {
  const configFile = fs.readFileSync('./config.json', 'utf8');
  config = JSON.parse(configFile);
  logger.info('Configuration loaded successfully');
} catch (error) {
  logger.error('Failed to load configuration file:', error.message);
  logger.info('Creating default configuration file...');
  
  // Create default configuration
  config = {
    host: 'localhost',
    port: 25565,
    username: 'AFKBot',
    version: '1.19.3',
    position: {
      x: 0,
      y: 64,
      z: 0
    },
    afkOptions: {
      lookInterval: 30000,  // 30 seconds
      moveInterval: 60000,  // 60 seconds
      jumpInterval: 120000, // 120 seconds
      reconnectDelay: 5000, // 5 seconds
    }
  };
  
  try {
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
    logger.info('Default configuration file created');
  } catch (writeError) {
    logger.error('Failed to create default configuration file:', writeError.message);
    process.exit(1);
  }
}

// Create the AFK bot instance
const bot = new MinecraftBot(config, logger);
const commandHandler = new CommandHandler(bot, logger);

// Auto-connect to the server when started
bot.connect();

// Create readline interface for commands
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'AFK Bot > '
});

// Handle user commands
rl.on('line', (input) => {
  const trimmedInput = input.trim();
  
  if (trimmedInput) {
    commandHandler.handleCommand(trimmedInput);
  }
  
  rl.prompt();
}).on('close', () => {
  logger.info('Exiting AFK Bot...');
  bot.disconnect();
  process.exit(0);
});

// Display available commands
logger.info('=== Minecraft AFK Bot ===');
logger.info('Available commands:');
Object.keys(commandHandler.commands).forEach(cmd => {
  logger.info(`  ${cmd} - ${commandHandler.commands[cmd].description}`);
});

rl.prompt();

// Handle process termination
process.on('SIGINT', () => {
  logger.info('Received SIGINT. Disconnecting and exiting...');
  bot.disconnect();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM. Disconnecting and exiting...');
  bot.disconnect();
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err);
  logger.info('Bot will attempt to continue running...');
});

// Create HTTP server for uptime monitoring (after bot is initialized)
const server = http.createServer((req, res) => {
  // Get real-time bot status
  let botStatus = 'Initializing';
  let statusColor = 'warning';
  let connectionStatus = 'Not yet connected';
  let afkStatus = 'Not active';
  
  // Get bot status if available
  if (bot && typeof bot.getStatus === 'function') {
    try {
      const status = bot.getStatus();
      botStatus = status.connected ? 'ONLINE' : 'CONNECTING';
      statusColor = status.connected ? 'online' : 'connecting';
      connectionStatus = status.connected ? `Connected to ${status.server}` : 'Attempting to connect...';
      afkStatus = status.afkActive ? 'Active' : 'Inactive';
    } catch (err) {
      logger.warn('Error getting bot status for web interface:', err.message);
    }
  }
  
  // Current server start time
  const startTime = new Date().toLocaleString();
  
  // Generate a simple HTML status page
  const statusPage = `
<!DOCTYPE html>
<html>
<head>
  <title>Minecraft AFK Bot Status</title>
  <meta http-equiv="refresh" content="30">
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    .status { padding: 15px; border-radius: 5px; margin: 20px 0; }
    .online { background-color: #d4edda; color: #155724; }
    .connecting { background-color: #fff3cd; color: #856404; }
    .offline { background-color: #f8d7da; color: #721c24; }
    .info { background-color: #f8f9fa; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
    .footer { margin-top: 30px; font-size: 0.8em; color: #6c757d; }
    .features { margin-top: 20px; }
    .features ul { padding-left: 20px; }
  </style>
</head>
<body>
  <h1>Minecraft AFK Bot Status Monitor</h1>
  
  <div class="status ${statusColor}">
    <h2>✅ Bot is ${botStatus}</h2>
    <p>Last checked: ${new Date().toLocaleString()}</p>
    <p>Connection: ${connectionStatus}</p>
    <p>AFK Mode: ${afkStatus}</p>
  </div>
  
  <div class="info">
    <h3>Bot Information:</h3>
    <p><strong>Server:</strong> ${config?.host || 'Not connected'}</p>
    <p><strong>Username:</strong> ${config?.username || 'Not configured'}</p>
    <p><strong>Version:</strong> ${config?.version || 'Unknown'}</p>
    <p><strong>Running on:</strong> Replit 24/7 via Uptime Robot monitoring</p>
  </div>
  
  <div class="features">
    <h3>Bot Features:</h3>
    <ul>
      <li>Auto-feeding when hunger drops below 15/20</li>
      <li>Protection against hostile mobs within 5 blocks</li>
      <li>Time announcement every 10 minutes</li>
      <li>In-game chat commands (prefix: !afk)</li>
      <li>Throw items command - both in chat and console</li>
      <li>Teleport acceptance</li>
      <li>Auto-reconnect if disconnected</li>
    </ul>
  </div>
  
  <div class="footer">
    <p>This status page automatically refreshes every 30 seconds.</p>
    <p><strong>How to keep this bot running 24/7:</strong></p>
    <ol>
      <li>Sign up for a free <a href="https://uptimerobot.com/" target="_blank">Uptime Robot</a> account</li>
      <li>Create a new HTTP monitor pointing to your Replit URL</li>
      <li>Set a monitoring interval of 5 minutes</li>
      <li>Save and your bot will stay running continuously!</li>
    </ol>
    <p>Server start: ${startTime}</p>
  </div>
</body>
</html>
  `;
  
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(statusPage);
});

server.listen(5000, '0.0.0.0', () => {
  logger.info('Uptime monitoring server started on port 5000');
  logger.info('To keep bot running 24/7, set up Uptime Robot to monitor your Replit URL');
});

// Initialize and start the web interface
const webInterface = new WebInterface(commandHandler, logger, 8080);
webInterface.start();

// Monkey patch the logger to also log to the web interface
const originalInfo = logger.info;
const originalWarn = logger.warn;
const originalError = logger.error;
const originalSuccess = logger.success;

logger.info = function(message) {
  originalInfo.call(this, message);
  if (webInterface) webInterface.addLog(message, 'info');
};

logger.warn = function(message) {
  originalWarn.call(this, message);
  if (webInterface) webInterface.addLog(message, 'warning');
};

logger.error = function(message, details = '') {
  originalError.call(this, message, details);
  const fullMessage = details ? `${message} ${details}` : message;
  if (webInterface) webInterface.addLog(fullMessage, 'error');
};

logger.success = function(message) {
  originalSuccess.call(this, message);
  if (webInterface) webInterface.addLog(message, 'success');
};
