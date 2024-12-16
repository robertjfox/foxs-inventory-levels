import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const message = await client.messages.create({
      body: "Please report your inventory levels: https://foxs-inventory-levels.vercel.app/form",
      from: twilioPhoneNumber,
      to: "+15162824831",
    });

    console.log("Message sent:", message.sid);

    res.status(200).json({ success: true, message });
  } catch (error) {
    console.error("Error sending text:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
