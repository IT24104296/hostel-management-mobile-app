const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({

  studentName:{
    type:String,
    required:true
  },

  amount:{
    type:Number,
    required:true
  },

  status:{
    type:String,
    enum:["paid","pending"],
    default:"pending"
  },

  paymentMethod:{
    type:String,
    enum:["Cash","Bank Transfer","Key Money"]
  },

  // Legacy fields present in existing Atlas records
  method: {
    type: String,
  },

  paymentDate:{
    type:Date,
    default:Date.now
  },

  // Legacy date fields present in existing Atlas records
  paidDate: {
    type: Date,
  },
  dueDate: {
    type: Date,
  }

});

module.exports = mongoose.model("Payment",paymentSchema);