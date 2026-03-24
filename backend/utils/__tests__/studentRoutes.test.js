const request = require("supertest");
const app = require("../../app");
const Student = require("../../models/student/Student");

jest.mock("../../models/student/Student");

describe("Student Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should reject invalid NIC", async () => {
    const res = await request(app).post("/api/students").send({
      fullName: "Nethmi Perera",
      nic: "123",
      phone: "0712345678",
      parentName: "Piyal Perera",
      parentPhone: "0711111111",
      address: "Panadura",
      status: "active",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/NIC/i);
  });

  test("should reject invalid phone", async () => {
    const res = await request(app).post("/api/students").send({
      fullName: "Nethmi Perera",
      nic: "200563149536",
      phone: "1234",
      parentName: "Piyal Perera",
      parentPhone: "0711111111",
      address: "Panadura",
      status: "active",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/phone/i);
  });

  test("should reject duplicate NIC", async () => {
    Student.findOne.mockResolvedValueOnce({ _id: "abc123" });

    const res = await request(app).post("/api/students").send({
      fullName: "Nethmi Perera",
      nic: "200563149536",
      phone: "0712345678",
      parentName: "Piyal Perera",
      parentPhone: "0711111111",
      address: "Panadura",
      status: "active",
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/NIC/i);
  });

});