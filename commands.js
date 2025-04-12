#!/usr/bin/env node

// This script provides a simple interface to send commands to the Minecraft AFK Bot
// without having to interact directly with the bot's console

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const CommandHandler = require('./lib/commandHandler');
const MinecraftBot = require('./lib/bot');
const Logger = require('./lib/logger');

// Create a lightweight logger for this utility
const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  success: (msg) => console.log(`[SUCCESS] ${msg}`),
  warn: (msg) => console.warn(`[WARNING] ${msg}`)
};

// Read the bot's configuration
let config;
try {
  const configFile = fs.readFileSync('./config.json', 'utf8');
  config = JSON.parse(configFile);
  logger.info('Configuration loaded successfully');
} catch (error) {
  logger.error(`Failed to load configuration: ${error.message}`);
  process.exit(1);
}

// Create command handler (but not connect to the actual bot)
const dummyBot = { 
  isConnected: true,
  bot: {
    chat: (msg) => {
      logger.info(`Would send to server: ${msg}`);
      return true;
    }
  }
};

// List available commands
const availableCommands = [
  'status',
  'tpaccept',
  'position <x> <y> <z>',
  'inventory',
  'menu',
  'classic',
  'help'
];

// Parse command line arguments
const args = process.argv.slice(2);
const command = args.join(' ');

if (!command) {
  // Interactive mode
  logger.info('=== Minecraft AFK Bot Command Utility ===');
  logger.info('Available commands:');
  availableCommands.forEach(cmd => logger.info(`  ${cmd}`));
  logger.info('');
  logger.info('Type a command to simulate execution, or "exit" to quit');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Command > '
  });
  
  rl.prompt();
  
  rl.on('line', (input) => {
    const trimmedInput = input.trim();
    
    if (trimmedInput === 'exit') {
      logger.info('Exiting...');
      rl.close();
      return;
    }
    
    if (trimmedInput) {
      logger.info(`Command: ${trimmedInput}`);
      logger.info('');
      logger.info('For in-game chat:');
      logger.info(`Type: !afk ${trimmedInput}`);
      logger.info('');
      logger.info('For bot console:');
      logger.info(`Type: ${trimmedInput}`);
    }
    
    rl.prompt();
  }).on('close', () => {
    process.exit(0);
  });
} else {
  // Direct command mode
  logger.info(`Command: ${command}`);
  logger.info('');
  logger.info('For in-game chat:');
  logger.info(`Type: !afk ${command}`);
  logger.info('');
  logger.info('For bot console:');
  logger.info(`Type: ${command}`);
}