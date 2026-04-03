import mongoose from "mongoose";
const connectDB = () => {
    try {
        if(!process.env.MONGO_URL){
            throw new error("mongo url variable not present in dotenv file.");
        }
        mongoose.connect(process.env.MONGO_URL);
        console.log("database connected..");

    } catch (error) {
        console.log("error connecting database...");
    }
}
export default connectDB;