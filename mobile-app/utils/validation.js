const validateContract = ({
  name,
  studentId,
  contactNumber,
  roomNumber,
  moveInDate,
  duration,
}) => {
  const errors = {};

  // NAME
  if (!name) {
    errors.name = "Name required";
  } else if (!/^[A-Za-z ]+$/.test(name)) {
    errors.name = "Only letters allowed";
  }

  // STUDENT ID
  if (!studentId) {
    errors.studentId = "ID required";
  } else if (!/^HS\d{6}$/.test(studentId)) {
    errors.studentId = "Invalid ID";
  }

  // CONTACT
  if (!contactNumber) {
    errors.contactNumber = "Contact required";
  } else if (!/^\d{10}$/.test(contactNumber)) {
    errors.contactNumber = "Invalid number";
  }

  // ROOM
  if (!roomNumber) {
    errors.roomNumber = "Room required";
  } else if (!/^\d+$/.test(roomNumber)) {
    errors.roomNumber = "Numbers only";
  }

  // DATE
  if (!moveInDate) {
    errors.moveInDate = "Date required";
  }

  // DURATION
  if (!duration) {
    errors.duration = "Duration required";
  } else if (isNaN(duration) || Number(duration) <= 0) {
    errors.duration = "Invalid duration";
  }

  return errors;
};

module.exports = { validateContract };