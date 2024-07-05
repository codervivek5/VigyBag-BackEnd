const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const adminSchema = new Schema({
   email: {
       type: String,
       required: true,
       unique: true,
       trim: true,
       lowercase: true,
       match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
   },
   password: {
       type: String,
       required: true,
       minlength: 6,
   },
   });


const Admin = mongoose.model("Admin", adminSchema);


module.exports = Admin;
