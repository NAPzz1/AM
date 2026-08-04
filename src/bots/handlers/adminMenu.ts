import TelegramBot, { Message } from "node-telegram-bot-api";


export async function adminMenuHandler(
    bot: TelegramBot,
    msg: Message
) {

    const chatId = msg.chat.id;
    const text = msg.text;


    switch (text) {

        case "📊 Statistics":

            await bot.sendMessage(
                chatId,
                "📊 Statistics selected"
            );

            break;


        case "📅 Manual Book":

            await bot.sendMessage(
                chatId,
                "📅 Manual booking selected"
            );

            break;


        case "🚫 Block Slots":

            await bot.sendMessage(
                chatId,
                "🚫 Block slots selected"
            );

            break;


        case "❌ Cancel Appointment":

            await bot.sendMessage(
                chatId,
                "❌ Cancel appointment selected"
            );

            break;


        case "⚙️ Settings":

            await bot.sendMessage(
                chatId,
                "⚙️ Settings selected"
            );

            break;
    }
}