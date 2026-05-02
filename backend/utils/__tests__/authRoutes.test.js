const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = require("../../app");
const User = require("../../models/UserAuth/User");

jest.mock("../../models/UserAuth/User");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("Auth Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "testsecret";
  });

  describe("POST /api/auth/signup", () => {
    test("should reject missing fields", async () => {
      const res = await request(app).post("/api/auth/signup").send({
        name: "",
        email: "",
        password: "",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/required/i);
    });

    test("should reject invalid email", async () => {
      const res = await request(app).post("/api/auth/signup").send({
        name: "shihar_01",
        email: "wrong-email",
        password: "123456",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/email/i);
    });

    test("should reject short password", async () => {
      const res = await request(app).post("/api/auth/signup").send({
        name: "shihar_01",
        email: "shihar@gmail.com",
        password: "123",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/password/i);
    });

    test("should reject duplicate email", async () => {
      User.findOne.mockResolvedValueOnce({ _id: "u1" });

      const res = await request(app).post("/api/auth/signup").send({
        name: "shihar_01",
        email: "shihar@gmail.com",
        password: "123456",
      });

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toMatch(/email/i);
    });

    test("should signup successfully", async () => {
      User.findOne.mockResolvedValueOnce(null);
      bcrypt.hash.mockResolvedValueOnce("hashedPassword");
      User.create.mockResolvedValueOnce({
        _id: "u1",
        name: "shihar_01",
        email: "shihar@gmail.com",
        phone: "",
      });
      jwt.sign.mockReturnValueOnce("fake-jwt-token");

      const res = await request(app).post("/api/auth/signup").send({
        name: "shihar_01",
        email: "shihar@gmail.com",
        password: "123456",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.token).toBe("fake-jwt-token");
      expect(res.body.user.name).toBe("shihar_01");
    });
  });

  describe("POST /api/auth/login", () => {
    test("should reject missing username or password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        username: "",
        password: "",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/required/i);
    });

    test("should reject invalid username format", async () => {
      const res = await request(app).post("/api/auth/login").send({
        username: "ab",
        password: "123456",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/username/i);
    });

    test("should reject wrong username", async () => {
      User.findOne.mockResolvedValueOnce(null);

      const res = await request(app).post("/api/auth/login").send({
        username: "shihar_01",
        password: "123456",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/invalid credentials/i);
    });

    test("should reject wrong password", async () => {
      User.findOne.mockResolvedValueOnce({
        _id: "u1",
        name: "shihar_01",
        email: "shihar@gmail.com",
        passwordHash: "hashedPassword",
      });
      bcrypt.compare.mockResolvedValueOnce(false);

      const res = await request(app).post("/api/auth/login").send({
        username: "shihar_01",
        password: "wrongpass",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/invalid credentials/i);
    });

    test("should login successfully", async () => {
      User.findOne.mockResolvedValueOnce({
        _id: "u1",
        name: "shihar_01",
        email: "shihar@gmail.com",
        phone: "",
        passwordHash: "hashedPassword",
      });
      bcrypt.compare.mockResolvedValueOnce(true);
      jwt.sign.mockReturnValueOnce("fake-jwt-token");

      const res = await request(app).post("/api/auth/login").send({
        username: "shihar_01",
        password: "123456",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBe("fake-jwt-token");
      expect(res.body.user.name).toBe("shihar_01");
    });
  });
});