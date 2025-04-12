# Running Your Minecraft AFK Bot 24/7 on Replit

This guide will help you set up your Minecraft AFK bot to run continuously on Replit using Uptime Robot.

## What You Need

1. A free Replit account (which you already have)
2. A free [Uptime Robot](https://uptimerobot.com/) account

## Why This Works

Replit projects normally "go to sleep" when they're not being used. By using Uptime Robot to ping your project every 5 minutes, we can prevent it from going to sleep, keeping your Minecraft bot online 24/7.

## Step by Step Guide

### Step 1: Deploy Your Project on Replit

1. Make sure your project is running correctly by clicking the "Run" button in Replit
2. If you've modified any code, make sure to save all files before deploying
3. Click the "Deploy" button at the top of the Replit interface
4. After deployment completes, you'll get a URL that looks like `https://your-project-name.username.repl.co`
5. Copy this URL - you'll need it for the next step

### Step 2: Set Up Uptime Robot

1. Go to [Uptime Robot](https://uptimerobot.com/) and create a free account or log in
2. Once logged in, click "Add New Monitor"
3. Select "HTTP(s)" as the monitor type
4. Enter a friendly name for your monitor (e.g., "Minecraft AFK Bot")
5. Paste your Replit URL from Step 1 
6. Set the monitoring interval to 5 minutes
7. Click "Create Monitor"

### Step 3: Verify Everything Works

1. After setting up Uptime Robot, wait for at least 5 minutes
2. Check your Replit project to make sure it's still running
3. You can also visit your project URL in a browser to see the status page

## Keep Your Bot Running Forever

As long as Uptime Robot continues to ping your Replit project URL, your bot will remain active. The free tier of Uptime Robot allows for 50 monitors that are checked every 5 minutes, which is perfect for keeping your bot online.

## Important Notes

1. Make sure your Replit account remains active
2. The bot has auto-reconnect features if it gets disconnected from the Minecraft server
3. The status page shows real-time information about your bot's connection

## Troubleshooting

If your bot stops working despite Uptime Robot:

1. Check your Replit logs for any errors
2. Make sure the Minecraft server you're connecting to is online
3. Try restarting your Replit project
4. Check that Uptime Robot shows your monitor as "Up"

## Advanced Setup

For even more reliability, you can set up multiple Uptime Robot monitors using different services:

1. [StatusCake](https://www.statuscake.com/) - Also has a free tier
2. [Cron-job.org](https://cron-job.org/) - Another free service for scheduled jobs

Using multiple services ensures that if one fails, the others will keep your bot running.