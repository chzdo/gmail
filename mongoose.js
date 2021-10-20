const mongoose = require("mongoose");



mongoose.connect("mongodb://localhost:27017/email").then((value)=> console.log("connected")).catch((err)=> console.log(err))