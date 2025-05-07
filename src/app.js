const express = require("express");

const app = express();

app.use("/user",
    (req,res,next) => {                      //route handler
    //res.send("1st response");               //route handler
    next();                                   //route handler
    },
    (req,res,next) => {
    //res.send("2nd response");
    next();
    },
    (req,res,next) => {
    res.send("3rd response");
    ;
    },
);


app.listen(3000, ()=> {
    console.log("Server is successfully listening on port 3000..")
});