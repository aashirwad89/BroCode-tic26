import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    location : {
        latitude : Number,
        longitude : Number,
        required : true
    },
    message : {
        type : String,
        required : true
    },
    fileUrl : {
        type : String,
    }
},{timestamps : true})

const Alert = mongoose.model("Alert",alertSchema);
export default Alert;