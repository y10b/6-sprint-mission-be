"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.ConflictError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.NotFoundError = void 0;
class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
    }
}
class NotFoundError extends CustomError {
    constructor(message = "잘못된 접근...") {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class BadRequestError extends CustomError {
    constructor(message = "잘못된 요청...") {
        super(message, 400);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends CustomError {
    constructor(message = "권한이 없습니다.") {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends CustomError {
    constructor(message = "권한이 없습니다.") {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class ConflictError extends CustomError {
    constructor(message = "리소스 충돌...") {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
class InternalServerError extends CustomError {
    constructor(message = "서버 오류...") {
        super(message, 500);
    }
}
exports.InternalServerError = InternalServerError;
//# sourceMappingURL=customError.js.map