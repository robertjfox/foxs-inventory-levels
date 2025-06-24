import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import {
  REQUIRED_FIELDS,
  USER_SETTABLE_FIELDS,
  FIELD_DISPLAY_NAMES,
} from "../constants/fields";

// Stores that carry shoes and should show the shoes input
const storesWithShoes = [
  "Mineola",
  "Huntington",
  "Skokie",
  "Atlanta",
  "Ridgewood",
  "Brooklyn",
];

export default function MobileStoreSteps() {
  const router = useRouter();

  // query params storeName
  const storeFromParams = router.query.store;

  const [data, setData] = useState({});
  const [storeName, setStoreName] = useState("");
  const [categories, setCategories] = useState({});
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);

  const storeNames = Object.keys(data || {});

  // Use standardized fields instead of dynamic categories
  const defaultCategories = REQUIRED_FIELDS;

  // Check if all required categories are set (excluding shoes for stores without shoes)
  const allCategoriesSet = USER_SETTABLE_FIELDS.filter(
    (field) => field !== "notes"
  ) // Notes is optional
    .filter(
      (field) => !(field === "shoes" && !storesWithShoes.includes(storeName))
    ) // Exclude shoes for stores without shoes
    .every((c) => categories[c]);

  // Skip step 1 if storeFromParams is present
  useEffect(() => {
    if (storeFromParams) {
      setStoreName(storeFromParams);
      handleFetchData(storeFromParams);
      setStep(2);
    } else {
      // Fetch initial data for store list
      fetchInitialData();
    }
  }, [storeFromParams]);

  const fetchInitialData = async () => {
    try {
      const response = await fetch("/api/data");
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      alert("An error occurred while loading stores.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchData = async (store) => {
    try {
      const response = await fetch("/api/data");
      const data = await response.json();
      setData(data);

      // Initialize categories with standardized fields set to null
      const updatedCategories = REQUIRED_FIELDS.reduce((acc, category) => {
        acc[category] = null;
        return acc;
      }, {});
      setCategories(updatedCategories);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const handleStoreNameSubmit = async () => {
    if (!storeName) {
      alert("Please select a store name.");
      return;
    }

    await handleFetchData(storeName);
    setStep(2);
  };

  const handleCategoryChange = (category, level) => {
    setCategories((prev) => ({
      ...prev,
      [category]: level,
    }));
  };

  const handleSubmit = async () => {
    const timeStamp = new Date().toISOString();

    // fetch data from api to get the latest data
    const freshData = await fetch("/api/data");
    const freshDataJson = await freshData.json();

    // Ensure we only save standardized fields
    const standardizedCategories = {};
    REQUIRED_FIELDS.forEach((field) => {
      if (field === "lastUpdated") {
        standardizedCategories[field] = timeStamp;
      } else if (field === "shoes" && !storesWithShoes.includes(storeName)) {
        // Force shoes to null for stores that don't carry shoes
        standardizedCategories[field] = null;
      } else {
        standardizedCategories[field] = categories[field];
      }
    });

    const updatedData = {
      ...freshDataJson,
      [storeName]: standardizedCategories,
    };

    try {
      const response = await fetch("/api/save-stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (response.ok) {
        setData(updatedData);
        setStep(3);
      } else {
        alert("Failed to save data.");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("An error occurred while saving the data.");
    }
  };

  const getBackgroundColor = (level) => {
    switch (level) {
      case "light":
        return "#d1f5d3";
      case "medium":
        return "#fff3cd";
      case "heavy":
        return "#ffdede";
      default:
        return "#fff";
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "400px",
        margin: "auto",
      }}
    >
      {step === 1 && (
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>
            Select Store Name
          </h1>

          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "#666",
                fontSize: "1.1em",
              }}
            >
              Loading stores...
            </div>
          ) : (
            <>
              <select
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "15px",
                  marginBottom: "20px",
                  borderRadius: "8px",
                  border: "2px solid #e9ecef",
                  fontSize: "1.1em",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                }}
              >
                <option value="">Select Store</option>
                {storeNames.sort().map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>

              <button
                onClick={handleStoreNameSubmit}
                disabled={!storeName}
                style={{
                  width: "100%",
                  padding: "15px",
                  backgroundColor: storeName ? "#0070f3" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: storeName ? "pointer" : "not-allowed",
                  fontSize: "1.2em",
                  fontWeight: "bold",
                  transition: "background-color 0.2s ease",
                }}
              >
                {storeName
                  ? `Continue with ${storeName}`
                  : "Select a Store First"}
              </button>
            </>
          )}
        </div>
      )}

      {step === 2 && (
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>
            Set Category Levels
          </h1>
          {defaultCategories.map((category) => {
            if (category === "lastUpdated") return null;

            // Handle notes field differently (textarea instead of dropdown)
            if (category === "notes") {
              return (
                <div
                  key={category}
                  style={{
                    marginTop: "30px",
                    marginBottom: "15px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <label
                    style={{
                      marginBottom: "8px",
                      fontSize: "2rem",
                      fontWeight: "bold",
                    }}
                  >
                    {FIELD_DISPLAY_NAMES[category] || category} (Optional)
                  </label>
                  <textarea
                    value={categories[category] || ""}
                    onChange={(e) =>
                      handleCategoryChange(category, e.target.value)
                    }
                    maxLength={100}
                    placeholder="Add any additional notes here..."
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      fontSize: "1.2em",
                      minHeight: "80px",
                      resize: "vertical",
                      fontFamily: "Arial, sans-serif",
                      boxSizing: "border-box",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "0.9em",
                      color: "#666",
                      marginTop: "5px",
                      textAlign: "right",
                    }}
                  >
                    {(categories[category] || "").length}/100 characters
                  </div>
                </div>
              );
            }

            // Handle inventory level fields (apparel, shoes, jewelery, bags)
            return (
              <div
                key={category}
                style={{
                  marginBottom: "10px",
                  gap: 20,
                  alignItems: "center",
                  display:
                    category === "shoes" && !storesWithShoes.includes(storeName)
                      ? "none"
                      : "flex",
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    width: 200,
                    fontSize: "1.5em",
                  }}
                >
                  {FIELD_DISPLAY_NAMES[category] || category}
                </label>
                <select
                  value={categories[category] || ""}
                  onChange={(e) =>
                    handleCategoryChange(category, e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                    backgroundColor: getBackgroundColor(categories[category]),
                    fontSize: "1.5em",
                  }}
                >
                  <option value="">Select Level</option>
                  <option value="light">Light</option>
                  <option value="medium">Medium</option>
                  <option value="heavy">Heavy</option>
                </select>
              </div>
            );
          })}
          {!loading && (
            <button
              onClick={handleSubmit}
              disabled={!allCategoriesSet}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#0070f3",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginTop: "20px",
                fontSize: "1.5em",
                opacity: allCategoriesSet ? 1 : 0.5,
                pointerEvents: allCategoriesSet ? "auto" : "none",
              }}
            >
              Submit
            </button>
          )}
        </div>
      )}

      {step === 3 && (
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>
            Thank you for your submission!
          </h1>

          <div
            style={{
              textAlign: "center",
              marginTop: "30px",
              padding: "20px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              border: "1px solid #e9ecef",
            }}
          >
            <p
              style={{
                fontSize: "1.1em",
                marginBottom: "20px",
                color: "#333",
              }}
            >
              If you need anything else - text Robert
            </p>

            <a
              href="sms:5162824831"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                backgroundColor: "#28a745",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "8px",
                fontSize: "1.1em",
                fontWeight: "bold",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#218838";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#28a745";
              }}
            >
              📱 Text Robert
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
