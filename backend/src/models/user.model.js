import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    phone : {
        type : String,
        unique : true,
        required : [true,"phone number is required"],
        minLength : 8,
        maxLength : 12
    }
},{timestamps : true})
const User = mongoose.model("User",userSchema);
export default User;