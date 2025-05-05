const express = require("express");

const app = express();

app.use("/hello",(req,res) => {
    res.send("Hello hello 2");
});

app.use("/test",(req,res) => {
    res.send("Hello form the test!");
});

app.use((req,res) => {
    res.send("Hello form the server!");
});

app.listen(3000, ()=> {
    console.log("Server is successfully listening on port 3000..")
});