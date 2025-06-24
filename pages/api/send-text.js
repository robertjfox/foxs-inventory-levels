import twilio from "twilio";
import dotenv from "dotenv";
import fetch from "node-fetch"; // Import fetch for API call
import { startOfWeek, isAfter, parseISO } from "date-fns"; // For date comparison
import { sendRenderedHTML } from "./send-email"; // Import the sendRenderedHTML function

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.error("Missing Twilio environment variables.");
  process.exit(1);
}

console.log("Twilio environment variables loaded successfully.");

const client = twilio(accountSid, authToken);

const storeNames = {
  Aventura: "Inna",
  "Boca Raton": "Stacie",
  Atlanta: "Rita",
  Mineola: "Vincenza",
  Skokie: "Lidia",
  Manhattan: "Marcy",
  Whippany: "Judy",
  Stamford: "Robert",
  Newton: "Natasha",
  Marlboro: "Staci",
  Ridgewood: "Rose Ann",
  Eastchester: " Josie",
  Brooklyn: "Cathy",
  "Forest Hills": "Suzie",
  Huntington: "Bonnie",
  "West Babylon": "Mayra",
};

const phoneNumbers = {
  Aventura: "+19172076983",
  "Boca Raton": "+15617166900",
  Atlanta: "+16784140553",
  Mineola: "+15162503196",
  Skokie: "+17738150071",
  Manhattan: "+19178376674",
  Whippany: "+19083312966",
  Stamford: "+15162824831",
  Newton: "+16178175778",
  Marlboro: "+17323106645",
  Ridgewood: "+12017399838",
  Eastchester: "+19142823221",
  Brooklyn: "+19178460271",
  "Forest Hills": "+19178866901",
  Huntington: "+16318556048",
  "West Babylon": "+15163178046",
};

// Fetch last updated data from API
async function fetchLastUpdatedData() {
  const response = await fetch(
    "https://foxs-inventory-levels.vercel.app/api/data"
  );
  if (!response.ok) throw new Error("Failed to fetch last updated data");
  return await response.json();
}

// Check if lastUpdated is since last Monday
function isUpdatedSinceMonday(lastUpdated) {
  const today = new Date();
  const lastMonday = startOfWeek(today, { weekStartsOn: 1 }); // Get the most recent Monday

  // If it's Monday, reset the cycle and send messages to everyone
  if (today.getDay() === 1) {
    console.log(
      "Today is Monday, starting a new cycle. Sending messages to everyone."
    );
    return false;
  }

  // If lastUpdated is null, send the message
  if (!lastUpdated) {
    console.log("Last updated date is null, we need to send a message.");
    return false;
  }

  // Check if lastUpdated is after the most recent Monday
  const updatedDate = parseISO(lastUpdated);
  const result = isAfter(updatedDate, lastMonday);

  // If updated since Monday, no need to send a message
  return result;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    console.log("Invalid request method.");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check if this is a test request
    const isTest = req.query.test === "true";

    if (isTest) {
      // Test mode: send only to Robert
      console.log("Sending test message to Robert...");
      const message = await client.messages.create({
        body: `Test message from FOXS Inventory System 🦊

See current inventory levels at:
https://foxs-inventory-levels.vercel.app/grid

This is a test message.`,
        from: twilioPhoneNumber,
        to: "+15162824831",
      });

      console.log(`Test message sent successfully: SID ${message.sid}`);
      return res.status(200).json({
        success: true,
        message: "Test text sent successfully",
        messageSid: message.sid,
      });
    }

    // Original functionality for automated sends
    const lastUpdatedData = await fetchLastUpdatedData();
    const results = [];

    for (const [store, phoneNumber] of Object.entries(phoneNumbers)) {
      const storeData = lastUpdatedData[store];

      // Skip if lastUpdated is since last Monday
      if (storeData && isUpdatedSinceMonday(storeData.lastUpdated)) {
        continue;
      }

      console.log(`Sending message to ${store} at ${phoneNumber}...`);
      const message = await client.messages.create({
        body: `
        Hi ${storeNames[store]},

        This is an automated message from Robert Fox 🦊.

        Please help improve our distribution process by reporting your inventory levels using the following link.

        If unable to complete the form, please share the link with another team member.

        Thank you!

        https://foxs-inventory-levels.vercel.app/form?store=${encodeURIComponent(
          store
        )}`,
        from: twilioPhoneNumber,
        to: phoneNumber,
      });

      console.log(`Message successfully sent to ${store}: SID ${message.sid}`);
      results.push({ store, messageSid: message.sid });
    }

    if (new Date().getDay() === 3) {
      // Call the function to send the email
      await sendRenderedHTML(); // Await for the email to be sent before continuing

      ["+15162824831", "+15163138924", "+15165372201"].forEach(
        async (number) => {
          await client.messages.create({
            body: `
          See inventory levels for all stores at the following link:

          https://foxs-inventory-levels.vercel.app/grid`,
            from: twilioPhoneNumber,
            to: number,
          });
        }
      );

      console.log("Message successfully sent to all Wednesday recipients.");
    }

    console.log("All messages processed successfully.");
    res.status(200).json({ success: true, results });
  } catch (error) {
    console.error("Error during message sending process:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
