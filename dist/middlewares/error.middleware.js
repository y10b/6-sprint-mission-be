"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const customError_1 = require("../utils/customError");
const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // 에러 스택을 콘솔에 출력
    // 각 에러 타입별로 처리
    if (err instanceof customError_1.NotFoundError ||
        err instanceof customError_1.BadRequestError ||
        err instanceof customError_1.UnauthorizedError ||
        err instanceof customError_1.ForbiddenError ||
        err instanceof customError_1.InternalServerError) {
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
        });
    }
    // 예기치 않은 에러는 500으로 처리
    res.status(500).json({
        success: false,
        error: "서버 오류...",
        message: err.message,
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map