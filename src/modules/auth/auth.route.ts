import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router()

router.post("/signup", authController.signUpUsers)
router.post("/login", authController.signInUsers)

export const authRoute = router;