import { useState, useEffect } from "react";

export const storeIdToThreeLetterMap = {
  MINEOLA: "M80",
  HUNTINGTON: "HUN",
  EASTCHESTER: "EAS",
  RIDGEWOOD: "RIG",
  SKOKIE: "SKO",
  WHIPPANY: "WHP",
  STAMFORD: "STA",
  ATLANTA: "ATL",
  "BOCA RATON": "BOC",
  AVENTURA: "AVN",
  BROOKLYN: "BKN",
  MARLBORO: "MLB",
  MINEOLA: "M79",
  "FOREST HILLS": "FHL",
  MANHATTAN: "MAN",
  "WEST BABYLON": "WBA",
  NEWTON: "NWT",
};

export default function Stores() {
  const [stores, setStores] = useState({});
  const [loading, setLoading] = useState(true);

  // if no level, make text color 0.5, if light make text white, if medium make text black
  const getCellTextColor = (level) => {
    switch (level) {
      case "light":
        return "black";
      case "medium":
        return "black";
      case "heavy":
        return "black";
      // grey
      default:
        return "#b3b3b3";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/data");
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        const sortedKeys = Object.keys(data).sort();
        let sortedData = sortedKeys.reduce((obj, key) => {
          obj[key] = data[key];
          return obj;
        }, {});

        // sort all categories alphabetically
        for (const storeName in sortedData) {
          sortedData[storeName] = Object.keys(sortedData[storeName])
            .sort()
            .reduce((obj, key) => {
              obj[key] = sortedData[storeName][key];
              return obj;
            }, {});
        }

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
        return "#5cb85c";
      case "medium": // dark gray
        return "#e2e3e5";
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
        maxWidth: 700,
        overflowX: "auto",
      }}
    >
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
                  {storeIdToThreeLetterMap[storeName.toUpperCase()]}
                </td>
                {Object.keys(stores[storeName]).map((category) => (
                  <td
                    key={category}
                    style={{
                      border: "1px solid #ccc",
                      padding: "5px",
                      // if level is null make text color 0.5
                      color: getCellTextColor(
                        stores[storeName][category].level
                      ),
                      fontWeight:
                        stores[storeName][category].level === "light"
                          ? "600"
                          : "normal",
                      backgroundColor: getBackgroundColor(
                        stores[storeName][category].level
                      ),
                    }}
                  >
                    {category}
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
