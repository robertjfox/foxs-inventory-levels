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
  // "Aventura": "+15162824831",
  "Boca Raton": "+15162824831",
  // "Atlanta": "+14049938416",
  // "Mineola": "+15162006657",
  // "Skokie": "+18472322374",
  // "Manhattan": "+12122099269",
  // "Whippany": "+19734410684",
  // "Stamford": "+12038850266",
  // "Newton": "+19734410684",
  // "Marlboro": "+19734410684",
  // "Ridgewood": "+19734410684",
  // "Eastchester": "+19734410684",
  // "Brooklyn": "+19734410684",
  // "Forest Hills": "+19734410684",
  // "Huntington": "+19734410684",
  // "West Babylon": "+19734410684",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const results = [];

    for (const [store, phoneNumber] of Object.entries(phoneNumbers)) {
      const message = await client.messages.create({
        body: `Please report your inventory levels: https://foxs-inventory-levels.vercel.app/form?store=${encodeURIComponent(
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

// run the handler
handler(
  { method: "POST" },
  { status: () => ({ json: (data) => console.log(data) }) }
);
