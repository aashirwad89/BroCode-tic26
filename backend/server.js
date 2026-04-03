import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./src/config/db.config.js";
import authRouter from "./src/routes/auth.routes.js";

dotenv.config({
    path : "./.env"     //exact .env path
});

const PORT = process.env.PORT || 5000
const app = express();

app.use(cors({
    origin : process.env.CROSS_ORIGIN,
    credentials : true
}))
app.use(express.urlencoded({extended : true}));
app.use(cookieParser());
app.use(express.json());

app.use("/api",authRouter);

app.get("/shadow",(req,res)=>{
    res.send("shadow-ai");
})
app.listen(PORT,()=>{
    console.log("connected..");
    connectDB();
})