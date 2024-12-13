import { useState, useEffect } from "react";

export default function Stores() {
  const [stores, setStores] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/data");
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        const sortedKeys = Object.keys(data).sort();
        const sortedData = sortedKeys.reduce((obj, key) => {
          obj[key] = data[key];
          return obj;
        }, {});

        setStores(sortedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to load data. Check the console.");
      }
    };

    fetchData();
  }, []);

  const handleLevelChange = (storeName, category, value) => {
    setStores((prev) => ({
      ...prev,
      [storeName]: {
        ...prev[storeName],
        [category]: {
          ...prev[storeName][category],
          level: value,
        },
      },
    }));
  };

  const saveChanges = async () => {
    const response = await fetch("/api/save-stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stores),
    });

    if (response.ok) {
      alert("Data saved successfully!");
    } else {
      alert("Failed to save data.");
    }
  };

  if (loading) return <div>Loading...</div>;

  const getBackgroundColor = (level) => {
    switch (level) {
      case "light":
        return "#d4edda";
      case "medium":
        return "#ffeeba";
      case "heavy":
        return "#f8d7da";
      default:
        return "#ffffff";
    }
  };

  return (
    <div
      style={{
        padding: 0,
        fontFamily: "Arial, sans-serif",
        maxWidth: "100%",
        overflowX: "auto",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", textAlign: "center" }}>
        Editable Store Categories
      </h1>
      <button
        onClick={saveChanges}
        style={{
          padding: "10px 15px",
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginBottom: "20px",
          fontSize: "1rem",
          width: "100%",
        }}
      >
        Save Changes
      </button>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "center",
            fontSize: "0.9rem",
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "10px" }}>
                Store
              </th>
              {Object.keys(stores[Object.keys(stores)[0]]).map((category) => (
                <th
                  key={category}
                  style={{ border: "1px solid #ccc", padding: "10px" }}
                >
                  {category}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.keys(stores).map((storeName) => (
              <tr key={storeName}>
                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    backgroundColor: "#f9f9f9",
                    fontWeight: "bold",
                  }}
                >
                  {storeName}
                </td>
                {Object.keys(stores[storeName]).map((category) => (
                  <td
                    key={category}
                    style={{
                      border: "1px solid #ccc",
                      padding: "5px",
                      backgroundColor: getBackgroundColor(
                        stores[storeName][category].level
                      ),
                    }}
                  >
                    <select
                      value={stores[storeName][category].level || ""}
                      onChange={(e) =>
                        handleLevelChange(storeName, category, e.target.value)
                      }
                      style={{
                        width: "100%",
                        padding: "5px",
                        borderRadius: "3px",
                        border: "1px solid #ccc",
                        fontSize: "1rem",
                        backgroundColor: getBackgroundColor(
                          stores[storeName][category].level
                        ),
                      }}
                    >
                      <option value="">Select</option>
                      <option value="light">Light</option>
                      <option value="medium">Medium</option>
                      <option value="heavy">Heavy</option>
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          h1 {
            font-size: 1.2rem;
          }
          table {
            font-size: 0.7rem !important;
          }
          button {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}
