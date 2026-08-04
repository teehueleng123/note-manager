const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all quotes
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM quotes ORDER BY created_at DESC');
        return res.json(rows);
    } catch (err) {
        console.error('Error fetching quotes:', err);
        return res.status(500).json({ error: 'Failed to fetch quotes' });
    }
});

// POST a new quote
router.post('/', async (req, res) => {
    try {
        const { quote_text } = req.body;
        if (!quote_text) {
            return res.status(400).json({ error: 'quote_text is required' });
        }
        const [result] = await db.query('INSERT INTO quotes (quote_text) VALUES (?)', [quote_text]);
        const [newQuote] = await db.query('SELECT * FROM quotes WHERE id = ?', [result.insertId]);
        return res.status(201).json(newQuote[0]);
    } catch (err)
    {
        console.error('Error creating quote:', err);
        return res.status(500).json({ error: 'Failed to create quote' });
    }
});

module.exports = router;