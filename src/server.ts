import "dotenv/config";

import express from "express";
import cors from "cors";
import "./bots/adminBot";

import { env } from "./env";
import { supabase } from "./supabase";
import userRoutes from "./routes/users";
import appointmentRoutes from "./routes/appointments";

const app = express();


app.use(cors());
app.use(express.json());
app.use("/users", userRoutes);
app.use("/appointments", appointmentRoutes);


app.get("/", (req, res) => {

    res.json({
        message: "Book with Alina API is running 💅"
    });

});


app.get("/services", async (req, res) => {

    const { data, error } = await supabase
        .from("services")
        .select("*");


    if (error) {

        return res.status(500).json({
            error: error.message
        });

    }


    res.json(data);

});


app.listen(env.PORT, () => {

    console.log(
        `Server running on port ${env.PORT}`
    );

});