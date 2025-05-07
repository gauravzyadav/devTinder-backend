const express = require("express");
const app = express();
const connectDB = require("./config/database");
const User = require("./models/user");

app.post("/signup" , async (req,res)=> {
    // Creating a new instance of a user model
    const user = new User({
        firstName: "Aksay",
        lastName: "Saini",
        emailId: "Akasay@gmail.com",
        password: "abcdd",
    });

    try{
        await user.save();
        res.send("User Added Successfully!");
    }catch (err) {
        res.status(400).send("Error saving the user:" + err.message);
    }
    
});

connectDB()
.then(()=> {
    console.log("Database conection established...");    // first connect to your database 
    app.listen(3000, ()=> {
        console.log("Server is successfully listening on port 3000..")      //then listen to the server on 30000
    });
})
.catch(err =>{
    console.log("Database cannot be connected!!");
});

