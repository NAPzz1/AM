import dotenv from "dotenv";

dotenv.config();

console.log("ENV CHECK:", {
    PORT: process.env.PORT,
    ADMIN_BOT_TOKEN: process.env.ADMIN_BOT_TOKEN ? "FOUND" : "MISSING",
    ALINA_TELEGRAM_ID: process.env.ALINA_TELEGRAM_ID
});

export const env = {

    PORT: Number(process.env.PORT) || 3000,

    SUPABASE_URL: process.env.SUPABASE_URL || "",

    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || ""

};