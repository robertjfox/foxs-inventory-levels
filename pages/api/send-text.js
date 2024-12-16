import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.error("Missing Twilio environment variables.");
  process.exit(1); // Stop execution if vars are missing
}

const client = twilio(accountSid, authToken);

const phoneNumbers = {
  Aventura: "+15618668364",
  "Boca Raton": "+15617166900",
  Atlanta: "+16784140553",
  Mineola: "+15162503196",
  Skokie: "+18476684010",
  Manhattan: "+19172946311",
  Whippany: "+12012325191",
  Stamford: "+15162824831",
  Newton: "+16178175778",
  Marlboro: "+17323106645",
  Ridgewood: "+12017399838",
  Eastchester: "+19145573081",
  Brooklyn: "+19178460271",
  "Forest Hills": "+19178866901",
  Huntington: "+15167612020",
  "West Babylon": "+15163178046",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const results = [];

    for (const [store, phoneNumber] of Object.entries(phoneNumbers)) {
      const message = await client.messages.create({
        body: `
        Hi! This is an automated message from Fox's.
        Please report your store's inventory levels using the following link: 
        https://foxs-inventory-levels.vercel.app/form?store=${encodeURIComponent(
          store
        )}`,
        from: twilioPhoneNumber,
        to: phoneNumber,
      });

      console.log(`Message sent to ${store}:`, message.sid);
      results.push({ store, messageSid: message.sid });
    }

    res.status(200).json({ success: true, results });
  } catch (error) {
    console.error("Error sending text:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
