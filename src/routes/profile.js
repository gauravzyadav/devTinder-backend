const express = require("express");
const profileRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
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
    // console.log("PATCH /profile/edit called");
    // console.log("Cookies:", req.cookies);
    // console.log("Body:", req.body);
    // console.log("User:", req.user);
    
    if(!validateEditProfileData(req)){
        throw new Error("Invalid edit request");
    }

    const loggedInUser = req.user;
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    await loggedInUser.save();

    res.json({
      message: `${loggedInUser.firstName}, your profile updated successfuly`,
      data: loggedInUser,
    });

  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
});

// abcd

module.exports = profileRouter ;
