import "dotenv/config";
import https from "https";

const token = process.env.ADMIN_BOT_TOKEN;

const options = {
    hostname: "api.telegram.org",
    path: `/bot${token}/getMe`,
    method: "GET",
    family: 4,
    timeout: 5000
};

console.log("Testing Telegram API...");

const req = https.request(options, (res) => {

    console.log("STATUS:", res.statusCode);

    let data = "";

    res.on("data", chunk => {
        data += chunk;
    });

    res.on("end", () => {
        console.log("RESPONSE:", data);
    });

});

req.on("timeout", () => {
    console.log("REQUEST TIMEOUT");
    req.destroy();
});

req.on("error", (err) => {
    console.log("HTTPS ERROR:", err.message);
});

req.end();