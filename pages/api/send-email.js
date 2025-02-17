import nodemailer from 'nodemailer';
import puppeteer from 'puppeteer';

async function sendRenderedHTML() {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://foxs-inventory-levels.vercel.app/grid', { waitUntil: 'networkidle0' });

    const html = await page.content();
    await browser.close();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'robertjfox94@gmail.com',
        pass: 'jlmq ssum ockp skox' // use an app password if needed
      }
    });

    await transporter.sendMail({
      from: '"Your Name" <robertjfox94@gmail.com>',
      to: 'robert@foxs.com',
      subject: 'FOXS Inventory Levels',
      html
    });

    console.log('Email sent');
  } catch (err) {
    console.error('Error:', err);
  }
}

// Call the function to send the email
await sendRenderedHTML();

export default sendRenderedHTML;
