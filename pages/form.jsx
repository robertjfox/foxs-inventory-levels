import { useState, useEffect } from "react";

export default function MobileStoreSteps() {
  const [data, setData] = useState({});
  const [storeName, setStoreName] = useState("");
  const [categories, setCategories] = useState({});
  const [step, setStep] = useState(1);

  const storeNames = Object.keys(data || {});
  const defaultCategories = Object.keys(data[storeNames[0]] || {});

  // get the data from api/data

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/data");
      const data = await response.json();

      setData(data);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (step === 2 && storeName) {
      setCategories(data[storeName] || {});
    }
  }, [step, storeName]);

  const handleStoreNameSubmit = () => {
    if (!storeName) {
      alert("Please select a store name.");
      return;
    }
    setStep(2);
  };

  const handleCategoryChange = (category, level) => {
    setCategories((prev) => ({
      ...prev,
      [category]: { ...prev[category], level },
    }));
  };

  const handleSubmit = async () => {
    const updatedData = {
      ...data, // Preserve existing store data
      [storeName]: categories, // Update the selected store's data
    };

    try {
      const response = await fetch("/api/save-stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData), // Send the merged data
      });
      if (response.ok) {
        setData(updatedData); // Update the local state to reflect the changes
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
        // yellow
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
          <h1>Set Category Levels</h1>
          {/* // display store name */}
          <h2>{storeName}</h2>
          {defaultCategories.map((category) => (
            <div
              key={category}
              style={{
                marginBottom: "10px",
                display: "flex",
                gap: 20,
                alignItems: "center",
              }}
            >
              <label
                style={{ display: "block", marginBottom: "5px", width: 100 }}
              >
                {category}
              </label>
              <select
                value={categories[category]?.level || ""}
                onChange={(e) => handleCategoryChange(category, e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  backgroundColor: getBackgroundColor(
                    categories[category]?.level
                  ),
                }}
              >
                <option value="">Select Level</option>
                <option value="light">Light</option>
                <option value="medium">Medium</option>
                <option value="heavy">Heavy</option>
              </select>
            </div>
          ))}
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
            }}
          >
            Submit
          </button>
        </div>
      )}

      {/* // step 3 simple thank you */}
      {step === 3 && (
        <div>
          <h1>Thank you for your submission!</h1>
        </div>
      )}
    </div>
  );
}
