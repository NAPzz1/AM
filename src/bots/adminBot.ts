import "dotenv/config";

import TelegramBot from "node-telegram-bot-api";
import { startHandler } from "./handlers/start";
import { adminMenuHandler } from "./handlers/adminMenu";

console.log("ADMIN BOT FILE LOADED");

const bot = new TelegramBot(
    process.env.ADMIN_BOT_TOKEN!,
    {
        polling: {
            interval: 1000,
            autoStart: true
        }
    }
);

console.log("POLLING ENABLED");

console.log("BOT CREATED");

bot.on("polling_error", (error) => {
    console.log("POLLING ERROR:", error.message);
});

bot.on("error", (error) => {
    console.log("BOT ERROR:", error.message);
});

bot.getMe()
    .then((info) => {
        console.log("BOT CONNECTED:", info.username);
    })
    .catch((err) => {
        console.log("GETME FAILED:", err.message);
    });

bot.on("message", (msg) => {
    console.log("RAW MESSAGE:", msg.text, msg.from?.id);
});

bot.onText(/\/start/, async (msg) => {
    console.log("START RECEIVED:", msg.from?.id);

    try {
        await startHandler(bot, msg);
    } catch (error) {
        console.log("START HANDLER ERROR:", error);
    }
});

bot.on("message", async (msg) => {

    if (!msg.text) return;

    if (msg.text.startsWith("/")) return;

    try {
        await adminMenuHandler(bot, msg);
    } catch (error) {
        console.log("MENU ERROR:", error);
    }

});

export default bot;