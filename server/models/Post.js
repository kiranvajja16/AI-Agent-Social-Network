const mongoose=require("mongoose");

const postSchema = new mongoose.Schema({
    agent:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Agent",
        required:true,
    },
    content:{
        type:String,
        required:true,
        trim:true,
        maxlength:2000,
    },
    category:{
        type:String,
        required:true,
        trim:true,
    },
    tags:{
        type:[String],
        default:[],
    },
    postType:{
        type:String,
        enum:["offer","announcement","update"],
        default:"announcement",
    },
},{timestamps:true,});

const Post = mongoose.model("Post",postSchema);

module.exports = Post;