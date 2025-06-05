// src/NewEntryForm.js

import React, { useState, useEffect } from "react";
import axios from "axios";

function NewEntryForm({ onSuccess, onCancel }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [appointmentTypes, setAppointmentTypes] = useState([]);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    birthdate: "",
    phone: "",
    whatsapp_number: "",
    preferred_language: "",
    preferred_times: "",
    appointmentTypeId: "",
    providers_needed: "",
    duration: 30,
    status: "open",
    comments: "",
    is_existing_patient: false,
    pain_level: "none",
    swelling: false,
    fever: false,
  });

  useEffect(() => {
    if (searchTerm.length < 2) return;

    const delay = setTimeout(() => {
      axios
        .get(`http://localhost:4000/patients?search=${searchTerm}`)
        .then((res) => setSuggestions(res.data))
        .catch((err) => console.error(err));
    }, 300);

    return () => clearTimeout(delay);
  }, [searchTerm]);

  useEffect(() => {
    axios
      .get("http://localhost:4000/appointment-types")
      .then((res) => setAppointmentTypes(res.data))
      .catch((err) => console.error("Failed to load appointment types", err));
  }, []);

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setSuggestions([]);
    setSearchTerm(`${patient.first_name} ${patient.last_name}`);
    setForm((prev) => ({ ...prev, is_existing_patient: true }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const calculateTriagePoints = () => {
    let points = 0;
    if (form.is_existing_patient) points += 1;

    const selectedType = appointmentTypes.find(t => t.id === form.appointmentTypeId);
    if (selectedType?.name.toLowerCase().includes("bring forward")) points += 1;

    switch (form.pain_level) {
      case "sensitive": points += 1; break;
      case "pain": points += 2; break;
      case "lot": points += 3; break;
    }

    if (form.swelling) points += 2;
    if (form.fever) points += 2;

    return points;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let patientId = selectedPatient?.id;

      if (!patientId) {
        const patientRes = await axios.post("http://localhost:4000/patients", {
          first_name: form.first_name,
          last_name: form.last_name,
          birthdate: form.birthdate,
          phone: form.phone,
          whatsapp_number: form.whatsapp_number,
          preferred_language: form.preferred_language,
          preferred_times: form.preferred_times.split(","),
        });
        patientId = patientRes.data.id;
      }

      const triageScore = calculateTriagePoints();

      await axios.post("http://localhost:4000/waiting-list", {
        patientId,
        appointmentTypeId: form.appointmentTypeId,
        providers_needed: form.providers_needed.split(","),
        duration: Number(form.duration),
        status: form.status,
        comments: form.comments,
        triage: {
          pain_level: form.pain_level,
          swelling_present: form.swelling,
          fever_present: form.fever,
          existing_patient: form.is_existing_patient,
          request_to_bring_forward: appointmentTypes.find(t => t.id === form.appointmentTypeId)?.name.toLowerCase().includes("bring forward"),
        },
      });

      alert("Entry added!");
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert("Failed to add entry.");
    }
  };

  return (
    <div style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: "1rem" }}>
      <h2>New Entry</h2>
      <form onSubmit={handleSubmit}>
        <label>Search Patient:</label><br />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setSelectedPatient(null);
            setForm((prev) => ({ ...prev, is_existing_patient: false }));
          }}
        /><br />
        {suggestions.map((s) => (
          <div key={s.id} onClick={() => handlePatientSelect(s)} style={{ cursor: "pointer", margin: "4px 0" }}>
            {s.first_name} {s.last_name} ({new Date(s.birthdate).toLocaleDateString()})
          </div>
        ))}

        {!selectedPatient && (
          <>
            <label>First Name:</label><br />
            <input name="first_name" onChange={handleChange} /><br />
            <label>Last Name:</label><br />
            <input name="last_name" onChange={handleChange} /><br />
            <label>Birthdate:</label><br />
            <input type="date" name="birthdate" onChange={handleChange} /><br />
            <label>Phone:</label><br />
            <input name="phone" onChange={handleChange} /><br />
            <label>WhatsApp:</label><br />
            <input name="whatsapp_number" onChange={handleChange} /><br />
            <label>Preferred Language:</label><br />
            <input name="preferred_language" onChange={handleChange} /><br />
            <label>Preferred Times (comma separated):</label><br />
            <input name="preferred_times" onChange={handleChange} /><br />
          </>
        )}

        <label>Appointment Type:</label><br />
        <select name="appointmentTypeId" onChange={handleChange} required>
          <option value="">Select type</option>
          {appointmentTypes.map((type) => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select><br />

        <label>Providers Needed (comma separated):</label><br />
        <input name="providers_needed" onChange={handleChange} /><br />
        <label>Duration (min):</label><br />
        <input name="duration" type="number" onChange={handleChange} /><br />
        <label>Status:</label><br />
        <select name="status" onChange={handleChange} defaultValue="open">
          <option value="open">open</option>
          <option value="scheduled">scheduled</option>
        </select><br />
        <label>Comments:</label><br />
        <textarea name="comments" onChange={handleChange} /><br />

        <hr />
        <label><input type="checkbox" name="is_existing_patient" checked={form.is_existing_patient} onChange={handleChange} /> Existing Patient</label><br />

        <label>Pain Level:</label><br />
        <select name="pain_level" onChange={handleChange}>
          <option value="none">No pain</option>
          <option value="sensitive">Sensitive</option>
          <option value="pain">Pain</option>
          <option value="lot">Lot of pain</option>
        </select><br />

        <label><input type="checkbox" name="swelling" checked={form.swelling} onChange={handleChange} /> Swelling</label><br />
        <label><input type="checkbox" name="fever" checked={form.fever} onChange={handleChange} /> Fever</label><br />

        <br />
        <button type="submit">Add to Waiting List</button>
        <button type="button" onClick={onCancel} style={{ marginLeft: "1rem" }}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default NewEntryForm;
