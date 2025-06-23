const mongoose = require("mongoose")

let isConnected = false

const connectDB = async () => {
  // If already connected, return early
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log("Using existing database connection")
    return mongoose.connection
  }

  try {
    // Close any existing connections in disconnected state
    if (mongoose.connection.readyState === 3) {
      await mongoose.disconnect()
    }

    // Use DB_CONNECTION_SECRET as per your environment variable
    const conn = await mongoose.connect(process.env.DB_CONNECTION_SECRET, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      bufferMaxEntries: 0,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      heartbeatFrequencyMS: 10000,
    })

    isConnected = true
    console.log(`MongoDB Connected: ${conn.connection.host}`)

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err)
      isConnected = false
    })

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected")
      isConnected = false
    })

    mongoose.connection.on("reconnected", () => {
      console.log("MongoDB reconnected")
      isConnected = true
    })

    return conn
  } catch (error) {
    console.error("Database connection failed:", error)
    isConnected = false
    throw error
  }
}

module.exports = connectDB
