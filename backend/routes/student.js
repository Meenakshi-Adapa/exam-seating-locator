const express = require('express');
const router = express.Router();
const Seating = require('../models/Seating');

// @route   GET api/student/search/:rollNumber
// @desc    Get seating info by roll number
// @access  Public
router.get('/search/:rollNumber', async (req, res) => {
    try {
        // Basic rate limits and sanitation should be added
        const rollNumber = req.params.rollNumber.toUpperCase();

        // Pattern validation: ^[0-9A-Z]{10}$
        if (!/^[0-9A-Z]{10}$/.test(rollNumber)) {
            return res.status(400).json({ msg: 'Invalid Roll Number format. Must be 10 alphanumeric characters.' });
        }

        const seating = await Seating.findOne({ rollNumber });

        if (!seating) {
            return res.status(404).json({ msg: 'Seating information not found for this roll number.' });
        }

        res.json(seating);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
