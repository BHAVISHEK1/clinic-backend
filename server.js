import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const PatientForm = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        contacts: '',
        age: '',
        dateOfentry: '',
        medicalHistory: [],
        doctorName: '',
    });

    const [errors, setErrors] = useState({
        firstName: '',
        contacts: '',
        age: '',
    });

    const validate = () => {
        let isValid = true;
        const newErrors = { firstName: '', contacts: '', age: '' };

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First Name is Required';
            isValid = false;
        }

        if (!/^\d{10}$/.test(formData.contacts)) {
            newErrors.contacts = 'Enter a Valid 10 digit number';
            isValid = false;
        }

        if (!formData.age || formData.age < 1 || formData.age > 101) {
            newErrors.age = 'Enter a valid age not exceeding 101yrs';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            medicalHistory: checked
                ? [...prevData.medicalHistory, name]
                : prevData.medicalHistory.filter((item) => item !== name),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            await axios.post('https://clinic-backend-4.onrender.com/api/patients', formData);
            setFormData({
                firstName: '',
                lastName: '',
                contacts: '',
                age: '',
                dateOfentry: '',
                medicalHistory: [],
                doctorName: '',
            });
            alert('Patient data submitted successfully');
        } catch (error) {
            console.error('Error submitting patient data:', error);
            alert('Error submitting patient data. Please try again later.');
        }
    };

    return (
        <form id="pform" onSubmit={handleSubmit}>
            <div className="left-partition">
                <input
                    placeholder="First Name"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                />
                {errors.firstName && <span style={{ color: 'red' }}>{errors.firstName}</span>}
                <input
                    placeholder="Last Name"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                />
                <div id="dropd">
                    <input
                        type="checkbox"
                        name="bp"
                        checked={formData.medicalHistory.includes('bp')}
                        onChange={handleCheckboxChange}
                    /> BP  <br />
                    <input
                        type="checkbox"
                        name="act"
                        checked={formData.medicalHistory.includes('act')}
                        onChange={handleCheckboxChange}
                    /> ACT <br />
                    <input
                        type="checkbox"
                        name="asthama"
                        checked={formData.medicalHistory.includes('asthama')}
                        onChange={handleCheckboxChange}
                    /> Asthma <br />
                    <input
                        type="checkbox"
                        name="thyroid"
                        checked={formData.medicalHistory.includes('thyroid')}
                        onChange={handleCheckboxChange}
                    /> Thyroid  <br />
                    <input
                        type="checkbox"
                        name="dm"
                        checked={formData.medicalHistory.includes('dm')}
                        onChange={handleCheckboxChange}
                    /> Diabetes   <br />
                    <input
                        type="checkbox"
                        name="pregnancy"
                        checked={formData.medicalHistory.includes('pregnancy')}
                        onChange={handleCheckboxChange}
                    /> Pregnant<br />
                </div>
            </div>
            <div className="right-partition">
                <input
                    placeholder="Contact"
                    type="text"
                    name="contacts"
                    value={formData.contacts}
                    onChange={handleChange}
                />
                {errors.contacts && <span style={{ color: 'red' }}>{errors.contacts}</span>}
                <input
                    placeholder="Age"
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                />
                {errors.age && <span style={{ color: 'red' }}>{errors.age}</span>}
                <input
                    id="date"
                    placeholder="Date"
                    type="date"
                    name="dateOfentry"
                    value={formData.dateOfentry}
                    onChange={handleChange}
                />
                <select
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleChange}
                >
                    <option value="null">Doctor</option>
                    <option value="Dr Ruchi">Dr Ruchi</option>
                    <option value="Dr Renu">Dr Renu</option>
                </select>
                <button type="submit">Submit</button>
            </div>
        </form>
    );
};

export default PatientForm;
