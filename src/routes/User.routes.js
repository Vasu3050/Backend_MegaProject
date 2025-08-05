import { Router } from "express";
import 
{
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImg,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/User.controler.js";
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

router.route("/change-password").post(verifyJWT,
  changePassword,
);

router.route("/current-user").get(verifyJWT,
  getCurrentUser
);

router.route("/update-account").patch(
  updateAccountDetails
);

router.route("/update-avatar").patch(
  verifyJWT,
  upload.single("avatar"),
  updateUserAvatar
);

router.route("/update-coverImg").patch(
  verifyJWT,
  upload.single("coverImg"),
  updateUserCoverImg
);

router.route("/channel/:username").get(
  getUserChannelProfile
)

router.route("/watch-history").get(
  verifyJWT,
  getWatchHistory
);




//https://localhost:8000/api/v1.0/users/register

export default router;
