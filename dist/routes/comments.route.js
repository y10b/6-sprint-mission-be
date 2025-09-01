"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comment_controller_1 = require("../controllers/comment.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// 댓글 수정
router.patch("/:id", auth_1.authenticateToken, comment_controller_1.updateComment);
// 댓글 삭제
router.delete("/:id", auth_1.authenticateToken, comment_controller_1.deleteComment);
exports.default = router;
//# sourceMappingURL=comments.route.js.map