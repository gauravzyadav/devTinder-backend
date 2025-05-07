const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect(
        "mongodb+srv://gauravyadav9182:Gx13PRzauJ7UzUrP@cluster0.mvevu0e.mongodb.net/devTinder"
    );
};

module.exports = connectDB;