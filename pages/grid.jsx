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

        // put lastUpdated at the end
        for (const storeName in sortedData) {
          const lastUpdated = sortedData[storeName].lastUpdated;
          delete sortedData[storeName].lastUpdated;
          sortedData[storeName].lastUpdated = lastUpdated;
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

  if (loading) return <div>Loading...</div>;

  const getBackgroundColor = (level) => {
    switch (level) {
      case "light":
        return "#5cb85c";
      case "medium": // dark grey
        return "#a9a9a9";
      case "heavy":
        return "#d9534f";
      default:
        return "#ffffff";
    }
  };

 // last monday
  const currentOrLastMonday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(today.setDate(diff));
  };

  const lastMonday = currentOrLastMonday();

  // if lastUpdated is before last Monday, make row 50% opacity
  const getRowOpacity = (lastUpdated) => {
    let lastUpdatedDate = new Date(lastUpdated);

    // make last update date 11:59pm
    lastUpdatedDate.setHours(23, 59, 59, 999);

    if (lastUpdatedDate < lastMonday) return 0.5;
    return
  }

  const key = (
    <div style={{ marginBottom: '20px', marginLeft: 80, marginTop: 10 }}>
      <span style={{ backgroundColor: '#5cb85c', padding: '5px', marginRight: '10px' }}>Green = Light</span>
      <span style={{ backgroundColor: '#a9a9a9', padding: '5px', marginRight: '10px' }}>Grey = Medium</span>
      <span style={{ backgroundColor: '#d9534f', padding: '5px' }}>Red = Heavy</span>
    </div>
  );

  return (
    <div
      style={{
        padding: 0,
        fontFamily: "Arial, sans-serif",
        maxWidth: 700,
        overflowX: "auto",
      }}
    >
      {key}
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
              <tr key={storeName} style={{ opacity: getRowOpacity(stores[storeName].lastUpdated) }}>
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
                {Object.keys(stores[storeName]).map((category) => {
                  if (category === "lastUpdated") {
                    const lastUpdated = stores[storeName][category]
                      ? new Date(stores[storeName][category])
                      : null;

                    const dateString = lastUpdated
                      ? lastUpdated.toLocaleString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : null;

                    return (
                      <td
                        key={category}
                        style={{
                          border: "1px solid #ccc",
                          padding: "5px",
                          // if level is null make text color 0.5
                          color: getCellTextColor(stores[storeName][category]),
                          fontWeight:
                            stores[storeName][category] === "light"
                              ? "600"
                              : "normal",
                          backgroundColor: getBackgroundColor(
                            stores[storeName][category]
                          ),
                        }}
                      >
                        {dateString}
                      </td>
                    );
                  }

                  return (
                    <td
                      key={category}
                      style={{
                        border: "1px solid #ccc",
                        padding: "5px",
                        // if level is null make text color 0.5
                        color: getCellTextColor(stores[storeName][category]),
                        fontWeight:
                          stores[storeName][category] === "light"
                            ? "600"
                            : "normal",
                        backgroundColor: getBackgroundColor(
                          stores[storeName][category]
                        ),
                      }}
                    >
                      {category}
                    </td>
                  );
                })}
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
