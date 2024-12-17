import { useRouter } from "next/router";
import { useState, useEffect } from "react";

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

  const storeNames = Object.keys(data || {});
  const defaultCategories = Object.keys(data[storeName] || {});

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

      const originalData = data[store] || {};
      // Initialize categories with levels set to null
      const updatedCategories = Object.keys(originalData).reduce(
        (acc, category) => {
          acc[category] = null;
          return acc;
        },
        {}
      );
      setCategories(updatedCategories);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("An error occurred while fetching data.");
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

    const categoriesWithTimeStamp = {
      ...categories,
      lastUpdated: timeStamp,
    };

    const updatedData = {
      ...freshDataJson,
      [storeName]: categoriesWithTimeStamp,
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

            return (
              <div
                key={category}
                style={{
                  marginBottom: "10px",
                  gap: 20,
                  alignItems: "center",
                  // hide if storeName is not in storesWithShoes
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
                  {category}
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
          <button
            onClick={handleSubmit}
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
            }}
          >
            Submit
          </button>
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
