const express = require("express");

const app = express();

//This will only handle the GET call to /user
app.get("/user",(req,res) => {
    res.send({firstname: "Gaurav" , lastname: "Yadav" });
});
//saving data to DB
app.post("/user",(req,res) => {
    res.send("Data saved succesfully to DB");
});
//
app.delete("/user",(req,res) => {
    res.send("Successfully deleted");
});


app.use("/hello",(req,res) => {
    res.send("Hello hello 2");
});

app.use("/test",(req,res) => {
    res.send("Hello form the test!");
});

app.use("/",(req,res) => {
    res.send("Hello hello 3");
});


app.listen(3000, ()=> {
    console.log("Server is successfully listening on port 3000..")
});