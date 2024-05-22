const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors'); // Import cors package
require('dotenv').config();

const app = express();
const DB = process.env.DATABASE;
const PORT = process.env.PORT || 3000;

// Use CORS middleware
app.use(cors());

// Other imports and configurations

// Connect to MongoDB
mongoose.connect(DB, { useNewUrlParser: true, useUnifiedTopology: true });
const dbs = mongoose.connection;

dbs.on('error', console.error.bind(console, 'MongoDB connection error:'));
dbs.once('open', () => console.log('Connected to MongoDB'));

// Serve static files
app.use(express.static(path.join(__dirname, 'build')));

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

// Define patient schema and model
const patientSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    contacts: String,
    age: Number,
    dateOfentry: String,
    medicalHistory: [String],
    doctorName: String,
});
const Patient = mongoose.model('Patient', patientSchema);

// API endpoint to add a new patient
app.post('/api/patients', async (req, res) => {
    try {
        const patient = new Patient(req.body);
        await patient.save();
        res.status(201).json(patient);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// API endpoint to fetch all patients
app.get('/api/patients/all', async (req, res) => {
    try {
        const patients = await Patient.find();
        res.json(patients);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// API endpoint to search for patients by first name or doctor name
app.get('/api/patients/search', async (req, res) => {
    const { firstName, doctorName } = req.query;
    try {
        let patients;
        if (firstName) {
            patients = await Patient.find({ firstName });
        } else if (doctorName) {
            patients = await Patient.find({ doctorName });
        }
        res.json(patients);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});



// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
