const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const validator = require("validator");

const app = express();
const DB = process.env.DATABASE;
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'build')));


mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10 // Correct option name for connection pooling
});

const dbs = mongoose.connection;

dbs.once('open', () => {
    console.log('Connected to MongoDB');

    const patientSchema = new mongoose.Schema({
        firstName: {
            type: String,
            required: true,
            index: true
        },
        lastName: {
            type: String
        },
        contacts: {
            type: String,
            minlength: 10,
            maxlength: 10
        },
        age: {
            type: Number,
            validate(value) {
                if (value > 101) {
                    throw Error("not valid age")
                }
            }
        },
        dateOfentry: {
            type: Date
        },
        medicalHistory: {
            type: [String],
        },
        doctorName: {
            type: String,
            index: true
        }
    });

    const Patient = mongoose.model('Patient', patientSchema);

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

    app.get('/api/patients/all', async (req, res) => {
        try {
            const patients = await Patient.find();
            res.json(patients);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    });

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

    app.put('/api/patients/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const updatedPatient = await Patient.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
            if (!updatedPatient) {
                return res.status(404).json({ error: 'Patient not found' });
            }
            res.json(updatedPatient);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    });
    

    app.delete('/api/patients/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const deletedPatient = await Patient.findByIdAndDelete(id);
            if (!deletedPatient) {
                return res.status(404).json({ error: 'Patient not found' });
            }
            res.json({ message: `Patient ${deletedPatient.firstName} deleted` });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    });


    app.post('/api/patients/undo-delete/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const deletedPatient = await Patient.findByIdAndDelete(id);
            if (!deletedPatient) {
                return res.status(404).json({ error: 'Patient not found' });
            }
            res.json({ message: `Patient ${deletedPatient.firstName} restored` });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    });
    
    



    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

dbs.on('error', console.error.bind(console, 'MongoDB connection error:'));
