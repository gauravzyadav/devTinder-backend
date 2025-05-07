const express = require("express");

const app = express();

const { adminAuth } = require("./middleware/auth");

app.use("/admin", adminAuth);

app.use("/admin/name",adminAuth, (req,res) => {
    res.send("admin name is given");
});
app.use("/admin/getAllData",adminAuth, (req,res) => {
    res.send("All data are given");
});


app.listen(3000, ()=> {
    console.log("Server is successfully listening on port 3000..")
});