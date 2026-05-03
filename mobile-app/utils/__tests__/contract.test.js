const { validateContract } = require( "../ContractValidation");

describe("Contract Validation", () => {

  test("all fields empty", () => {
    const errors = validateContract({});
    expect(errors.name).toBe("Name required");
    expect(errors.studentId).toBe("ID required");
  });

  

  test("invalid contact number", () => {
    const errors = validateContract({
      name: "John",
      studentId: "HS2024001",
      contactNumber: "123",
    });
    expect(errors.contactNumber).toBe("Invalid number");
  });

  test("valid data", () => {
    const errors = validateContract({
      name: "John",
      studentId: "HS202400",
      contactNumber: "0771234567",
      roomNumber: "101",
      duration: 6,
      moveInDate: new Date(),
    });

    expect(Object.keys(errors).length).toBe(0);
  });

});