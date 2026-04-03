import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    name : {
        type : String,
        required : true
    },
    phone : {
        type : String,
        required : true
    }
},{timestamps : true})

const Contacts = mongoose.model("Contacts",contactSchema);
export default Contacts;