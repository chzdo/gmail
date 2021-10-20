const mongoose = require("mongoose");

module.exports = mongoose.model("users", new mongoose.Schema({  
    email: String,
    tokens: Object,
   
}))