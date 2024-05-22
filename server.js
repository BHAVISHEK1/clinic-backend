// Import required packages
const express = require('express'); // Express.js framework for handling HTTP requests
const mongoose = require('mongoose'); // MongoDB object modeling tool
const bodyParser = require('body-parser'); // Middleware to parse incoming request bodies
const path = require('path'); // Node.js module for working with file paths
require('dotenv').config();

// Initialize Express app
const app = express();
const DB = process.env.DATABASE
const PORT = process.env.PORT || 3000; // Port number, defaulting to 3000 if not provided in environment variables

// Import required packages for CSV handling
const fs = require('fs'); // Node.js file system module
const fastcsv = require('fast-csv'); // CSV parser and serializer

// Route to generate and download CSV file of all patients
app.get('/api/patients/all/csv', async (req, res) => {
    try {
        // Fetch all patients from MongoDB
        const patients = await Patient.find();
        const csvData = [];
         
        // Push headers as the first row of CSV
        csvData.push(Object.keys(patients[0]));

        // Push patient data into CSV rows
        patients.forEach(patient => {
            csvData.push(Object.values(patient));
        });

        // Create a writable stream to write CSV data to a file
        const ws = fs.createWriteStream('patients.csv');
        fastcsv
            .write(csvData, { headers: true }) // Write CSV data with headers
            .on('finish', () => {
                // When CSV writing is complete, send the file as a response for download
                res.download('patients.csv');
            })
            .pipe(ws); // Pipe CSV data to the writable stream
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Connect to MongoDB database
mongoose.connect(DB, { useNewUrlParser: true, useUnifiedTopology: true });
const dbs = mongoose.connection;

// MongoDB connection event handling
dbs.on('error', console.error.bind(console, 'MongoDB connection error:'));
dbs.once('open', () => console.log('Connected to MongoDB'));

// Serve static files from the 'build' directory
app.use(express.static(path.join(__dirname, 'build')));

// Middleware for parsing JSON bodies of HTTP requests
app.use(bodyParser.json());

// Define patient schema and model for MongoDB
const patientSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    contacts: String,
    age: Number,
    dateOfentry: String,
    medicalHistory: [String],
    doctorName: String,
});
const Patient = mongoose.model('Patient', patientSchema); // Create a Patient model from the schema

// API endpoint to add a new patient
app.post('/api/patients', async (req, res) => {
    try {
        // Create a new patient object from the request body and save it to MongoDB
        const patient = new Patient(req.body);
        await patient.save();
        res.status(201).json(patient); // Respond with the created patient object
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// API endpoint to fetch all patients
app.get('/api/patients/all', async (req, res) => {
    try {
        // Fetch all patients from MongoDB and respond with them
        const patients = await Patient.find();
        res.json(patients);
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// API endpoint to search for patients by first name or doctor name
app.get('/api/patients/search', async (req, res) => {
    const { firstName, doctorName } = req.query; // Extract query parameters
    try {
        let patients;
        // Search for patients based on provided query parameters
        if (firstName) {
            patients = await Patient.find({ firstName });
        } else if (doctorName) {
            patients = await Patient.find({ doctorName });
        }
        res.json(patients); // Respond with the found patients
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Start the server and listen for incoming requests
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
