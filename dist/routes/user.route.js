"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middlewares/auth");
const refreshAccessToken_controller_1 = require("../controllers/refreshAccessToken.controller");
const router = (0, express_1.Router)();
router.post("/register", user_controller_1.registerUser);
router.post("/login", user_controller_1.loginUser);
router.get("/me", auth_1.authenticateToken, user_controller_1.getMyProfile);
router.post("/refresh", refreshAccessToken_controller_1.refreshAccessToken);
router.post("/logout", auth_1.authenticateToken, user_controller_1.logoutUser);
exports.default = router;
//# sourceMappingURL=user.route.js.map