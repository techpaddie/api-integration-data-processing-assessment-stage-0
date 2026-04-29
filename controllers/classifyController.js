const { validateNameQuery } = require("../utils/validator");
const { fetchGenderizePrediction } = require("../services/genderizeService");

async function classifyName(req, res, next) {
  const { name } = req.query;
  const validation = validateNameQuery(name);

  if (!validation.isValid) {
    return res.status(validation.statusCode).json({
      status: "error",
      message: validation.message
    });
  }

  try {
    const genderizeData = await fetchGenderizePrediction(validation.value);
    const sampleSize = genderizeData?.count ?? 0;
    const probability = Number(genderizeData?.probability ?? 0);
    const gender = genderizeData?.gender ?? null;
    const normalizedName = genderizeData?.name ?? validation.value;

    if (!gender || !sampleSize) {
      return res.status(200).json({
        status: "error",
        message: "No prediction available for the provided name"
      });
    }

    const processedData = {
      name: normalizedName,
      gender,
      probability,
      sample_size: sampleSize,
      is_confident: probability >= 0.7 && sampleSize >= 100,
      processed_at: new Date().toISOString()
    };

    return res.status(200).json({
      status: "success",
      data: processedData
    });
  } catch (error) {
    if (error && error.isExternalServiceError) {
      return res.status(502).json({
        status: "error",
        message: "Failed to fetch data from external API"
      });
    }

    return next(error);
  }
}

module.exports = {
  classifyName
};
