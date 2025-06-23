const express = require("express")
const mongoose = require("mongoose") // Added missing import
const app = express()
const connectDB = require("./config/database")
const cookieParser = require("cookie-parser")
const cors = require("cors")
require("dotenv").config()
const http = require("http")

// Serverless connection management
let isConnected = false

const connectToDatabase = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return
  }

  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB()
    }
    isConnected = true
    console.log("Database connection established for serverless...")
  } catch (error) {
    console.error("Database connection failed:", error)
    isConnected = false
    throw error
  }
}

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Local development
      "https://your-frontend-name.vercel.app", // Add your frontend URL after deployment
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
)

app.use(express.json())
app.use(cookieParser())

// Database connection middleware - MOVED BEFORE ROUTES
app.use(async (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    try {
      await connectToDatabase()
    } catch (error) {
      console.error("Database middleware error:", error)
      return res.status(500).json({
        error: "Database connection failed",
        message: error.message,
      })
    }
  }
  next()
})

// Health check endpoint - moved up for early access
app.get("/", (req, res) => {
  res.json({
    message: "DevTinder Backend is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

// Test database connection endpoint
app.get("/test-db", async (req, res) => {
  try {
    await connectToDatabase()

    // Test a simple query to verify connection
    const collections = await mongoose.connection.db.listCollections().toArray()

    res.json({
      success: true,
      message: "Database connected successfully",
      connectionState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      collections: collections.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Database connection failed",
      message: error.message,
      connectionState: mongoose.connection.readyState,
    })
  }
})

// Route imports
const authRouter = require("./routes/auth")
const profileRouter = require("./routes/profile")
const requestRouter = require("./routes/request")
const userRouter = require("./routes/user")
const initializeSocket = require("./utils/socket")
const chatRouter = require("./routes/chat")
const uploadRouter = require("./routes/upload")

// Routes - after middleware
app.use("/", authRouter)
app.use("/", profileRouter)
app.use("/", requestRouter)
app.use("/", userRouter)
app.use("/", chatRouter)
app.use("/upload", uploadRouter)

const server = http.createServer(app)
initializeSocket(server)

// For local development
if (process.env.NODE_ENV !== "production") {
  connectDB()
    .then(() => {
      console.log("Database connection established...")
      server.listen(process.env.PORT || 3000, () => {
        console.log("Server is successfully listening on port 3000..")
      })
    })
    .catch((err) => {
      console.log("Database cannot be connected!!", err)
    })
}

module.exports = app
