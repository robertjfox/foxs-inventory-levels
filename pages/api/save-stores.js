import { REQUIRED_FIELDS } from "../../constants/fields";

function validateAndSanitizeData(data) {
  const sanitizedData = {};

  for (const storeName in data) {
    sanitizedData[storeName] = {};

    // Ensure all required fields are present
    for (const field of REQUIRED_FIELDS) {
      sanitizedData[storeName][field] = data[storeName][field] || null;
    }

    // Remove any extra fields that are not in REQUIRED_FIELDS
    // This ensures we only save the standardized structure
  }

  return sanitizedData;
}

export default async function handler(req, res) {
  try {
    // Validate and sanitize the incoming data
    const sanitizedData = validateAndSanitizeData(req.body);

    console.log(
      "Saving sanitized data:",
      JSON.stringify(sanitizedData, null, 2)
    );

    // push to jsonbin.io
    const response = await fetch(
      "https://api.jsonbin.io/v3/b/675c951cad19ca34f8daad68",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key":
            "$2a$10$LccuDAOpJD6AgjRfUqg8.eaLJWHyUQ8wKfcdmHi1Oggqk0ex9Gg8m",
        },
        body: JSON.stringify(sanitizedData),
      }
    );

    if (response.ok) {
      console.log("Data saved successfully with standardized fields");
      return res.status(200).json({
        success: true,
        message: "Data saved with standardized fields",
        fields: REQUIRED_FIELDS,
      });
    } else {
      console.error(
        "Failed to save data:",
        response.status,
        response.statusText
      );
      return res.status(500).json({
        success: false,
        error: "Failed to save to JSONBin",
      });
    }
  } catch (error) {
    console.error("Error in save-stores:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
