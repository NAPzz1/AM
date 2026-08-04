import { Router } from "express";
import { supabase } from "../supabase";


const router = Router();


// ===============================
// CREATE BOOKING
// ===============================

router.post("/book", async (req, res) => {

    const {
        telegram_id,
        service_id,
        appointment_date,
        appointment_time
    } = req.body;



    if (!telegram_id || !service_id || !appointment_date || !appointment_time) {

        return res.status(400).json({
            error: "Missing booking information"
        });

    }



    // Find user

    const { data: user, error: userError } =
        await supabase
            .from("users")
            .select("*")
            .eq("telegram_id", telegram_id)
            .single();



    if (userError || !user) {

        return res.status(404).json({
            error: "User not found"
        });

    }




    // Check existing booking

    const { data: existingBooking } =
        await supabase
            .from("appointments")
            .select("*")
            .eq("user_id", user.id)
            .eq("status", "confirmed")
            .maybeSingle();



    if (existingBooking) {

        return res.status(400).json({
            error: "You already have an active appointment"
        });

    }




    // Get service duration

    const { data: service, error: serviceError } =
        await supabase
            .from("services")
            .select("duration")
            .eq("id", service_id)
            .single();



    if (serviceError || !service) {

        return res.status(404).json({
            error: "Service not found"
        });

    }




    const durationSlots = Math.ceil(service.duration / 30);




    // Sunday check

    const dateObject = new Date(appointment_date);


    if (dateObject.getDay() === 0) {

        return res.status(400).json({
            error: "Alina is closed on Sundays"
        });

    }




    // Generate slots

    const slots:string[] = [];


    for (
        let minutes = 9 * 60;
        minutes <= 22 * 60;
        minutes += 30
    ) {

        const hour = Math.floor(minutes / 60);
        const min = minutes % 60;


        slots.push(
            `${hour.toString().padStart(2,"0")}:${min
            .toString()
            .padStart(2,"0")}`
        );

    }



    const startIndex = slots.indexOf(appointment_time);



    if (startIndex === -1) {

        return res.status(400).json({
            error: "Invalid appointment time"
        });

    }




    const requiredSlots =
        slots.slice(
            startIndex,
            startIndex + durationSlots
        );



    if (requiredSlots.length !== durationSlots) {

        return res.status(400).json({
            error: "Appointment goes past closing time"
        });

    }





    // Check appointments

    const { data: appointments } =
        await supabase
            .from("appointments")
            .select("appointment_time")
            .eq("appointment_date", appointment_date)
            .eq("status", "confirmed");



    const bookedTimes =
        appointments?.map(a =>
            a.appointment_time.substring(0,5)
        ) || [];



    const conflict =
        requiredSlots.some(time =>
            bookedTimes.includes(time)
        );



    if (conflict) {

        return res.status(400).json({
            error: "This time slot is no longer available"
        });

    }





    // Check blocked slots

    const { data: blockedSlots } =
        await supabase
            .from("blocked_slots")
            .select("block_time")
            .eq("block_date", appointment_date);



    const blockedTimes =
        blockedSlots?.map(b =>
            b.block_time.substring(0,5)
        ) || [];



    const blocked =
        requiredSlots.some(time =>
            blockedTimes.includes(time)
        );



    if (blocked) {

        return res.status(400).json({
            error: "Alina is unavailable at this time"
        });

    }




    // Create appointment

    const { data, error } =
        await supabase
            .from("appointments")
            .insert({

                user_id: user.id,
                service_id,
                appointment_date,
                appointment_time,
                status: "confirmed"

            })
            .select()
            .single();




    if (error) {

        return res.status(500).json({
            error: error.message
        });

    }



    res.json({

        message: "Appointment booked successfully",
        appointment: data

    });


});




// ===============================
// GET AVAILABLE SLOTS
// ===============================

