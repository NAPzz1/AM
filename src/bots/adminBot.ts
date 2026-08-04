import "dotenv/config";

import TelegramBot from "node-telegram-bot-api";

console.log("ADMIN BOT FILE LOADED");

const bot = new TelegramBot(
    process.env.ADMIN_BOT_TOKEN!,
    {
        polling: true
    }
);

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

export default bot;