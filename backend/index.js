import express from "express";
import mysql from "mysql";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import twilio from "twilio";

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Create a MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Replace with your MySQL username
  password: "", // Replace with your MySQL password
  database: "rating_app", // The database name
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL");
});

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.API_KEY); // Use your API key stored in .env

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const recipientPhoneNumber = process.env.RECIPIENT_PHONE_NUMBER;

// Endpoint to save the rating and return sentiment
app.post("/api/ratings", async (req, res) => {
  const { name, description, rating } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Use the gemini-pro model for sentiment analysis
    const prompt = `Analyze the sentiment of the following text:\n\n${description}\nThe sentiment should be categorized as either positive, negative, or neutral.`;
    const result = await model.generateContent(prompt);
    const sentiment = result.response.text().toLowerCase(); // Extract the sentiment from the result

    const query =
      "INSERT INTO ratings (name, description, rating) VALUES (?,?,?)";
    db.query(query, [name, description, rating], (err, result) => {
      if (err) {
        console.error("Error inserting data:", err);
        res.status(500).send("Error inserting data");
        return;
      }

      // Send notification via Twilio
      const message = `${name} rated your product a ${rating} star`;
      twilioClient.messages
        .create({
          body: message,
          from: twilioPhoneNumber,
          to: recipientPhoneNumber,
        })
        .then((message) => console.log(`Message sent: ${message.sid}`))
        .catch((error) => console.error("Error sending message:", error));

      res.status(200).send({ message: "Rating saved successfully", sentiment });
    });
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    res.status(500).send("Error analyzing sentiment");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
