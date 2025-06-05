// src/NewEntryForm.js

import React, { useState, useEffect } from "react";
import axios from "axios";

/**
 * NewEntryForm component for creating new patient and waiting list entries.
 * It includes fields for patient details, appointment preferences, and triage information.
 * @param {object} props - The component's props.
 * @param {function} props.onSuccess - Callback function to execute on successful submission.
 * @param {function} props.onCancel - Callback function to execute when the form is cancelled.
 */
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
    has_whatsapp: false, // Changed from whatsapp_number
    preferred_language: "", // Will be a select
    preferred_times: {}, // Changed to object for matrix
    appointmentTypeId: "",
    providers_needed: [], // Changed to array for checkboxes
    duration: 30,
    // status: "open", // Removed, will be set by backend
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

  /**
   * Handles changes to the preferred times checkboxes.
   * Updates the `form.preferred_times` state object based on the selected day (e.g., 'monday')
   * and period (e.g., 'morning', 'afternoon').
   * The name of the checkbox input is expected in the format 'pt_day_period', e.g., 'pt_monday_morning'.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event from the checkbox.
   */
  const handlePreferredTimesChange = (e) => {
    const { name, checked } = e.target;
    const [, day, period] = name.split('_'); // e.g., pt_monday_morning
    setForm(prevForm => ({
      ...prevForm,
      preferred_times: {
        ...prevForm.preferred_times,
        [day]: {
          ...(prevForm.preferred_times[day] || {}),
          [period]: checked,
        },
      },
    }));
  };

  /**
   * Handles changes to the providers needed checkboxes.
   * Updates the `form.providers_needed` array by adding or removing a provider's code
   * based on whether the checkbox is checked or unchecked.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event from the checkbox.
   */
  const handleProvidersChange = (e) => {
    const { value, checked } = e.target;
    setForm(prevForm => {
      const newProviders = checked
        ? [...prevForm.providers_needed, value]
        : prevForm.providers_needed.filter(p => p !== value);
      return { ...prevForm, providers_needed: newProviders };
    });
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
          has_whatsapp: form.has_whatsapp, // Changed
          preferred_language: form.preferred_language,
          preferred_times: form.preferred_times, // Changed, send object directly
        });
        patientId = patientRes.data.id;
      }

      const triageScore = calculateTriagePoints();

      await axios.post("http://localhost:4000/waiting-list", {
        patientId,
        appointmentTypeId: form.appointmentTypeId,
        providers_needed: form.providers_needed, // Changed, send array directly
        duration: Number(form.duration),
        // status: form.status, // Removed
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
            {/* WhatsApp Checkbox */}
            <input type="checkbox" name="has_whatsapp" checked={form.has_whatsapp} onChange={handleChange} /> <label>Whatsapp</label><br />

            {/* Preferred Language Select */}
            <label>Preferred Language:</label><br />
            <select name="preferred_language" value={form.preferred_language} onChange={handleChange}>
              <option value="">Select Language</option>
              <option value="PAP">PAP</option>
              <option value="NL">NL</option>
              <option value="ES">ES</option>
              <option value="EN">EN</option>
            </select><br />

            {/* Preferred Times Matrix */}
            <label>Preferred Times:</label><br />
            <table>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Morning</th>
                  <th>Afternoon</th>
                </tr>
              </thead>
              <tbody>
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(day => (
                  <tr key={day}>
                    <td>{day.charAt(0).toUpperCase() + day.slice(1)}</td>
                    <td><input type="checkbox" name={`pt_${day}_morning`} checked={form.preferred_times[day]?.morning || false} onChange={handlePreferredTimesChange} /></td>
                    <td><input type="checkbox" name={`pt_${day}_afternoon`} checked={form.preferred_times[day]?.afternoon || false} onChange={handlePreferredTimesChange} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <label>Appointment Type:</label><br />
        <select name="appointmentTypeId" onChange={handleChange} required>
          <option value="">Select type</option>
          {appointmentTypes.map((type) => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select><br />

        {/* Providers Needed Checkboxes */}
        <label>Providers Needed:</label><br />
        {['NG', 'TS', 'EM', 'JF', 'DOM'].map(provider => (
          <label key={provider} style={{ marginRight: '10px' }}>
            <input type="checkbox" name="providers_needed" value={provider} checked={form.providers_needed.includes(provider)} onChange={handleProvidersChange} />
            {provider}
          </label>
        ))}<br />

        <label>Duration (min):</label><br />
        <input name="duration" type="number" value={form.duration} onChange={handleChange} /><br />
        {/* Status Field Removed */}
        <label>Comments:</label><br />
        <textarea name="comments" value={form.comments} onChange={handleChange} /><br />

        <hr />
        <label><input type="checkbox" name="is_existing_patient" checked={form.is_existing_patient} onChange={handleChange} /> Existing Patient</label><br />

        <label>Pain Level:</label><br />
        <select name="pain_level" value={form.pain_level} onChange={handleChange}>
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
