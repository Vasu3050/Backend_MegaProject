import { Router } from "express";
import registerUser from "../controllers/User.controler.js";
import {upload} from "../middlewares/multer.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1,
        },
        {
            name : "coverImg",
            maxCount : 1,
        }
    ]),
    registerUser)


//https://localhost:8000/api/v1.0/users/register

export default router;