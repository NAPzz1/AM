import "dotenv/config";

import TelegramBot from "node-telegram-bot-api";
import { startHandler } from "./handlers/start";

console.log("ADMIN BOT FILE LOADED");

const bot = new TelegramBot(
    process.env.ADMIN_BOT_TOKEN!,
    {
        polling: {
            interval: 3000,
            autoStart: true,
            params: {
                timeout: 30
            }
        }
    }
);

console.log("BOT CREATED");

bot.on("polling_error", (error) => {
    console.log("POLLING ERROR:", error.message);
});

bot.on("error", (error) => {
    console.log("BOT ERROR:", error.message);
});



// Debug incoming messages
bot.on("message", (msg) => {
    console.log(
        "RAW MESSAGE:",
        msg.text,
        msg.from?.id
    );
});


// START COMMAND
bot.onText(/\/start/, async (msg) => {
    console.log("START RECEIVED:", msg.from?.id);

    try {
        await startHandler(bot, msg);
    } catch (error) {
        console.log("START HANDLER ERROR:", error);
    }
});


// ADMIN MENU ROUTER
bot.on("message", async (msg) => {
    const text = msg.text;

    if (!text) return;

    try {

        switch (text) {

            case "📅 Manual Book":
            case "Manual Book":
                await bot.sendMessage(
                    msg.chat.id,
                    "📅 Manual booking selected"
                );
                break;


            case "🚫 Block Slots":
            case "Block Slots":
                await bot.sendMessage(
                    msg.chat.id,
                    "🚫 Block slots selected"
                );
                break;


            case "❌ Cancel Appointment":
            case "Cancel Appointment":
                await bot.sendMessage(
                    msg.chat.id,
                    "❌ Cancel appointment selected"
                );
                break;


            case "📊 Statistics":
            case "Statistics":
                await bot.sendMessage(
                    msg.chat.id,
                    "📊 Statistics selected"
                );
                break;


            case "⚙️ Settings":
            case "Settings":
                await bot.sendMessage(
                    msg.chat.id,
                    "⚙️ Settings selected"
                );
                break;

        }

    } catch (error) {
        console.log("MENU HANDLER ERROR:", error);
    }
});


export default bot;