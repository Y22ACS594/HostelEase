const mongoose = require("mongoose");

const roomAllocationSchema = new mongoose.Schema({

  student:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Student",
    required:true
  },

  room:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Room",
    required:true
  },

  bedNumber:{
    type:String,
    required:true
  },

  allocatedBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

  checkInDate:{
    type:Date,
    default:Date.now
  },

  checkOutDate:{
    type:Date
  },

  status:{
    type:String,
    enum:["active","checkedOut"],
    default:"active"
  }

},{timestamps:true});

roomAllocationSchema.index(
 { student:1, status:1 },
 { unique:true, partialFilterExpression:{ status:"active" } }
);

module.exports = mongoose.model("RoomAllocation",roomAllocationSchema);