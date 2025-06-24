const express = require("express");
const userRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

// 🔧 FIXED: Get all the pending connection request for the loggedIn user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA)

    // 🔧 NEW: Filter out requests where the sender was deleted
    const validRequests = connectionRequests.filter((req) => req.fromUserId !== null)

    res.json({
      message: "Data fetched successfully",
      data: validRequests,
    })
  } catch (err) {
    res.status(400).send("ERROR: " + err.message) // Fixed: res instead of req
  }
})

// 🔧 FIXED: This is your main problem - replace your current /user/connections with this
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA)

    // 🔧 NEW: Check for null users (deleted users) and filter them out
    const validConnections = connectionRequests.filter((row) => {
      return row.fromUserId !== null && row.toUserId !== null
    })

    // 🔧 NEW: Safely get the connected user
    const data = validConnections.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId
      }
      return row.fromUserId
    })

    res.json({ data })
  } catch (err) {
    console.error("Connection error:", err)
    res.status(400).json({ message: err.message })
  }
})

// 🔧 ADD THIS TO YOUR routes/user.js file (at the bottom, before module.exports)
userRouter.delete("/cleanup/bad-connections", userAuth, async (req, res) => {
  try {
    console.log("Starting cleanup...");
    
    const allRequests = await ConnectionRequest.find({});
    let deletedCount = 0;

    for (const request of allRequests) {
      const fromUserExists = await User.findById(request.fromUserId);
      const toUserExists = await User.findById(request.toUserId);

      if (!fromUserExists || !toUserExists) {
        await ConnectionRequest.findByIdAndDelete(request._id);
        deletedCount++;
        console.log("Deleted bad connection:", request._id);
      }
    }

    res.json({
      message: "Cleanup done!",
      deletedBadConnections: deletedCount
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId  toUserId");

    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.json({ data: users });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
module.exports = userRouter;