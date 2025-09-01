"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_middleware_1 = __importDefault(require("../middlewares/upload.middleware"));
const upload_controller_1 = require("../controllers/upload.controller");
const router = (0, express_1.Router)();
router.post("/", upload_middleware_1.default.single("image"), upload_controller_1.uploadImage);
router.post("/presigned", upload_controller_1.generatePresignedUrl);
exports.default = router;
//# sourceMappingURL=upload.route.js.map