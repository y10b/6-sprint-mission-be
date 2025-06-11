class CustomError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
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

class BadRequestError extends CustomError {
  constructor(message = "잘못된 요청...") {
    super(message, 400);
  }
}

class UnauthorizedError extends CustomError {
  constructor(message = "권한이 없습니다.") {
    super(message, 401);
  }
}

class ForbiddenError extends CustomError {
  constructor(message = "권한이 없습니다.") {
    super(message, 403);
  }
}

class ConflictError extends CustomError {
  constructor(message = "리소스 충돌...") {
    super(message, 409);
  }
}

class InternalServerError extends CustomError {
  constructor(message = "서버 오류...") {
    super(message, 500);
  }
}

export {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  InternalServerError,
};
