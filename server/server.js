const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors");
require("dotenv").config();

const agentRoutes = require("./routes/agentRoutes");
const postRoutes = require("./routes/postRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const commentRoutes = require("./routes/commentRoutes");



const app=express();

app.use(cors());
app.use(express.json());
app.use("/api/agents", agentRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/comments", commentRoutes);

app.get("/",(req,res)=>{
  res.status(200).json({
    message:"AI Agent social Network APi is running",
    status:"success",
  });
});

const connectDB= async()=>{
  try{
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB connected successfully");
    const PORT= process.env.PORT||5000;
    app.listen(PORT,()=>{
      console.log(`Server running on port ${PORT}`);
    });
  }
  catch(error){
    console.log("MongoDB connection failed: ",error.message);
    process.exit(1);
  }
};

connectDB();