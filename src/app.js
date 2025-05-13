const express = require("express");
const app = express();
const connectDB = require("./config/database");
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const validator = require("validator");

app.use(express.json());

// signup account
app.post("/signup", async (req, res) => {
  try {
    //Validate the data
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    //Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);
    //console.log(passwordHash);

    //Creating a new instance of the model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    await user.save();
    res.send("User Added Successfully!");
  } catch (err) {
    res.status(400).send("Error saving the user:" + err.message);
  }
});

// login account
app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    // is email id correct or not
    // if (!validator.isEmail(emailId)) {
    //   throw new Error("Invalid credentials");
    // }

    //is email id present in db
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }
    //is passord matches with th eemail id paasword in db
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      res.send("User login successfully!!");
    } else {
      res.send("Invalid credentials");
    }
  } catch (err) {
    res.status(400).send("Error saving the user:" + err.message);
  }
});

//Get user by email
app.get("/user", async (req, res) => {
  const userEmail = req.body.emailId;

  try {
    console.log(userEmail);
    const user = await User.findOne({ emailID: userEmail });
    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.send(user);
    }
  } catch (err) {
    res.status(404).send("Something went wrong");
  }
});

connectDB()
  .then(() => {
    console.log("Database conection established..."); // first connect to your database
    app.listen(3000, () => {
      console.log("Server is successfully listening on port 3000.."); //then listen to the server on 30000
    });
  })
  .catch((err) => {
    console.log("Database cannot be connected!!");
  });
