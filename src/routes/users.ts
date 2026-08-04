import { Router } from "express";
import { supabase } from "../supabase";


const router = Router();


router.post("/register", async (req, res) => {

    const {
        telegram_id,
        first_name,
        last_name,
        telegram_username,
        phone
    } = req.body;


    if (!telegram_id || !phone) {

        return res.status(400).json({
            error: "Telegram ID and phone are required"
        });

    }


    // Check existing user

    const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", telegram_id)
        .single();


    if (existingUser) {

        return res.json(existingUser);

    }


    // Create new user

    const { data, error } = await supabase
        .from("users")
        .insert({

            telegram_id,
            first_name,
            last_name,
            telegram_username,
            phone

        })
        .select()
        .single();


    if (error) {

        return res.status(500).json({
            error: error.message
        });

    }


    res.json(data);

});


export default router;