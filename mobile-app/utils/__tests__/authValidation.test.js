import {
  isValidUsername,
  isValidEmail,
  isStrongEnoughPassword,
  validateSignupForm,
  validateLoginForm,
} from "../authValidation";

describe("Auth Validation", () => {
  test("accepts valid username", () => {
    expect(isValidUsername("shihar_01")).toBe(true);
  });

  test("rejects invalid username with spaces", () => {
    expect(isValidUsername("shi har")).toBe(false);
  });

  test("rejects username that is too short", () => {
    expect(isValidUsername("ab")).toBe(false);
  });

  test("accepts valid email", () => {
    expect(isValidEmail("shihar@gmail.com")).toBe(true);
  });

  test("rejects invalid email", () => {
    expect(isValidEmail("wrong-email")).toBe(false);
  });

  test("accepts strong enough password", () => {
    expect(isStrongEnoughPassword("123456")).toBe(true);
  });

  test("rejects short password", () => {
    expect(isStrongEnoughPassword("123")).toBe(false);
  });

  test("signup validation returns errors for invalid data", () => {
    const errors = validateSignupForm({
      username: "ab",
      email: "wrong-email",
      password: "12",
    });

    expect(errors.username).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
  });

  test("signup validation passes for valid data", () => {
    const errors = validateSignupForm({
      username: "shihar_01",
      email: "shihar@gmail.com",
      password: "123456",
    });

    expect(Object.keys(errors)).toHaveLength(0);
  });

  test("login validation returns errors for empty fields", () => {
    const errors = validateLoginForm({
      username: "",
      password: "",
    });

    expect(errors.username).toBeDefined();
    expect(errors.password).toBeDefined();
  });

  test("login validation passes for valid data", () => {
    const errors = validateLoginForm({
      username: "shihar_01",
      password: "123456",
    });

    expect(Object.keys(errors)).toHaveLength(0);
  });
});