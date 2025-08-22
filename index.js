```javascript:index.js
// =================================================================================================
// 1. SETUP - WEB SERVER FOR RENDER
// =================================================================================================
// Render services go to sleep after a period of inactivity. This web server
// provides a URL that can be pinged by a service like UptimeRobot to keep it awake.

const express = require('express');
const mineflayer = require('mineflayer');

const app = express();
// Render provides the port via the PORT environment variable.
const port = process.env.PORT || 3000;

// This creates a simple webpage to confirm the server is running.
// **THE FIX IS HERE**: Notice the backticks (`) around the HTML.
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <div style="font-family: sans-serif; text-align: center; padding-top: 50px;">
      <h1>Minecraft Bot is Running</h1>
      <p>This server is active and the bot should be online.</p>
    </div>
  `);
});

// Start the web server.
app.listen(port, () => {
  console.log(`Web server started on port ${port}`);
});


// =================================================================================================
// 2. BOT CONFIGURATION
// =================================================================================================
// IMPORTANT: In your Render dashboard, go to the "Environment" tab and add
// your EMAIL and PASSWORD as environment variables.

const botOptions = {
    // -- Server Details --
    host: 'BelarsS1.aternos.me', // <-- CHANGE THIS to your server's IP address
    port: 57402,            // <-- CHANGE THIS to your server's port

    // -- Bot Authentication --
    username: process.env.EMAIL,    // Gets email from Render's environment variables
    password: process.env.PASSWORD, // Gets password from Render's environment variables
    auth: 'microsoft',

    // -- Mineflayer Settings --
    version: 'bedrock_1.20.10',
};


// =================================================================================================
// 3. BOT CREATION & LOGIC
// =================================================================================================

function createBot() {
    console.log('Attempting to initialize the bot...');
    const bot = mineflayer.createBot(botOptions);

    // Runs once the bot has successfully connected and spawned in the world.
    bot.on('spawn', () => {
        console.log('Bot has spawned and is now online!');
        setTimeout(() => {
            bot.chat("Hello! This bot is hosted on Render.");
        }, 2000);
    });

    // Runs every time a chat message is detected.
    bot.on('chat', (username, message) => {
        if (username === bot.username) return;

        console.log(`[Chat] ${username}: ${message}`);

        // Command to get the bot's current coordinates.
        if (message.trim().toLowerCase() === '!location') {
            const pos = bot.entity.position;
            bot.chat(`I am at X: ${pos.x.toFixed(2)}, Y: ${pos.y.toFixed(2)}, Z: ${pos.z.toFixed(2)}`);
        }
    });

    // Catches errors to prevent the bot from crashing.
    bot.on('error', (err) => {
        console.error('Bot encountered an error:', err);
    });

    // Handles disconnection and automatically tries to reconnect.
    bot.on('end', (reason) => {
        console.log(`Bot disconnected. Reason: ${reason}`);
        console.log('Will attempt to reconnect in 25 seconds...');
        setTimeout(createBot, 25000);
    });
}

// Initial call to start the bot process.
createBot();
