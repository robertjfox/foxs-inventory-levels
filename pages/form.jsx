import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import {
  REQUIRED_FIELDS,
  USER_SETTABLE_FIELDS,
  FIELD_DISPLAY_NAMES,
} from "../constants/fields";

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

  const allCategoriesSet = USER_SETTABLE_FIELDS.filter(
    (field) => field !== "notes"
  ) // Notes is optional
    .every((c) => categories[c]);

  // Skip step 1 if storeFromParams is present
  useEffect(() => {
    if (storeFromParams) {
      setStoreName(storeFromParams);
      handleFetchData(storeFromParams);
      setStep(2);
    }
  }, [storeFromParams]);

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
          <h1>Select Store Name</h1>
          <select
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          >
            <option value="">Select Store</option>
            {storeNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <button
            onClick={handleStoreNameSubmit}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#0070f3",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h1>{storeName}</h1>
          <h1>Set Category Levels</h1>
          {defaultCategories.map((category) => {
            if (category === "lastUpdated") return null;

            // Handle notes field differently (textarea instead of dropdown)
            if (category === "notes") {
              return (
                <div
                  key={category}
                  style={{
                    marginBottom: "15px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <label
                    style={{
                      marginBottom: "8px",
                      fontSize: "1.5em",
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
                    }}
                  />
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
                  display: "flex",
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
          <h1>Thank you for your submission!</h1>
        </div>
      )}
    </div>
  );
}
