const fetch = require("node-fetch");
require("dotenv").config();

module.exports = async (req, res) => {
  // CORS headers to allow specific origin and methods
  const FRONTEND_URL ='https://itsnilesh.vercel.app'; // You can set this in your Vercel environment variables

  res.setHeader('Access-Control-Allow-Origin', "*"); // Set your frontend origin here
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Respond to preflight
  }

  // Handle POST request for email sending
  if (req.method === 'POST') {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "portfolio.nilesh@resend.dev", // Replace with your verified Resend email
          to: ["dev.portfolio.nilesh@gmail.com"], // Replace with your email
          subject: "New Contact Form Submission",
          html: `
            <h2>Contact Form Submission</h2>
            <p><b>Name:</b> ${name}</p>
            <p><b>Email:</b> ${email}</p>
            <p><b>Message:</b> ${message}</p>
          `,
        }),
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
};
