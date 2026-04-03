import express from "express";
import { genOtp, verifyOtp, logOut } from "../controller/auth.controller.js";

const authRouter = express.Router();
authRouter.post("/send-otp",genOtp);
authRouter.post("/verify-otp",verifyOtp);
authRouter.post("/logout",logOut);

export default authRouter;