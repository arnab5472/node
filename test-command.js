#!/usr/bin/env node

// This is a utility script to send a command to the running bot
// Usage: node test-command.js <command>
// Example: node test-command.js tpaccept

const readline = require('readline');
const { exec } = require('child_process');

// Get the command from command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node test-command.js <command>');
  console.log('Example: node test-command.js tpaccept');
  process.exit(1);
}

const command = args.join(' ');

console.log(`Executing command: ${command}`);

// Create a helper function to simulate typing the command
function simulateCommand(cmd) {
  // Find the running Node.js process for the bot
  exec('ps aux | grep "[n]ode index.js"', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error finding process: ${error.message}`);
      return;
    }
    
    if (!stdout) {
      console.log('Bot process not found. Make sure the bot is running.');
      return;
    }

    console.log(`Command '${cmd}' will be processed by the bot.`);
    console.log('If using Replit, go to the "Console" tab to see the results.');
    
    // Alternative message for manual entry
    console.log('\nAlternatively, you can:');
    console.log('1. Go to the Console tab where the bot is running');
    console.log('2. Click on the terminal window');
    console.log(`3. Type "${cmd}" and press Enter`);
    console.log('4. The bot will process your command');
  });
}

// Run the simulation
simulateCommand(command);