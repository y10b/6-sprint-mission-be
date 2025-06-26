import { UserService } from "../src/services/user.service";
import { BadRequestError } from "../src/utils/customError";

// bcrypt 모킹
jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed-pass"),
  compare: jest.fn(),
}));

const bcrypt = require("bcrypt");

describe("UserService – 회원가입 & 로그인", () => {
  let service: UserService;
  let prismaMock: any;

  beforeEach(() => {
    service = new UserService();

    prismaMock = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    // private prisma 속성에 목 주입
    (service as any).prisma = prismaMock;
  });

  describe("register", () => {
    const baseInput = {
      email: "test@example.com",
      password: "1234",
      nickname: "tester",
    };

    it("정상적으로 회원가입된다", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null); // email check
      prismaMock.user.findUnique.mockResolvedValueOnce(null); // nickname check

      const createdUser = {
        id: 1,
        email: baseInput.email,
        nickname: baseInput.nickname,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        encryptedPassword: "hashed-pass",
        refreshToken: null,
      };
      prismaMock.user.create.mockResolvedValue(createdUser);

      const result = await service.register(
        baseInput.email,
        baseInput.password,
        baseInput.nickname
      );

      expect(prismaMock.user.create).toHaveBeenCalled();
      expect(result).toEqual({
        id: createdUser.id,
        email: createdUser.email,
        nickname: createdUser.nickname,
        image: createdUser.image,
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt,
      });
    });

    it("이메일이 중복되면 오류를 반환한다", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: 1 }); // email duplicated

      await expect(
        service.register(
          baseInput.email,
          baseInput.password,
          baseInput.nickname
        )
      ).rejects.toThrow(BadRequestError);

      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it("닉네임이 중복되면 오류를 반환한다", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null); // email ok
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: 2 }); // nickname dup

      await expect(
        service.register(
          baseInput.email,
          baseInput.password,
          baseInput.nickname
        )
      ).rejects.toThrow(BadRequestError);

      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    const email = "login@example.com";
    const password = "pw";

    it("정상적으로 로그인된다", async () => {
      const storedUser = {
        id: 1,
        email,
        nickname: "nick",
        encryptedPassword: "hashed-pass",
      };
      prismaMock.user.findUnique.mockResolvedValue(storedUser);
      bcrypt.compare.mockResolvedValue(true);

      const result = await service.login(email, password);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        password,
        storedUser.encryptedPassword
      );
      expect(result).toEqual({ user: storedUser });
    });

    it("존재하지 않는 이메일이면 실패한다", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.login(email, password)).rejects.toThrow(
        BadRequestError
      );
    });

    it("비밀번호가 틀리면 실패한다", async () => {
      const storedUser = {
        id: 1,
        email,
        nickname: "nick",
        encryptedPassword: "hashed-pass",
      };
      prismaMock.user.findUnique.mockResolvedValue(storedUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(service.login(email, password)).rejects.toThrow(
        BadRequestError
      );
    });
  });
});
