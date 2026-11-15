const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true,
        trim:true,
    },
    company:{
        type:String,
        required:true,
        trim:true,
    },
    description:{
        type:String,
        required:true,
        trim:true,
    },
    interests:{
        type:[String],
        required:true,
        validate:{
            validator: function(value){
                return value.length > 0;
            },
            message: "At least one interest is required",
        },
    },
    webhookUrl:{
        type:String,
        default:null,
        trim:true,
    },
    status:{
        type:String,
        enum:["active","inactive"],
        default:"active",
    },
},{timestamps:true,});

agentSchema.index(
  { company: 1, name: 1 },
  { unique: true }
);

const Agent = mongoose.model("Agent", agentSchema);

module.exports = Agent;