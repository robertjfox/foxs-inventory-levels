import { useState, useEffect } from "react";
import { REQUIRED_FIELDS, FIELD_DISPLAY_NAMES } from "../constants/fields";

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

        // Ensure all stores have standardized fields and sort them
        for (const storeName in sortedData) {
          const storeData = {};

          // Add all required fields in order, using existing data or null as fallback
          REQUIRED_FIELDS.forEach((field) => {
            storeData[field] = sortedData[storeName][field] || null;
          });

          sortedData[storeName] = storeData;
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
    return;
  };

  const key = (
    <div
      style={{
        marginBottom: "20px",
        marginTop: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "10px",
      }}
    >
      <div>
        <span
          style={{
            backgroundColor: "#5cb85c",
            padding: "5px",
            marginRight: "10px",
          }}
        >
          Green = Light
        </span>
        <span
          style={{
            backgroundColor: "#a9a9a9",
            padding: "5px",
            marginRight: "10px",
          }}
        >
          Grey = Medium
        </span>
        <span style={{ backgroundColor: "#d9534f", padding: "5px" }}>
          Red = Heavy
        </span>
      </div>
      <div
        style={{
          display: "flex",
          gap: "10px",
          "@media print": { display: "none" },
        }}
        className="no-print"
      >
        {typeof window !== "undefined" &&
          window.location.hostname === "localhost" && (
            <>
              <button
                onClick={async () => {
                  const emailRecipients = [
                    "buyers@foxs.com",
                    "robert@foxs.com",
                    "bob@foxs.com",
                    "eileen@foxs.com",
                    "carlos@foxs.com",
                  ];

                  const confirmMessage = `Send test email with current inventory data to:\n\n${emailRecipients.join(
                    "\n"
                  )}\n\nContinue?`;

                  if (confirm(confirmMessage)) {
                    try {
                      const response = await fetch("/api/send-email", {
                        method: "POST",
                      });
                      if (response.ok) {
                        alert("Test email sent successfully!");
                      } else {
                        alert(
                          "Failed to send email. Check console for details."
                        );
                        console.error(
                          "Email send failed:",
                          await response.text()
                        );
                      }
                    } catch (error) {
                      alert("Error sending email: " + error.message);
                      console.error("Email error:", error);
                    }
                  }
                }}
                style={{
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#218838")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#28a745")}
              >
                📧 Test Email
              </button>
              <button
                onClick={async () => {
                  if (
                    confirm("Send test text message to Robert (5162824831)?")
                  ) {
                    try {
                      const response = await fetch("/api/send-text?test=true", {
                        method: "POST",
                      });
                      if (response.ok) {
                        alert("Test text sent successfully!");
                      } else {
                        alert(
                          "Failed to send text. Check console for details."
                        );
                        console.error(
                          "Text send failed:",
                          await response.text()
                        );
                      }
                    } catch (error) {
                      alert("Error sending text: " + error.message);
                      console.error("Text error:", error);
                    }
                  }
                }}
                style={{
                  backgroundColor: "#6f42c1",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#5a2d91")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#6f42c1")}
              >
                📱 Test Text
              </button>
              <button
                onClick={() => window.print()}
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#0056b3")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
              >
                🖨️ Print
              </button>
            </>
          )}
      </div>
    </div>
  );

  return (
    <div
      style={{
        padding: 0,
        fontFamily: "Arial, sans-serif",
        maxWidth: 900,
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
              {REQUIRED_FIELDS.map((field) => (
                <th
                  key={field}
                  style={{ border: "1px solid #ccc", padding: "10px" }}
                >
                  {FIELD_DISPLAY_NAMES[field] || field}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.keys(stores).map((storeName) => (
              <tr
                key={storeName}
                style={{
                  opacity: getRowOpacity(stores[storeName].lastUpdated),
                }}
              >
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
                {REQUIRED_FIELDS.map((field) => {
                  if (field === "lastUpdated") {
                    const lastUpdated = stores[storeName][field]
                      ? new Date(stores[storeName][field])
                      : null;

                    const dateString = lastUpdated
                      ? lastUpdated.toLocaleString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : null;

                    return (
                      <td
                        key={field}
                        style={{
                          border: "1px solid #ccc",
                          padding: "5px",
                          color: getCellTextColor(stores[storeName][field]),
                          fontWeight:
                            stores[storeName][field] === "light"
                              ? "600"
                              : "normal",
                          backgroundColor: getBackgroundColor(
                            stores[storeName][field]
                          ),
                        }}
                      >
                        {dateString}
                      </td>
                    );
                  }

                  if (field === "notes") {
                    const notes = stores[storeName][field] || "";

                    return (
                      <td
                        key={field}
                        style={{
                          border: "1px solid #ccc",
                          padding: "8px",
                          color: notes ? "#333" : "#b3b3b3",
                          fontStyle: notes ? "normal" : "italic",
                          minWidth: "200px",
                          maxWidth: "300px",
                          wordWrap: "break-word",
                          whiteSpace: "normal",
                          lineHeight: "1.3",
                        }}
                      >
                        {notes || "No notes"}
                      </td>
                    );
                  }

                  // Handle inventory level fields (apparel, shoes, jewelery, bags)
                  return (
                    <td
                      key={field}
                      style={{
                        border: "1px solid #ccc",
                        padding: "5px",
                        color: getCellTextColor(stores[storeName][field]),
                        fontWeight:
                          stores[storeName][field] === "light"
                            ? "600"
                            : "normal",
                        backgroundColor: getBackgroundColor(
                          stores[storeName][field]
                        ),
                      }}
                    >
                      {FIELD_DISPLAY_NAMES[field] || field}
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
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