router.get("/slots", async (req, res) => {

    const { date, service_id } = req.query;



    if (!date || !service_id) {

        return res.status(400).json({
            error: "date and service_id are required"
        });

    }



    const selectedDate = new Date(date as string);



    // Sunday closed

    if (selectedDate.getDay() === 0) {

        return res.json({

            closed: true,
            message: "Alina is closed on Sundays"

        });

    }




    // Get service duration

    const { data: service, error: serviceError } =
        await supabase
            .from("services")
            .select("duration")
            .eq("id", service_id)
            .single();



    if (serviceError || !service) {

        return res.status(404).json({
            error: "Service not found"
        });

    }



    // How many 30 min blocks are needed

    const durationSlots = Math.ceil(service.duration / 30);




    // Generate 09:00 - 22:00

    const slots:string[] = [];


    for (
        let minutes = 9 * 60;
        minutes <= 22 * 60;
        minutes += 30
    ) {


        const hours = Math.floor(minutes / 60);

        const mins = minutes % 60;


        const time =
            `${hours.toString().padStart(2,"0")}:` +
            `${mins.toString().padStart(2,"0")}`;


        slots.push(time);

    }





    // Get booked appointments

    const { data: appointments } =
        await supabase
            .from("appointments")
            .select("appointment_time")
            .eq("appointment_date", date)
            .eq("status", "confirmed");




    // Get manually blocked slots

    const { data: blockedSlots } =
        await supabase
            .from("blocked_slots")
            .select("block_time")
            .eq("block_date", date);




    const bookedTimes =
        appointments?.map(item =>
            item.appointment_time.substring(0,5)
        ) || [];



    const blockedTimes =
        blockedSlots?.map(item =>
            item.block_time.substring(0,5)
        ) || [];





    // Build response

    const result = slots.map((slot, index) => {


        const requiredSlots =
            slots.slice(
                index,
                index + durationSlots
            );



        const notEnoughTime =
            requiredSlots.length !== durationSlots;



        const booked =
            requiredSlots.some(time =>
                bookedTimes.includes(time)
            );



        const blocked =
            requiredSlots.some(time =>
                blockedTimes.includes(time)
            );




        return {

            time: slot,

            available:
                !notEnoughTime &&
                !booked &&
                !blocked,


            reason:

                booked
                    ? "Booked"

                    : blocked
                    ? "Unavailable"

                    : notEnoughTime
                    ? "Not enough time before closing"

                    : null

        };


    });



    res.json(result);


});

// ===============================
// CANCEL APPOINTMENT
// ===============================

router.post("/cancel", async (req, res) => {

    const {
        telegram_id,
        appointment_id
    } = req.body;



    if (!telegram_id || !appointment_id) {

        return res.status(400).json({
            error: "telegram_id and appointment_id are required"
        });

    }



    // Find user

    const { data: user, error: userError } =
        await supabase
            .from("users")
            .select("*")
            .eq("telegram_id", telegram_id)
            .single();



    if (userError || !user) {

        return res.status(404).json({
            error: "User not found"
        });

    }




    // Find appointment

    const { data: appointment, error: appointmentError } =
        await supabase
            .from("appointments")
            .select("*")
            .eq("id", appointment_id)
            .eq("user_id", user.id)
            .eq("status", "confirmed")
            .single();



    if (appointmentError || !appointment) {

        return res.status(404).json({
            error: "Active appointment not found"
        });

    }




    // Check same-day cancellation rule

    const today = new Date();

    const appointmentDate = new Date(
        appointment.appointment_date
    );


    const todayString =
        today.toISOString().split("T")[0];


    const appointmentString =
        appointmentDate.toISOString().split("T")[0];



    if (todayString === appointmentString) {

        return res.status(400).json({

            error:
            "Same day cancellation is not allowed"

        });

    }




    // Cancel appointment

    const { data, error } =
        await supabase
            .from("appointments")
            .update({

                status: "cancelled",
                cancellation_reason:
                    "Cancelled by client"

            })
            .eq("id", appointment_id)
            .select()
            .single();



    if (error) {

        return res.status(500).json({
            error: error.message
        });

    }




    res.json({

        message: "Appointment cancelled successfully",

        appointment: data

    });



});

// ===============================
// GET MY APPOINTMENT
// ===============================

router.get("/my/:telegram_id", async (req, res) => {

    const telegram_id = req.params.telegram_id;



    // Find user

    const { data: user, error: userError } =
        await supabase
            .from("users")
            .select("*")
            .eq("telegram_id", telegram_id)
            .single();



    if (userError || !user) {

        return res.status(404).json({
            error: "User not found"
        });

    }




    // Find active appointment

    const { data: appointment, error: appointmentError } =
        await supabase
            .from("appointments")
            .select(`
                id,
                appointment_date,
                appointment_time,
                status,
                service_id,
                services (
                    name,
                    duration,
                    price
                )
            `)
            .eq("user_id", user.id)
            .eq("status", "confirmed")
            .single();



    if (appointmentError || !appointment) {

        return res.status(404).json({
            message: "No active appointment"
        });

    }



    res.json({

        appointment

    });


});

export default router;