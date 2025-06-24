#!/usr/bin/env node

import fetch from "node-fetch";
import dotenv from "dotenv";
import { REQUIRED_FIELDS } from "./constants/fields.js";

dotenv.config();

const JSONBIN_ID = "675c951cad19ca34f8daad68";
const MASTER_KEY =
  "$2a$10$LccuDAOpJD6AgjRfUqg8.eaLJWHyUQ8wKfcdmHi1Oggqk0ex9Gg8m";

async function resetInventoryData() {
  try {
    console.log("Fetching current data from JSONBin...");

    // Fetch current data
    const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}`, {
      headers: {
        "X-Master-Key": MASTER_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch data: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const currentData = data.record;

    console.log("Current data structure:");
    console.log(JSON.stringify(currentData, null, 2));

    // Reset all values to null while preserving structure with standardized fields
    const resetData = {};

    for (const storeName in currentData) {
      resetData[storeName] = {};

      // Ensure all required fields are present and set to null
      for (const field of REQUIRED_FIELDS) {
        resetData[storeName][field] = null;
      }
    }

    console.log("\nResetting data to standardized structure:");
    console.log(JSON.stringify(resetData, null, 2));

    // Save the reset data back to JSONBin
    console.log("\nSaving reset data to JSONBin...");

    const saveResponse = await fetch(
      `https://api.jsonbin.io/v3/b/${JSONBIN_ID}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": MASTER_KEY,
        },
        body: JSON.stringify(resetData),
      }
    );

    if (!saveResponse.ok) {
      throw new Error(
        `Failed to save data: ${saveResponse.status} ${saveResponse.statusText}`
      );
    }

    const saveResult = await saveResponse.json();
    console.log("✅ Data successfully reset with standardized fields!");
    console.log("Updated record ID:", saveResult.metadata.id);
    console.log("All stores now have fields:", REQUIRED_FIELDS.join(", "));
  } catch (error) {
    console.error("❌ Error resetting inventory data:", error.message);
    process.exit(1);
  }
}

// Run the script
resetInventoryData();
