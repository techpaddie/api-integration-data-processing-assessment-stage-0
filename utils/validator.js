function validateNameQuery(name) {
  if (name === undefined || name === null) {
    return {
      isValid: false,
      statusCode: 400,
      message: "name query parameter is required"
    };
  }

  if (Array.isArray(name) || typeof name !== "string") {
    return {
      isValid: false,
      statusCode: 422,
      message: "name must be a string"
    };
  }

  if (name.trim() === "") {
    return {
      isValid: false,
      statusCode: 400,
      message: "name query parameter cannot be empty"
    };
  }

  return {
    isValid: true,
    statusCode: 200,
    value: name.trim()
  };
}

module.exports = {
  validateNameQuery
};
