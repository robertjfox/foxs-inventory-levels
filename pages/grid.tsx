import { useState, useEffect } from 'react';

export default function Stores() {
  const [stores, setStores] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data'); // Fetch from API route
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        // alphabetically sort the stores
        const sortedKeys = Object.keys(data).sort();
        const sortedData = sortedKeys.reduce((obj, key) => {
          obj[key] = data[key];
          return obj;
        }, {});

        setStores(sortedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load data. Check the console.');
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
          level: value
        }
      }
    }));
  };

  const saveChanges = async () => {
    const response = await fetch('/api/save-stores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stores)
    });

    if (response.ok) {
      alert('Data saved successfully!');
    } else {
      alert('Failed to save data.');
    }
  };

  if (loading) return <div>Loading...</div>;

  const getBackgroundColor = (level) => {
    switch (level) {
      case 'light':
        return '#d4edda'; // Light green
      case 'medium':
        return '#ffeeba'; // Light yellow
      case 'heavy':
        return '#f8d7da'; // Light red
      default:
        return '#ffffff'; // White
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Editable Store Categories</h1>
      <button
        onClick={saveChanges}
        style={{
          padding: '10px 20px',
          backgroundColor: '#0070f3',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Save Changes
      </button>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'center',
          fontSize: '14px'
        }}
      >
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Store</th>
            {Object.keys(stores[Object.keys(stores)[0]]).map((category) => (
              <th key={category} style={{ border: '1px solid #ccc', padding: '10px' }}>
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
                  border: '1px solid #ccc',
                  padding: '10px',
                  backgroundColor: '#f9f9f9',
                  fontWeight: 'bold'
                }}
              >
                {storeName}
              </td>
              {Object.keys(stores[storeName]).map((category) => (
                <td
                  key={category}
                  style={{
                    border: '1px solid #ccc',
                    padding: '5px',
                    backgroundColor: getBackgroundColor(stores[storeName][category].level)
                  }}
                >
                  <select
                    value={stores[storeName][category].level || ''}
                    onChange={(e) => handleLevelChange(storeName, category, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '5px',
                      borderRadius: '3px',
                      border: '0px solid #ccc',
                      backgroundColor: getBackgroundColor(stores[storeName][category].level)
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
  );
}