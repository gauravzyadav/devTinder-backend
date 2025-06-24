const express = require("express");
const app = express();
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require('dotenv').config();
const http = require("http");

// Logging middleware for all requests
// app.use((req, res, next) => {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
//   console.log("Cookies:", req.cookies);
//   next();
// });

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // ✅ allow PATCH
    credentials: true,
  })
);


app.use(express.json());
app.use(cookieParser());

// 🔧 ADD THIS: Root route to show API is working
app.get("/", (req, res) => {
  res.json({
    message: "DevTinder Backend API is running! 🚀",
    status: "success",
    endpoints: {
      auth: "/signup, /login, /logout",
      profile: "/profile/view, /profile/edit",
      requests: "/sendConnectionRequest, /user/requests/received",
      connections: "/user/connections",
      feed: "/feed",
      chat: "/chat",
      upload: "/upload",
    },
    documentation: "Add your API documentation URL here",
  })
})

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chat");
const uploadRouter = require("./routes/upload");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);
app.use("/upload", uploadRouter);

const server = http.createServer(app);
initializeSocket(server);


connectDB()
  .then(() => {
    console.log("Database conection established..."); // first connect to your database
    server.listen(process.env.PORT, () => {
      console.log("Server is successfully listening on port 3000.."); //then listen to the server on 30000
    });
  })
  .catch((err) => {
    console.log("Database cannot be connected!!", err);
  });