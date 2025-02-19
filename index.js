const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const collection = require("./src/config")
const cors = require("cors");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
// require("../dotenv").config();
const app = express();
const SECRET_KEY = "QDw^d2+qu/!2?~Uf";

app.use(cors());

// OR Allow specific origin
app.use(cors({ origin: "http://localhost:3000" }));

app.use(express.json());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: 'true',
    port: 465,
    auth: {
        user : 'amitmoorjani92@gmail.com',
        pass : 'xddrynyefuxymyjq'
    },
    tls: {
        rejectUnauthorized: false, // Add this line to allow self-signed certificates
    },
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await collection.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ message: "Invalid email" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password." });
        }

        if (user.verification === false && user.role === "admin"){
            return res.status(400).json({message: "Please verify your email first"})
        }

        if (user.role !== "admin") {
            return res.status(400).json({ message: "You are not allowed to login from here" });
        }

        res.status(200).json({ message: "Login successful!" });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


app.post("/signup", async (req, res) => {
    try{
        const hashedPassword = await bcrypt.hash( req.body.password, 10);
        const userEmail = req.body.email;
        const token = jwt.sign({ userEmail }, SECRET_KEY, { expiresIn: "1h" });
        const data = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword,
            role: req.body.role,
            emailVerificationToken: token
        }

        const existingUser = await collection.findOne({email: data.email});
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists. Please use a different email." });
        }
        
        const verificationLink = `http://localhost:5000/verify-email?token=${token}`;
        // For email varificationn
        const info = await transporter.sendMail({
            from: 'amitmoorjani92@gmail.com', // sender address
            to: userEmail, // list of receivers
            subject: "Email Verifation", // Subject line
            text: "Please Verify the email", // plain text body
            html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
        });

        const userData = await collection.insertOne(data);

        res.status(201).json({ message: "User added successfully", user: userData, info });
        // res.json(info);
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Route to verify email
app.get('/verify-email', async (req, res) => {

    const { token } = req.query; // Get the token from the query parameters

  try {
    // Find the user with the matching token
    const user = await collection.findOne({ emailVerificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Update the user's verification status
    user.verification = true;
    user.emailVerificationToken = undefined; // Clear the token
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('Error verifying email:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const port = 5000;
app.listen(port , () => {
    console.log(`Server is running on Port: ${port}`);
})