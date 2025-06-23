const express = require("express")
const app = express()
const connectDB = require("./config/database")
const cookieParser = require("cookie-parser")
const cors = require("cors")
require("dotenv").config()
const http = require("http")

// Logging middleware for all requests
// app.use((req, res, next) => {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
//   console.log("Cookies:", req.cookies);
//   next();
// });

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

const authRouter = require("./routes/auth")
const profileRouter = require("./routes/profile")
const requestRouter = require("./routes/request")
const userRouter = require("./routes/user")
const initializeSocket = require("./utils/socket")
const chatRouter = require("./routes/chat")
const uploadRouter = require("./routes/upload")

app.use("/", authRouter)
app.use("/", profileRouter)
app.use("/", requestRouter)
app.use("/", userRouter)
app.use("/", chatRouter)
app.use("/upload", uploadRouter)

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "DevTinder Backend is running!" })
})

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

// For Vercel deployment - connect to DB on each request
let isConnected = false

const connectToDatabase = async () => {
  if (isConnected) {
    return
  }

  try {
    await connectDB()
    isConnected = true
    console.log("Database connection established for serverless...")
  } catch (error) {
    console.error("Database connection failed:", error)
    throw error
  }
}

// Middleware to ensure DB connection for each request in production
app.use(async (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    try {
      await connectToDatabase()
    } catch (error) {
      return res.status(500).json({ error: "Database connection failed" })
    }
  }
  next()
})

// Export for Vercel
module.exports = app
