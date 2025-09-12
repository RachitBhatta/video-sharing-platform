import { Router } from "express";
import upload from "../MiddleWares/multer.middleware.js"
import { loginUser,
    userLogOut,
    registerUser,
    accessRefreshToken,
    changePassword,
    getCurrentUser,
    getWatchHistory,
    getChannelProfile,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage } from "../Controllers/user.controller.js";
import { verifyUser } from "../MiddleWares/authenication.middleware.js";
import { get } from "mongoose";
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
);
router.route("/login").post(loginUser);

router.route("/logout").post(verifyUser,userLogOut);
router.route("/refresh").post(accessRefreshToken);
router.route("/change-password").post(verifyUser,changePassword);
router.route("/current-user").get(verifyUser,getCurrentUser);
router.route("/watch-history").get(verifyUser,getWatchHistory);
router.route("/channel/:channel-profile").get(verifyUser,getChannelProfile);
router.route("/update-account").patch(verifyUser,updateAccountDetails);
router.route("/update-avatar").patch(verifyUser,upload.single("avatar"),updateUserAvatar);
router.route("/update-cover-image").patch(verifyUser,upload.single("coverImage"),updateUserCoverImage);
export default router;