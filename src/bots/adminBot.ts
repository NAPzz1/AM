import "dotenv/config";

import TelegramBot from "node-telegram-bot-api";

const bot = new TelegramBot(
    process.env.ADMIN_BOT_TOKEN!
);

bot.getMe()
    .then((info) => {
        console.log("SUCCESS:", info.username);
        process.exit(0);
    })
    .catch((err) => {
        console.log("FAILED:", err);
        process.exit(1);
    });

setTimeout(() => {
    console.log("TELEGRAM REQUEST TIMED OUT");
    process.exit(1);
}, 10000);

export default bot;