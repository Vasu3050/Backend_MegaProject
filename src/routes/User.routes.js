import { Router } from "express";
import registerUser from "../controllers/User.controler.js";

const router = Router();

router.route("/register").post(registerUser)


//https://localhost:8000/api/v1.0/users/register

export default router;