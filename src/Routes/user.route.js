import { Router } from "express";
import upload from "../MiddleWares/multer.middleware.js"
import { loginUser,userLogOut,registerUser } from "../Controllers/user.controller.js";
import { verifyUser } from "../MiddleWares/authenication.middleware.js";
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
export default router;