const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const Seating = require('../models/Seating');
const { processImage } = require('../services/ocrService');

// @route   POST api/admin/upload
// @desc    Upload seating plan and extract data via OCR
// @access  Private
router.post('/upload', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }

        const imageUrl = req.file.path;
        const { examDate, block, floor, room } = req.body;

        if (!examDate || !block || !floor || !room) {
            return res.status(400).json({ msg: 'Please provide examDate, block, floor, and room details.' });
        }

        // Call OCR service to extract text from image URL
        const extractedData = await processImage(imageUrl);

        // Save extracted text to DB
        const newRecords = extractedData.map((rollNumber) => ({
            examDate,
            rollNumber,
            block,
            floor,
            room
        }));

        if (newRecords.length > 0) {
            await Seating.insertMany(newRecords);
        }

        res.json({
            msg: 'OCR processed successfully',
            imageUrl,
            extractedCount: newRecords.length,
            rollNumbers: extractedData
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error during upload processing' });
    }
});

// @route   GET api/admin/records
// @desc    Get all seating records
// @access  Private
router.get('/records', auth, async (req, res) => {
    try {
        const records = await Seating.find().sort({ createdAt: -1 });
        res.json(records);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/admin/records/:id
// @desc    Delete a record
// @access  Private
router.delete('/records/:id', auth, async (req, res) => {
    try {
        const record = await Seating.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ msg: 'Record not found' });
        }
        await record.deleteOne();
        res.json({ msg: 'Record removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Record not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
