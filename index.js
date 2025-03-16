import fetch from 'node-fetch';
import 'dotenv/config';

export default async (req, res) => {
  // CORS headers to allow specific origin and methods
  const FRONTEND_URL = process.env.FRONTEND_URL; // Frontend URL from .env file

  res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Respond to preflight
  }

  // Handle POST request for email sending
  if (req.method === 'POST' && req.body.email && req.body.name && req.body.message) {
    const { name, email, message } = req.body;

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

      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json({ error: errorData.error || 'Unknown error' });
      }

      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error during email sending:', error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  }

  // Handle GET request for fetching images
  else if (req.method === 'GET' && req.query.imageUrl) {
    const { imageUrl } = req.query;

    if (!imageUrl) {
      return res.status(400).json({ error: "Image URL is required" });
    }

    try {
      const response = await fetch(imageUrl);

      if (!response.ok) {
        return res.status(response.status).json({ error: 'Error fetching image' });
      }

      const imageBuffer = await response.buffer();  // Get the image as a buffer
      res.setHeader('Content-Type', response.headers.get('Content-Type'));
      res.send(imageBuffer);  // Send the image buffer as the response

    } catch (error) {
      console.error('Error fetching image:', error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
};
