import {
  isValidSriLankanNIC,
  isValidSriLankanPhone,
  validateStudentForm,
} from "../studentValidation";

describe("Student Validation", () => {
  test("accepts valid old NIC", () => {
    expect(isValidSriLankanNIC("200563567V")).toBe(true);
  });

  test("accepts valid new NIC", () => {
    expect(isValidSriLankanNIC("200563149536")).toBe(true);
  });

  test("rejects invalid NIC", () => {
    expect(isValidSriLankanNIC("12345")).toBe(false);
  });

  test("accepts valid Sri Lankan phone", () => {
    expect(isValidSriLankanPhone("0712345678")).toBe(true);
  });

  test("rejects invalid phone", () => {
    expect(isValidSriLankanPhone("1234")).toBe(false);
  });

  test("returns errors for invalid form", () => {
    const errors = validateStudentForm({
      fullName: "",
      nic: "123",
      phone: "111",
      whatsapp: "222",
      address: "ab",
      university: "",
      parentName: "",
      parentPhone: "333",
      status: "wrong",
      admissionDate: "2026-03-20",
      leavingDate: "2026-03-10",
    });

    expect(errors.fullName).toBeDefined();
    expect(errors.nic).toBeDefined();
    expect(errors.phone).toBeDefined();
    expect(errors.whatsapp).toBeDefined();
    expect(errors.address).toBeDefined();
    expect(errors.parentName).toBeDefined();
    expect(errors.parentPhone).toBeDefined();
    expect(errors.status).toBeDefined();
    expect(errors.leavingDate).toBeDefined();
  });

  test("passes valid form", () => {
    const errors = validateStudentForm({
      fullName: "Nethmi Perera",
      nic: "200563149536",
      phone: "0712345678",
      whatsapp: "0771234567",
      address: "22/B Samagi Road",
      university: "Colombo University",
      parentName: "Piyal Perera",
      parentPhone: "0711111111",
      status: "active",
      admissionDate: "2026-03-10",
      leavingDate: "2026-03-20",
    });

    expect(Object.keys(errors)).toHaveLength(0);
  });
});