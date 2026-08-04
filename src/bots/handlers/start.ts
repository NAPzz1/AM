import TelegramBot, { Message } from "node-telegram-bot-api";
import { adminKeyboard } from "../keyboards/adminKeyboard";

export async function startHandler(
    bot: TelegramBot,
    msg: Message
) {

    const telegramId = msg.from?.id;
    const chatId = msg.chat.id;

    if (telegramId !== Number(process.env.ALINA_TELEGRAM_ID)) {

        await bot.sendMessage(
            chatId,
            "⛔ Access denied.\n\nThis bot is private."
        );

        return;
    }


    await bot.sendMessage(
        chatId,
        "💅 Welcome, Alina!",
        {
            reply_markup: adminKeyboard
        }
    );

}