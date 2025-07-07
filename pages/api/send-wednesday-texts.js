import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.error("Missing Twilio environment variables.");
  process.exit(1);
}

const client = twilio(accountSid, authToken);

// Wednesday text recipients
const wednesdayRecipients = [
  "+15162824831", // Robert
  "+15163138924", // Additional recipient
  "+15165372201", // Additional recipient
];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    console.log("Invalid request method.");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const results = [];

    for (const phoneNumber of wednesdayRecipients) {
      console.log(`Sending Wednesday summary to ${phoneNumber}...`);

      const message = await client.messages.create({
        body: `See inventory levels for all stores at the following link:

https://foxs-inventory-levels.vercel.app/grid`,
        from: twilioPhoneNumber,
        to: phoneNumber,
      });

      console.log(
        `Wednesday summary sent to ${phoneNumber}: SID ${message.sid}`
      );
      results.push({ phoneNumber, messageSid: message.sid });
    }

    console.log("All Wednesday text messages sent successfully.");
    res.status(200).json({ success: true, results });
  } catch (error) {
    console.error("Error sending Wednesday texts:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
