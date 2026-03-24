export const isValidSriLankanPhone = (phone) => {
  const cleaned = String(phone || "").replace(/\s+/g, "");
  return /^(?:\+94|94|0)?7\d{8}$/.test(cleaned);
};

export const isValidSriLankanNIC = (nic) => {
  const cleaned = String(nic || "").trim().toUpperCase();
  const oldNic = /^\d{9}[VX]$/;
  const newNic = /^\d{12}$/;
  return oldNic.test(cleaned) || newNic.test(cleaned);
};

export const validateStudentForm = (data) => {
  const errors = {};

  if (!data.fullName?.trim()) {
    errors.fullName = "Full name is required";
  } else if (data.fullName.trim().length < 3) {
    errors.fullName = "Full name must be at least 3 characters";
  }

  if (!data.nic?.trim()) {
    errors.nic = "NIC is required";
  } else if (!isValidSriLankanNIC(data.nic)) {
    errors.nic = "Invalid NIC format";
  }

  if (!data.phone?.trim()) {
    errors.phone = "Student phone is required";
  } else if (!isValidSriLankanPhone(data.phone)) {
    errors.phone = "Invalid phone number";
  }

  if (data.whatsapp?.trim() && !isValidSriLankanPhone(data.whatsapp)) {
    errors.whatsapp = "Invalid WhatsApp number";
  }

  if (!data.address?.trim()) {
    errors.address = "Address is required";
  } else if (data.address.trim().length < 5) {
    errors.address = "Address is too short";
  }

  if (!data.parentName?.trim()) {
    errors.parentName = "Parent name is required";
  } else if (data.parentName.trim().length < 3) {
    errors.parentName = "Parent name must be at least 3 characters";
  }

  if (!data.parentPhone?.trim()) {
    errors.parentPhone = "Parent phone is required";
  } else if (!isValidSriLankanPhone(data.parentPhone)) {
    errors.parentPhone = "Invalid parent phone number";
  }

  if (!["active", "inactive"].includes(String(data.status || "").toLowerCase())) {
    errors.status = "Invalid status";
  }

  if (!data.admissionDate) {
    errors.admissionDate = "Admission date is required";
  }

  if (data.admissionDate && data.leavingDate) {
    const admission = new Date(data.admissionDate);
    const leaving = new Date(data.leavingDate);

    if (leaving < admission) {
      errors.leavingDate = "Leaving date cannot be before admission date";
    }
  }

  return errors;
};