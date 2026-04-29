const axios = require("axios");

const GENDERIZE_URL = "https://api.genderize.io";

async function fetchGenderizePrediction(name) {
  try {
    const response = await axios.get(GENDERIZE_URL, {
      params: { name },
      timeout: 5000
    });

    return response.data;
  } catch (error) {
    const serviceError = new Error("External service request failed");
    serviceError.isExternalServiceError = true;
    throw serviceError;
  }
}

module.exports = {
  fetchGenderizePrediction
};
