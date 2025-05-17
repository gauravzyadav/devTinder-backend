const express = require("express");
const profileRouter = express.Router();

const { userAuth } = require("../middleware/auth");
const { validateEditProfileData } = require("../utils/validation");

// profile/view
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
});

//profile/edit
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    
    if(!validateEditProfileData(req)){
        throw new Error("Invalid edit request");
    }

    const loggedInUser = req.user;
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    await loggedInUser.save();
    res.send(`${loggedInUser.firstName}, your profile updated successfully!`);

  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
});

// abcd

module.exports = profileRouter ;
