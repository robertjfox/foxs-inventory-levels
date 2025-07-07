import nodemailer from "nodemailer";
import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

async function sendRenderedHTML() {
  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    await page.goto("https://foxs-inventory-levels.vercel.app/grid", {
      waitUntil: "networkidle0",
    });

    const html = await page.content();
    await browser.close();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "robertjfox94@gmail.com",
        pass: "jlmq ssum ockp skox", // use an app password if needed
      },
    });

    await transporter.sendMail({
      from: '"Robert Fox" <robertjfox94@gmail.com>',
      to: "buyers@foxs.com, robert@foxs.com, bob@foxs.com, eileen@foxs.com, carlos@foxs.com",
      // to: "robert@foxs.com",
      subject: "FOXS Inventory Levels - Test Email",
      html,
    });

    console.log("Email sent");
    return { success: true, message: "Email sent successfully" };
  } catch (err) {
    console.error("Error:", err);
    return { success: false, error: err.message };
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const result = await sendRenderedHTML();

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Export the function for use in other modules
export { sendRenderedHTML };
