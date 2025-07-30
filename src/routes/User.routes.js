import { Router } from "express";
import {registerUser, logOutUser, loginUser, refreshAccessToken, changePassword, getCurrentUser, updateAccountDetails,updateUserAvatar, updateUserCoverImg} from "../controllers/User.controler.js"
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/auth.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImg",
      maxCount: 1,
    },
  ]),
  registerUser,
);
router.route("/login").post( upload.none(),loginUser);

//secures routes
router.route("/logout").post(verifyJWT, logOutUser);

router.route("/refreshToken").post(refreshAccessToken);

//https://localhost:8000/api/v1.0/users/register

export default router;
