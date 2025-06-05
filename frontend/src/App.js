import React, { useState, useEffect } from "react";
import WaitingList from "./WaitingList";
import NewEntryForm from "./NewEntryForm";

function App() {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const fetchEntries = async () => {
    try {
      const res = await fetch("http://localhost:4000/waiting-list");
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      console.error("Failed to fetch waiting list:", err);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Dental App Scheduler</h1>
      <button onClick={() => setShowForm(true)}>➕ Add New Entry</button>

      {showForm && (
        <div
          style={{
            position: "fixed",
            top: "10%",
            left: "50%",
            transform: "translate(-50%, 0)",
            background: "#fff",
            padding: "2rem",
            border: "1px solid #ccc",
            borderRadius: "10px",
            zIndex: 1000,
            maxHeight: "80vh",
            overflowY: "auto",
            width: "90%",
            maxWidth: "600px",
          }}
        >
          <NewEntryForm
            onSuccess={() => {
              fetchEntries();     // 🔄 Refresh the list
              setShowForm(false); // ✅ Close modal
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <WaitingList entries={entries} />
    </div>
  );
}

export default App;
