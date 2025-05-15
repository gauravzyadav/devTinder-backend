const express = require("express");
const app = express();
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);

connectDB()
  .then(() => {
    console.log("Database conection established..."); // first connect to your database
    app.listen(3000, () => {
      console.log("Server is successfully listening on port 3000.."); //then listen to the server on 30000
    });
  })
  .catch((err) => {
    console.log("Database cannot be connected!!", err);
  });
