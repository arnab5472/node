const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

/**
 * WebInterface class to provide a web control panel for the Minecraft AFK Bot
 */
class WebInterface {
  /**
   * Initialize the web interface
   * @param {Object} commandHandler - The CommandHandler instance to process commands
   * @param {Object} logger - The Logger instance for logging
   * @param {number} port - The port to run the web server on (default: 8080)
   */
  constructor(commandHandler, logger, port = 8080) {
    this.commandHandler = commandHandler;
    this.logger = logger;
    this.port = port;

    // Logs buffer to send to new clients
    this.logBuffer = [];
    this.maxLogBufferSize = 100;

    // Initialize Express and Socket.IO
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = socketIo(this.server);

    // Setup routes and socket events
    this.setupExpress();
    this.setupSocketEvents();
  }

  /**
   * Configure Express routes
   */
  setupExpress() {
    // Serve static files from public directory
    this.app.use(express.static(path.join(__dirname, 'public')));

    // Main route
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
  }

  /**
   * Configure Socket.IO events
   */
  setupSocketEvents() {
    this.io.on('connection', (socket) => {
      this.logger.info('Web client connected');

      // Send initial log buffer to new clients
      this.logBuffer.forEach(log => {
        socket.emit('log', log);
      });

      // Handle command requests from client
      socket.on('command', (data) => {
        if (data && data.command) {
          this.logger.info(`Web command received: ${data.command}`);
          this.commandHandler.handleCommand(data.command);
        }
      });

      // Handle status requests
      socket.on('get_status', () => {
        // This will be implemented later
        this.sendBotStatus(socket);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        this.logger.info('Web client disconnected');
      });
    });
  }

  /**
   * Send bot status to client
   * @param {Object} socket - The socket to send status to (optional)
   */
  sendBotStatus(socket = null) {
    const status = this.commandHandler.bot.getStatus();
    const statusData = {
      connected: status.connected,
      afkActive: status.afkActive,
      username: status.username,
      server: status.server,
      health: status.health,
      food: status.food
    };

    if (socket) {
      socket.emit('bot_status', statusData);
    } else {
      this.io.emit('bot_status', statusData);
    }
  }

  /**
   * Add a log message to the buffer and broadcast to all clients
   * @param {string} message - The log message
   * @param {string} type - The log type (info, success, warning, error)
   */
  addLog(message, type = 'info') {
    // Create log object
    const log = {
      message,
      type,
      timestamp: new Date().toISOString()
    };

    // Add to buffer
    this.logBuffer.push(log);

    // Keep buffer size in check
    if (this.logBuffer.length > this.maxLogBufferSize) {
      this.logBuffer.shift();
    }

    // Broadcast to all clients
    this.io.emit('log', log);
  }

  /**
   * Start the web server
   */
  start() {
    this.server.listen(this.port, '0.0.0.0', () => {
      this.logger.info(`Web interface started on port ${this.port}`);
      this.logger.info(`Access the control panel at http://localhost:${this.port}`);
    });
  }
}

module.exports = WebInterface;