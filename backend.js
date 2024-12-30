const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const userRoute = require("./routes/userRoute");
const redis = require("redis");

const app = express();
const dotenv = require("dotenv");
dotenv.config();
const helmet = require("helmet");

app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin" }, // Adjust as needed
    crossOriginEmbedderPolicy: false, // Disable if you're not using SharedArrayBuffer
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose
  .connect("mongodb://mongo:27017/mydatabase")
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Failed to connect to MongoDB:", error));

// Initialize Redis client
const redisHost = process.env.REDIS_HOST || "localhost";
const redisPort = process.env.REDIS_PORT || 6379;
const redisClient = redis.createClient({
  socket: {
    host: redisHost,
    port: redisPort,
  },
});

redisClient
  .connect()
  .then(() => {
    console.log("Connected to Redis");
    app.locals.redisClient = redisClient; // Add redisClient to app.locals after connection
  })
  .catch((err) => console.error("Redis connection error:", err));

// Register routes
app.use("/api", userRoute)

app.listen(3000, () => {
  console.log("server started");
});
