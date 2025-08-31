import { Router } from "express";
import {
  registerUser,
  loginUser,
  getMyProfile,
  logoutUser,
} from "../controllers/user.controller";
import { authenticateToken } from "../middlewares/auth";
import { refreshAccessToken } from "../controllers/refreshAccessToken.controller";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authenticateToken, getMyProfile);
router.post("/refresh", refreshAccessToken);
router.post("/logout", authenticateToken, logoutUser);

export default router;
